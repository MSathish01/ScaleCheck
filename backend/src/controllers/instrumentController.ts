import { Request, Response } from 'express';
import { prisma } from '../db';
import { LedgerService } from '../services/LedgerService';
import { PredictiveService } from '../services/PredictiveService';

export class InstrumentController {
  public static async createInstrument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const {
        serialNumber,
        category,
        makeAndModel,
        modelApprovalNumber,
        capacity,
        accuracyClass,
        installationAddress,
        state,
        district,
        usageIntensity
      } = req.body;

      if (!serialNumber || !category || !makeAndModel || !modelApprovalNumber || !capacity || !accuracyClass) {
        res.status(400).json({ success: false, message: 'All instrument specifications are required.' });
        return;
      }

      const existing = await prisma.instrument.findUnique({ where: { serialNumber } });
      if (existing) {
        res.status(409).json({ success: false, message: 'An instrument with this serial number is already registered.' });
        return;
      }

      // Initial predictive wear analysis
      const predictiveResult = PredictiveService.calculateWearRisk({
        category,
        accuracyClass,
        usageIntensity: usageIntensity || 'MEDIUM'
      });

      const instrument = await prisma.instrument.create({
        data: {
          ownerId: req.user.id,
          serialNumber,
          category,
          makeAndModel,
          modelApprovalNumber,
          capacity,
          accuracyClass,
          installationAddress: installationAddress || `${district}, ${state}`,
          state: state || req.user.state,
          district: district || req.user.district,
          usageIntensity: usageIntensity || 'MEDIUM',
          status: 'UNVERIFIED',
          wearRiskScore: predictiveResult.wearRiskScore,
          predictiveAdvisory: predictiveResult.predictiveAdvisory,
          renewalIncentiveEligible: false
        }
      });

      // Write to verification ledger
      await LedgerService.appendEntry({
        eventType: 'INSTRUMENT_REGISTERED',
        entityType: 'INSTRUMENT',
        entityId: instrument.id,
        payload: {
          instrumentId: instrument.id,
          serialNumber: instrument.serialNumber,
          category: instrument.category,
          capacity: instrument.capacity,
          accuracyClass: instrument.accuracyClass,
          ownerId: req.user.id,
          registeredAt: instrument.createdAt.toISOString()
        },
        actorId: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Instrument successfully registered into Legal Metrology registry.',
        data: instrument
      });
    } catch (error: any) {
      console.error('Create instrument error:', error);
      res.status(500).json({ success: false, message: 'Error registering instrument.', error: error.message });
    }
  }

  public static async getMyInstruments(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const instruments = await prisma.instrument.findMany({
        where: { ownerId: req.user.id },
        include: {
          applications: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          certificates: {
            where: { verificationStatus: 'VALID' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Dynamically enrich each instrument with live predictive wear drift
      const enriched = instruments.map((inst) => {
        const wearAnalysis = PredictiveService.calculateWearRisk({
          category: inst.category,
          accuracyClass: inst.accuracyClass,
          usageIntensity: inst.usageIntensity,
          installationDate: inst.createdAt,
          lastVerifiedAt: inst.lastVerifiedAt,
          validityExpiryAt: inst.validityExpiryAt
        });

        return {
          ...inst,
          liveWearAnalysis: wearAnalysis
        };
      });

      res.status(200).json({ success: true, data: enriched });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving instruments.', error: error.message });
    }
  }

  public static async getAllInstruments(req: Request, res: Response): Promise<void> {
    try {
      const { state, category, status, search } = req.query;

      const whereClause: any = {};
      if (state) whereClause.state = String(state);
      if (category) whereClause.category = String(category);
      if (status) whereClause.status = String(status);
      if (search) {
        whereClause.OR = [
          { serialNumber: { contains: String(search) } },
          { makeAndModel: { contains: String(search) } }
        ];
      }

      const instruments = await prisma.instrument.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              profile: true
            }
          },
          certificates: {
            where: { verificationStatus: 'VALID' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      res.status(200).json({ success: true, data: instruments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error fetching instruments.', error: error.message });
    }
  }

  public static async getInstrumentById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const instrument = await prisma.instrument.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              profile: true
            }
          },
          applications: {
            include: {
              allocatedTo: { select: { fullName: true, role: true } },
              inspection: true,
              certificate: true
            },
            orderBy: { createdAt: 'desc' }
          },
          certificates: {
            orderBy: { issueDate: 'desc' }
          }
        }
      });

      if (!instrument) {
        res.status(404).json({ success: false, message: 'Instrument not found.' });
        return;
      }

      const liveWearAnalysis = PredictiveService.calculateWearRisk({
        category: instrument.category,
        accuracyClass: instrument.accuracyClass,
        usageIntensity: instrument.usageIntensity,
        installationDate: instrument.createdAt,
        lastVerifiedAt: instrument.lastVerifiedAt,
        validityExpiryAt: instrument.validityExpiryAt
      });

      res.status(200).json({
        success: true,
        data: {
          ...instrument,
          liveWearAnalysis
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving instrument.', error: error.message });
    }
  }
}
