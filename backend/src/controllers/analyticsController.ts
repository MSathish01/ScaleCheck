import { Request, Response } from 'express';
import { prisma } from '../db';
import { CryptoService } from '../services/CryptoService';

export class AnalyticsController {
  public static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { role, id, state, district } = req.user;
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // --- TRADER STATS ---
      if (role === 'TRADER') {
        const totalInstruments = await prisma.instrument.count({ where: { ownerId: id } });
        const verifiedInstruments = await prisma.instrument.count({
          where: { ownerId: id, status: 'VERIFIED' }
        });
        const pendingApplications = await prisma.application.count({
          where: { traderId: id, status: { in: ['SUBMITTED', 'ALLOCATED', 'SCHEDULED'] } }
        });
        const expiringSoon = await prisma.instrument.count({
          where: {
            ownerId: id,
            validityExpiryAt: { lte: thirtyDaysFromNow, gte: now }
          }
        });
        const expired = await prisma.instrument.count({
          where: {
            ownerId: id,
            validityExpiryAt: { lt: now }
          }
        });

        res.status(200).json({
          success: true,
          role,
          data: {
            totalInstruments,
            verifiedInstruments,
            pendingApplications,
            expiringSoon,
            expired,
            complianceScore: totalInstruments > 0 ? Math.round((verifiedInstruments / totalInstruments) * 100) : 100
          }
        });
        return;
      }

      // --- LMO / GATC STATS ---
      if (role === 'LMO' || role === 'GATC') {
        const assignedPending = await prisma.application.count({
          where: {
            allocatedToId: id,
            status: { in: ['ALLOCATED', 'SCHEDULED'] }
          }
        });
        const unallocatedInDistrict = await prisma.application.count({
          where: {
            allocatedToId: null,
            instrument: { district }
          }
        });
        const completedInspections = await prisma.inspection.count({
          where: { inspectorId: id }
        });
        const certificatesIssued = await prisma.certificate.count({
          where: { issuingOfficerId: id }
        });

        const passedInspections = await prisma.inspection.count({
          where: { inspectorId: id, result: 'PASS' }
        });
        const failedInspections = await prisma.inspection.count({
          where: { inspectorId: id, result: 'FAIL' }
        });

        res.status(200).json({
          success: true,
          role,
          data: {
            assignedPending,
            unallocatedInDistrict,
            completedInspections,
            certificatesIssued,
            passedInspections,
            failedInspections,
            passRate: (completedInspections > 0) ? Math.round((passedInspections / completedInspections) * 100) : 100
          }
        });
        return;
      }

      // --- STATE ADMIN STATS ---
      if (role === 'STATE_ADMIN') {
        const totalStateInstruments = await prisma.instrument.count({ where: { state } });
        const verifiedStateInstruments = await prisma.instrument.count({
          where: { state, status: 'VERIFIED' }
        });
        const activeOfficers = await prisma.user.count({
          where: { state, role: { in: ['LMO', 'GATC'] } }
        });
        const pendingApplications = await prisma.application.count({
          where: {
            instrument: { state },
            status: { in: ['SUBMITTED', 'ALLOCATED', 'SCHEDULED'] }
          }
        });

        // Group by district
        const instrumentsByDistrict = await prisma.instrument.groupBy({
          by: ['district'],
          where: { state },
          _count: { id: true }
        });

        res.status(200).json({
          success: true,
          role,
          data: {
            totalStateInstruments,
            verifiedStateInstruments,
            complianceRate: totalStateInstruments > 0 ? Math.round((verifiedStateInstruments / totalStateInstruments) * 100) : 100,
            activeOfficers,
            pendingApplications,
            districtBreakdown: instrumentsByDistrict.map((d) => ({
              district: d.district,
              count: d._count.id
            }))
          }
        });
        return;
      }

      // --- CENTRAL ADMIN (DoCA NATIONAL COMMAND) ---
      const totalNationalInstruments = await prisma.instrument.count();
      const verifiedNationalInstruments = await prisma.instrument.count({ where: { status: 'VERIFIED' } });
      const totalCertificates = await prisma.certificate.count();
      const totalLedgerBlocks = await prisma.verificationLedger.count();
      const totalTraders = await prisma.user.count({ where: { role: 'TRADER' } });
      const totalOfficers = await prisma.user.count({ where: { role: { in: ['LMO', 'GATC'] } } });

      // State compliance breakdown
      const stateDistribution = await prisma.instrument.groupBy({
        by: ['state'],
        _count: { id: true }
      });

      // Category distribution
      const categoryDistribution = await prisma.instrument.groupBy({
        by: ['category'],
        _count: { id: true }
      });

      res.status(200).json({
        success: true,
        role: 'CENTRAL_ADMIN',
        data: {
          totalNationalInstruments,
          verifiedNationalInstruments,
          nationalComplianceRate: totalNationalInstruments > 0 ? Math.round((verifiedNationalInstruments / totalNationalInstruments) * 100) : 100,
          totalCertificates,
          totalLedgerBlocks,
          totalTraders,
          totalOfficers,
          stateDistribution: stateDistribution.map((s) => ({ state: s.state, count: s._count.id })),
          categoryDistribution: categoryDistribution.map((c) => ({ category: c.category, count: c._count.id }))
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving analytics.', error: error.message });
    }
  }

  public static async getPublicKey(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        keyId: CryptoService.getKeyId(),
        algorithm: 'SHA256withRSA',
        format: 'X.509 PEM',
        publicKeyPem: CryptoService.getPublicKeyPem(),
        issuedBy: 'Government of India, Department of Consumer Affairs (Legal Metrology Division)'
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving public key.', error: error.message });
    }
  }

  public static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving notifications.', error: error.message });
    }
  }
}
