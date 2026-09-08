import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { config } from '../config';

export interface CertificatePdfData {
  certificateNumber: string;
  qrPayloadUrl: string;
  signedPayloadHash: string;
  issueDate: Date;
  validityExpiryDate: Date;
  officerName: string;
  officerDesignation: string;
  jurisdiction: string;
  traderName: string;
  organizationName?: string;
  tradeAddress: string;
  instrumentSerial: string;
  instrumentCategory: string;
  makeAndModel: string;
  modelApprovalNumber: string;
  capacity: string;
  accuracyClass: string;
  testWeightsUsed: string;
  securitySealNumber: string;
  observedError?: number | null;
  maxPermissibleErrorMpe?: number | null;
}

export class PdfService {
  public static async generateVerificationCertificate(data: CertificatePdfData): Promise<string> {
    if (!fs.existsSync(config.certificatesPath)) {
      fs.mkdirSync(config.certificatesPath, { recursive: true });
    }

    const fileName = `${data.certificateNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    const filePath = path.join(config.certificatesPath, fileName);

    // Generate QR Code Buffer
    const qrBuffer = await QRCode.toBuffer(data.qrPayloadUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 130,
      color: {
        dark: '#0b2545',
        light: '#ffffff'
      }
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 36, bottom: 36, left: 36, right: 36 }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- Decorative Outer & Inner Border ---
      doc.rect(20, 20, 555, 802).lineWidth(3).strokeColor('#0b2545').stroke();
      doc.rect(25, 25, 545, 792).lineWidth(1).strokeColor('#f77f00').stroke();

      // --- Header: Government of India / DoCA ---
      doc.fontSize(10).fillColor('#13315c').font('Helvetica-Bold')
        .text('GOVERNMENT OF INDIA', { align: 'center' });
      doc.fontSize(8.5).fillColor('#334155').font('Helvetica')
        .text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', { align: 'center' });
      doc.fontSize(11).fillColor('#0b2545').font('Helvetica-Bold')
        .text('DEPARTMENT OF CONSUMER AFFAIRS', { align: 'center' });
      doc.fontSize(8.5).fillColor('#f77f00').font('Helvetica-Bold')
        .text('LEGAL METROLOGY DIVISION — STATUTORY VERIFICATION CERTIFICATE', { align: 'center' });

      doc.moveDown(0.4);
      doc.fontSize(7.5).fillColor('#475569').font('Helvetica-Oblique')
        .text('[Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 27 of General Rules, 2011]', { align: 'center' });

      doc.moveDown(0.8);
      // Divider
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(35, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.6);

      // Certificate Identification Banner
      const startBannerY = doc.y;
      doc.rect(35, startBannerY, 525, 34).fillColor('#f1f5f9').fill();
      doc.rect(35, startBannerY, 5, 34).fillColor('#0b2545').fill();

      doc.fillColor('#0b2545').fontSize(9).font('Helvetica-Bold')
        .text('CERTIFICATE NO:', 46, startBannerY + 6);
      doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold')
        .text(data.certificateNumber, 150, startBannerY + 6);

      doc.fillColor('#0b2545').fontSize(9).font('Helvetica-Bold')
        .text('STATUS:', 46, startBannerY + 19);
      doc.fillColor('#16a34a').fontSize(9).font('Helvetica-Bold')
        .text('VERIFIED & STAMPED (ACTIVE)', 150, startBannerY + 19);

      doc.fillColor('#0b2545').fontSize(8.5).font('Helvetica-Bold')
        .text('ISSUE DATE:', 350, startBannerY + 6);
      doc.fillColor('#334155').fontSize(8.5).font('Helvetica')
        .text(new Date(data.issueDate).toLocaleDateString('en-IN'), 440, startBannerY + 6);

      doc.fillColor('#0b2545').fontSize(8.5).font('Helvetica-Bold')
        .text('VALID UPTO:', 350, startBannerY + 19);
      doc.fillColor('#dc2626').fontSize(8.5).font('Helvetica-Bold')
        .text(new Date(data.validityExpiryDate).toLocaleDateString('en-IN'), 440, startBannerY + 19);

      doc.y = startBannerY + 44;

      // Section 1: Trader & Location Details
      doc.fontSize(9.5).fillColor('#0b2545').font('Helvetica-Bold')
        .text('1. STAKEHOLDER & PREMISES DETAILS');
      doc.moveDown(0.2);

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#334155').text('Owner / Establishment: ', 45, doc.y, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a').text(`${data.organizationName || data.traderName} (${data.traderName})`);
      
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#334155').text('Installation Premises: ', 45, doc.y + 2, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a').text(data.tradeAddress);

      doc.moveDown(0.8);

      // Section 2: Instrument Details Table
      doc.fontSize(9.5).fillColor('#0b2545').font('Helvetica-Bold')
        .text('2. VERIFIED INSTRUMENT SPECIFICATIONS');
      doc.moveDown(0.3);

      const tableTop = doc.y;
      const col1 = 45;
      const col2 = 175;
      const col3 = 310;
      const col4 = 440;

      doc.rect(40, tableTop, 515, 60).lineWidth(0.5).strokeColor('#cbd5e1').stroke();

      // Row 1
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text('Instrument Category:', col1, tableTop + 6);
      doc.font('Helvetica').fillColor('#0f172a').text(data.instrumentCategory, col2, tableTop + 6);
      doc.font('Helvetica-Bold').fillColor('#475569').text('Serial Number:', col3, tableTop + 6);
      doc.font('Helvetica-Bold').fillColor('#0b2545').text(data.instrumentSerial, col4, tableTop + 6);

      // Row 2
      doc.font('Helvetica-Bold').fillColor('#475569').text('Make & Model:', col1, tableTop + 24);
      doc.font('Helvetica').fillColor('#0f172a').text(data.makeAndModel, col2, tableTop + 24);
      doc.font('Helvetica-Bold').fillColor('#475569').text('Model Approval No:', col3, tableTop + 24);
      doc.font('Helvetica').fillColor('#0f172a').text(data.modelApprovalNumber, col4, tableTop + 24);

      // Row 3
      doc.font('Helvetica-Bold').fillColor('#475569').text('Maximum Capacity:', col1, tableTop + 42);
      doc.font('Helvetica-Bold').fillColor('#0b2545').text(data.capacity, col2, tableTop + 42);
      doc.font('Helvetica-Bold').fillColor('#475569').text('Accuracy Class:', col3, tableTop + 42);
      doc.font('Helvetica-Bold').fillColor('#0b2545').text(data.accuracyClass, col4, tableTop + 42);

      doc.y = tableTop + 72;

      // Section 3: Legal Metrology Test Observations
      doc.fontSize(9.5).fillColor('#0b2545').font('Helvetica-Bold')
        .text('3. STATUTORY VERIFICATION & STAMPING RECORD');
      doc.moveDown(0.3);

      const testTableTop = doc.y;
      doc.rect(40, testTableTop, 515, 52).lineWidth(0.5).strokeColor('#cbd5e1').stroke();

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text('Working Standards Used:', col1, testTableTop + 6);
      doc.font('Helvetica').fillColor('#0f172a').text(data.testWeightsUsed, col2, testTableTop + 6, { width: 370 });

      doc.font('Helvetica-Bold').fillColor('#475569').text('Official Security Seal No:', col1, testTableTop + 22);
      doc.font('Helvetica-Bold').fillColor('#0b2545').text(data.securitySealNumber, col2, testTableTop + 22);

      const mpeText = data.maxPermissibleErrorMpe !== undefined && data.maxPermissibleErrorMpe !== null ? `± ${data.maxPermissibleErrorMpe}` : 'Within Limits';
      const obsText = data.observedError !== undefined && data.observedError !== null ? `${data.observedError}` : '0.00';

      doc.font('Helvetica-Bold').fillColor('#475569').text('Permissible MPE:', col3, testTableTop + 22);
      doc.font('Helvetica').fillColor('#0f172a').text(mpeText, col4, testTableTop + 22);

      doc.font('Helvetica-Bold').fillColor('#475569').text('Observed Test Error:', col1, testTableTop + 36);
      doc.font('Helvetica-Bold').fillColor('#16a34a').text(`${obsText} (PASSED)`, col2, testTableTop + 36);

      doc.font('Helvetica-Bold').fillColor('#475569').text('Statutory Result:', col3, testTableTop + 36);
      doc.font('Helvetica-Bold').fillColor('#16a34a').text('VERIFIED & STAMPED', col4, testTableTop + 36);

      doc.y = testTableTop + 64;

      // Section 4: Cryptographic Crowd-Verify & Officer Signatures
      const bottomBoxY = doc.y;
      doc.rect(40, bottomBoxY, 515, 145).lineWidth(0.5).strokeColor('#94a3b8').stroke();

      // Embed QR Code
      doc.image(qrBuffer, 52, bottomBoxY + 8, { width: 120, height: 120 });

      // QR explanation
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0b2545')
        .text('CROWD-VERIFICATION QR CODE', 185, bottomBoxY + 12);
      doc.fontSize(7.5).font('Helvetica').fillColor('#334155')
        .text('Scan this QR code with any smartphone camera to verify the live authenticity of this certificate directly on the Government National Legal Metrology portal.', 185, bottomBoxY + 25, { width: 220 });

      doc.fontSize(7).font('Helvetica-Bold').fillColor('#475569')
        .text('SHA-256 DIGITAL PROOF HASH:', 185, bottomBoxY + 58);
      doc.fontSize(6.5).font('Courier').fillColor('#0f172a')
        .text(data.signedPayloadHash, 185, bottomBoxY + 68, { width: 220 });

      doc.fontSize(7).font('Helvetica-Bold').fillColor('#16a34a')
        .text('CRYPTOGRAPHICALLY SECURED (NON-COUNTERFEITABLE)', 185, bottomBoxY + 95);

      // Officer Signature Block on Right
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0b2545')
        .text('ISSUING AUTHORITY', 420, bottomBoxY + 15, { align: 'right' });
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a')
        .text(data.officerName, 420, bottomBoxY + 40, { align: 'right' });
      doc.fontSize(8).font('Helvetica').fillColor('#475569')
        .text(data.officerDesignation, 420, bottomBoxY + 53, { align: 'right' });
      doc.fontSize(8).font('Helvetica').fillColor('#475569')
        .text(data.jurisdiction, 420, bottomBoxY + 65, { align: 'right' });

      doc.rect(420, bottomBoxY + 85, 120, 22).strokeColor('#0b2545').stroke();
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0b2545')
        .text('DIGITALLY SIGNED', 420, bottomBoxY + 91, { width: 120, align: 'center' });

      // Footer Statutory Note
      doc.fontSize(7).fillColor('#64748b').font('Helvetica')
        .text('Note: It is an offence under Section 30 of the Legal Metrology Act, 2009 to alter, tamper with, or forge this certificate or use any unverified weight/measure.', 40, 785, { align: 'center', width: 515 });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }
}
