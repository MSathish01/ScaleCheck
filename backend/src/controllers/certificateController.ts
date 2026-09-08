import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../db';
import { CryptoService } from '../services/CryptoService';
import { LedgerService } from '../services/LedgerService';
import { PdfService } from '../services/PdfService';
import { NotificationService } from '../services/NotificationService';
import { config } from '../config';

export class CertificateController {
  public static async issueCertificate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { applicationId, validityMonths } = req.body;

      if (!applicationId) {
        res.status(400).json({ success: false, message: 'Application ID is required.' });
        return;
      }

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          instrument: true,
          trader: { include: { profile: true } },
          inspection: true
        }
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      if (!application.inspection) {
        res.status(400).json({ success: false, message: 'Cannot issue certificate: No inspection record found.' });
        return;
      }

      if (application.inspection.result !== 'PASS') {
        res.status(400).json({ success: false, message: 'Cannot issue certificate for failed inspection.' });
        return;
      }

      // Check if already certified
      const existingCert = await prisma.certificate.findUnique({
        where: { applicationId }
      });
      if (existingCert) {
        res.status(400).json({ success: false, message: 'Certificate has already been issued for this application.' });
        return;
      }

      const certCount = await prisma.certificate.count();
      const currentYear = new Date().getFullYear();
      const statePrefix = req.user.state ? req.user.state.substring(0, 2).toUpperCase() : 'IN';
      const certificateNumber = `DOCA-${statePrefix}-${currentYear}-${String(certCount + 101).padStart(5, '0')}`;

      // Validity calculation: standard 12 months or custom specified
      const issueDate = new Date();
      const months = validityMonths ? parseInt(validityMonths, 10) : 12;
      const validityExpiryDate = new Date(issueDate);
      validityExpiryDate.setMonth(validityExpiryDate.getMonth() + months);

      // Canonical payload for cryptographic signing
      const canonicalPayload = {
        certificateNumber,
        instrumentSerial: application.instrument.serialNumber,
        instrumentCategory: application.instrument.category,
        capacity: application.instrument.capacity,
        accuracyClass: application.instrument.accuracyClass,
        issueDate: issueDate.toISOString(),
        validityExpiryDate: validityExpiryDate.toISOString(),
        issuingOfficerId: req.user.id,
        securitySealNumber: application.inspection.securitySealNumber,
        inspectionResult: application.inspection.result
      };

      // Asymmetric signing with Ed25519 / RSA
      const { signature, payloadHash } = CryptoService.signPayload(canonicalPayload);

      // Public verification URL
      const qrPayloadUrl = `${config.frontendUrl}/verify/${certificateNumber}`;

      // Generate Official PDF
      let pdfFilePath: string | null = null;
      try {
        pdfFilePath = await PdfService.generateVerificationCertificate({
          certificateNumber,
          qrPayloadUrl,
          signedPayloadHash: payloadHash,
          issueDate,
          validityExpiryDate,
          officerName: req.user.fullName,
          officerDesignation: req.user.role === 'LMO' ? 'Legal Metrology Officer (Inspector)' : 'GATC Authorized Signatory',
          jurisdiction: req.user.district ? `${req.user.district}, ${req.user.state}` : req.user.state,
          traderName: application.trader.fullName,
          organizationName: application.trader.profile?.organizationName || undefined,
          tradeAddress: application.instrument.installationAddress,
          instrumentSerial: application.instrument.serialNumber,
          instrumentCategory: application.instrument.category,
          makeAndModel: application.instrument.makeAndModel,
          modelApprovalNumber: application.instrument.modelApprovalNumber,
          capacity: application.instrument.capacity,
          accuracyClass: application.instrument.accuracyClass,
          testWeightsUsed: application.inspection.testWeightsUsed,
          securitySealNumber: application.inspection.securitySealNumber,
          observedError: application.inspection.observedError,
          maxPermissibleErrorMpe: application.inspection.maxPermissibleErrorMpe
        });
      } catch (pdfErr) {
        console.error('PDF generation warning:', pdfErr);
      }

      // Persist certificate
      const certificate = await prisma.certificate.create({
        data: {
          certificateNumber,
          instrumentId: application.instrumentId,
          applicationId: application.id,
          inspectionId: application.inspection.id,
          issuingOfficerId: req.user.id,
          issueDate,
          validityExpiryDate,
          verificationStatus: 'VALID',
          digitalSignature: signature,
          publicKeyId: CryptoService.getKeyId(),
          signedPayloadHash: payloadHash,
          qrPayloadUrl,
          pdfFilePath,
          earlyRenewalDiscountApplied: false
        }
      });

      // Update instrument and application
      await prisma.instrument.update({
        where: { id: application.instrumentId },
        data: {
          status: 'VERIFIED',
          lastVerifiedAt: issueDate,
          validityExpiryAt: validityExpiryDate,
          wearRiskScore: 0.1, // Reset drift risk on fresh calibration & stamping
          predictiveAdvisory: 'Freshly calibrated and stamped. Operating at peak legal metrology accuracy.'
        }
      });

      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'CERTIFIED' }
      });

      // Append to tamper-evident ledger
      await LedgerService.appendEntry({
        eventType: 'CERTIFICATE_ISSUED',
        entityType: 'CERTIFICATE',
        entityId: certificate.id,
        payload: {
          certificateNumber: certificate.certificateNumber,
          instrumentSerial: application.instrument.serialNumber,
          issuedTo: application.trader.fullName,
          issuedBy: req.user.fullName,
          validityExpiryDate: validityExpiryDate.toISOString(),
          signedPayloadHash: payloadHash,
          digitalSignature: signature.substring(0, 32) + '...'
        },
        actorId: req.user.id
      });

      // Send trader notification
      await NotificationService.sendNotification({
        userId: application.traderId,
        type: 'CERTIFICATE_READY',
        title: `Digital Certificate Issued: ${certificate.certificateNumber}`,
        message: `Your statutory Legal Metrology Certificate is now active and valid until ${validityExpiryDate.toLocaleDateString('en-IN')}. Download your signed certificate or scan the QR code to verify.`,
        channel: 'EMAIL_STUB'
      });

      res.status(201).json({
        success: true,
        message: 'Cryptographically signed Legal Metrology Certificate successfully issued.',
        data: certificate
      });
    } catch (error: any) {
      console.error('Issue certificate error:', error);
      res.status(500).json({ success: false, message: 'Error issuing certificate.', error: error.message });
    }
  }

  /**
   * PUBLIC CROWD-VERIFICATION ENDPOINT
   * No authentication required.
   * Anyone scanning the physical certificate's QR code hits this endpoint.
   */
  public static async publicVerifyCertificate(req: Request, res: Response): Promise<void> {
    try {
      const certId = String(req.params.certId);

      if (!certId) {
        res.status(400).json({ success: false, message: 'Certificate identifier is required.' });
        return;
      }

      const certificate: any = await prisma.certificate.findFirst({
        where: {
          OR: [
            { certificateNumber: certId },
            { id: certId }
          ]
        },
        include: {
          instrument: true,
          application: {
            include: {
              trader: { select: { fullName: true, profile: true } }
            }
          },
          inspection: true,
          issuingOfficer: {
            select: { fullName: true, role: true, state: true, district: true }
          }
        }
      });

      if (!certificate) {
        res.status(404).json({
          success: false,
          isAuthentic: false,
          message: 'INVALID CERTIFICATE: No official record found in the National Legal Metrology database. This physical certificate or seal may be counterfeit.'
        });
        return;
      }

      // Reconstruct canonical payload to cryptographically test signature
      const canonicalPayload = {
        certificateNumber: certificate.certificateNumber,
        instrumentSerial: certificate.instrument.serialNumber,
        instrumentCategory: certificate.instrument.category,
        capacity: certificate.instrument.capacity,
        accuracyClass: certificate.instrument.accuracyClass,
        issueDate: certificate.issueDate.toISOString(),
        validityExpiryDate: certificate.validityExpiryDate.toISOString(),
        issuingOfficerId: certificate.issuingOfficerId,
        securitySealNumber: certificate.inspection.securitySealNumber,
        inspectionResult: certificate.inspection.result
      };

      const isSignatureValid = CryptoService.verifySignature(canonicalPayload, certificate.digitalSignature);

      const now = new Date();
      const isExpired = new Date(certificate.validityExpiryDate) < now;
      const daysRemaining = Math.max(0, Math.ceil((new Date(certificate.validityExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      res.status(200).json({
        success: true,
        isAuthentic: isSignatureValid,
        signatureIntegrity: isSignatureValid ? 'VALID_AND_UNALTERED' : 'CRYPTOGRAPHIC_MISMATCH',
        status: isExpired ? 'EXPIRED' : certificate.verificationStatus,
        isExpired,
        daysRemaining,
        data: {
          certificateNumber: certificate.certificateNumber,
          issueDate: certificate.issueDate,
          validityExpiryDate: certificate.validityExpiryDate,
          verificationStatus: certificate.verificationStatus,
          signedPayloadHash: certificate.signedPayloadHash,
          publicKeyId: certificate.publicKeyId,
          instrument: {
            serialNumber: certificate.instrument.serialNumber,
            category: certificate.instrument.category,
            makeAndModel: certificate.instrument.makeAndModel,
            modelApprovalNumber: certificate.instrument.modelApprovalNumber,
            capacity: certificate.instrument.capacity,
            accuracyClass: certificate.instrument.accuracyClass,
            installationAddress: certificate.instrument.installationAddress
          },
          owner: {
            name: certificate.application.trader.fullName,
            organization: certificate.application.trader.profile?.organizationName || 'Individual Trader'
          },
          stampingDetails: {
            securitySealNumber: certificate.inspection.securitySealNumber,
            testWeightsUsed: certificate.inspection.testWeightsUsed,
            observedError: certificate.inspection.observedError,
            maxPermissibleErrorMpe: certificate.inspection.maxPermissibleErrorMpe
          },
          issuingAuthority: {
            officerName: certificate.issuingOfficer.fullName,
            designation: certificate.issuingOfficer.role === 'LMO' ? 'Legal Metrology Officer' : 'GATC Authorized Signatory',
            jurisdiction: `${certificate.issuingOfficer.district}, ${certificate.issuingOfficer.state}`
          }
        }
      });
    } catch (error: any) {
      console.error('Public verify error:', error);
      res.status(500).json({ success: false, message: 'Verification lookup failed.', error: error.message });
    }
  }

  public static async downloadPdf(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const certificate: any = await prisma.certificate.findFirst({
        where: {
          OR: [{ id }, { certificateNumber: id }]
        },
        include: {
          instrument: true,
          application: {
            include: { trader: { include: { profile: true } } }
          },
          inspection: true,
          issuingOfficer: true
        }
      });

      if (!certificate) {
        res.status(404).json({ success: false, message: 'Certificate not found.' });
        return;
      }

      // If PDF file exists on disk, stream it; otherwise regenerate
      if (certificate.pdfFilePath && fs.existsSync(certificate.pdfFilePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateNumber}.pdf"`);
        fs.createReadStream(certificate.pdfFilePath).pipe(res);
        return;
      }

      // Regenerate on demand if file was removed
      const generatedPath = await PdfService.generateVerificationCertificate({
        certificateNumber: certificate.certificateNumber,
        qrPayloadUrl: certificate.qrPayloadUrl,
        signedPayloadHash: certificate.signedPayloadHash,
        issueDate: certificate.issueDate,
        validityExpiryDate: certificate.validityExpiryDate,
        officerName: certificate.issuingOfficer.fullName,
        officerDesignation: certificate.issuingOfficer.role === 'LMO' ? 'Legal Metrology Officer' : 'GATC Signatory',
        jurisdiction: `${certificate.issuingOfficer.district}, ${certificate.issuingOfficer.state}`,
        traderName: certificate.application.trader.fullName,
        organizationName: certificate.application.trader.profile?.organizationName || undefined,
        tradeAddress: certificate.instrument.installationAddress,
        instrumentSerial: certificate.instrument.serialNumber,
        instrumentCategory: certificate.instrument.category,
        makeAndModel: certificate.instrument.makeAndModel,
        modelApprovalNumber: certificate.instrument.modelApprovalNumber,
        capacity: certificate.instrument.capacity,
        accuracyClass: certificate.instrument.accuracyClass,
        testWeightsUsed: certificate.inspection.testWeightsUsed,
        securitySealNumber: certificate.inspection.securitySealNumber,
        observedError: certificate.inspection.observedError,
        maxPermissibleErrorMpe: certificate.inspection.maxPermissibleErrorMpe
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateNumber}.pdf"`);
      fs.createReadStream(generatedPath).pipe(res);
    } catch (error: any) {
      console.error('Download PDF error:', error);
      res.status(500).json({ success: false, message: 'Error generating PDF certificate.', error: error.message });
    }
  }
}
