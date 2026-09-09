import { Request, Response } from 'express';
import { prisma } from '../db';
import { LedgerService } from '../services/LedgerService';
import { NotificationService } from '../services/NotificationService';

export class ApplicationController {
  public static async submitApplication(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { instrumentId, type, preferredTargetType, preferredDate, remarks } = req.body;

      if (!instrumentId || !type) {
        res.status(400).json({ success: false, message: 'Instrument ID and application type are required.' });
        return;
      }

      const instrument = await prisma.instrument.findUnique({
        where: { id: instrumentId }
      });

      if (!instrument) {
        res.status(404).json({ success: false, message: 'Instrument not found.' });
        return;
      }

      if (instrument.ownerId !== req.user.id) {
        res.status(403).json({ success: false, message: 'You can only apply for instruments you own.' });
        return;
      }

      // Check if there's already an active in-flight application
      const activeApp = await prisma.application.findFirst({
        where: {
          instrumentId,
          status: { in: ['SUBMITTED', 'ALLOCATED', 'SCHEDULED'] }
        }
      });

      if (activeApp) {
        res.status(400).json({
          success: false,
          message: `An active verification application (#${activeApp.applicationNumber}) already exists for this instrument.`
        });
        return;
      }

      // Calculate Statutory Verification Fee (Rules schedule)
      let baseFee = 500.0;
      if (instrument.category.includes('WEIGHBRIDGE')) baseFee = 2500.0;
      else if (instrument.category.includes('FUEL_DISPENSER')) baseFee = 1200.0;
      else if (instrument.category.includes('FLOW_METER')) baseFee = 1500.0;
      else if (instrument.accuracyClass === 'CLASS_I') baseFee = 1000.0;

      // Early-renewal discount incentive (10% rebate if renewing > 30 days before expiry)
      const now = new Date();
      let earlyDiscount = false;
      if (instrument.validityExpiryAt) {
        const daysLeft = Math.ceil((instrument.validityExpiryAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 30) {
          baseFee = baseFee * 0.9;
          earlyDiscount = true;
        }
      }

      const count = await prisma.application.count();
      const applicationNumber = `APP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

      let finalRemarks = remarks || '';
      if (preferredDate) {
        const prefFormatted = new Date(preferredDate).toLocaleString('en-IN');
        finalRemarks = `[Requested Slot: ${prefFormatted}] ${finalRemarks}`.trim();
      }
      if (earlyDiscount) {
        finalRemarks = `${finalRemarks} (Early-renewal incentive applied.)`.trim();
      }

      const application = await prisma.application.create({
        data: {
          applicationNumber,
          type,
          status: 'SUBMITTED',
          traderId: req.user.id,
          instrumentId,
          targetType: preferredTargetType || 'LMO',
          feeAmount: Math.round(baseFee),
          feePaymentStatus: 'PAID',
          feeTransactionRef: `TXN-${Date.now().toString(36).toUpperCase()}`,
          remarks: finalRemarks || null
        },
        include: {
          instrument: true
        }
      });

      // Update instrument status to PENDING_INSPECTION
      await prisma.instrument.update({
        where: { id: instrumentId },
        data: { status: 'PENDING_INSPECTION' }
      });

      // Write to verification ledger
      await LedgerService.appendEntry({
        eventType: 'APPLICATION_SUBMITTED',
        entityType: 'APPLICATION',
        entityId: application.id,
        payload: {
          applicationNumber: application.applicationNumber,
          type: application.type,
          instrumentSerial: instrument.serialNumber,
          traderId: req.user.id,
          feePaid: application.feeAmount,
          earlyDiscountApplied: earlyDiscount
        },
        actorId: req.user.id
      });

      // Send in-app and SMS notification to Trader
      await NotificationService.sendNotification({
        userId: req.user.id,
        type: 'SCHEDULE_UPDATE',
        title: `Verification Application Submitted: ${application.applicationNumber}`,
        message: `Your application for instrument #${instrument.serialNumber} has been received. Statutory fee of ₹${application.feeAmount} paid. Officer allocation in progress.`,
        channel: 'IN_APP'
      });

      // Notify district LMO officers of pending job
      try {
        const districtOfficers = await prisma.user.findMany({
          where: { role: 'LMO', district: instrument.district }
        });
        for (const officer of districtOfficers) {
          await NotificationService.sendNotification({
            userId: officer.id,
            type: 'INSPECTION_ASSIGNED',
            title: `New Verification Application: ${application.applicationNumber}`,
            message: `Trader ${req.user.fullName} submitted verification for #${instrument.serialNumber} (${instrument.makeAndModel})${preferredDate ? ` with preferred slot ${new Date(preferredDate).toLocaleString('en-IN')}` : ''}.`,
            channel: 'IN_APP'
          });
        }
      } catch (errOfficers) {
        console.error('Failed to notify officers:', errOfficers);
      }

      res.status(201).json({
        success: true,
        message: 'Application successfully submitted and payment confirmed.',
        data: application
      });
    } catch (error: any) {
      console.error('Submit application error:', error);
      res.status(500).json({ success: false, message: 'Error submitting application.', error: error.message });
    }
  }

  public static async getMyApplications(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const applications = await prisma.application.findMany({
        where: { traderId: req.user.id },
        include: {
          instrument: true,
          allocatedTo: { select: { fullName: true, role: true, phone: true } },
          certificate: true,
          inspection: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: applications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving applications.', error: error.message });
    }
  }

  public static async getAllocatedApplications(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Return applications allocated to this officer or pending allocation in their district
      const applications = await prisma.application.findMany({
        where: {
          OR: [
            { allocatedToId: req.user.id },
            {
              allocatedToId: null,
              instrument: { district: req.user.district }
            }
          ]
        },
        include: {
          trader: { select: { fullName: true, phone: true, email: true, profile: true } },
          instrument: true,
          inspection: true,
          certificate: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: applications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving allocated jobs.', error: error.message });
    }
  }

  public static async allocateApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, officerId } = req.body;

      if (!applicationId || !officerId) {
        res.status(400).json({ success: false, message: 'Application ID and Officer ID are required.' });
        return;
      }

      const officer = await prisma.user.findUnique({ where: { id: officerId } });
      if (!officer || (officer.role !== 'LMO' && officer.role !== 'GATC')) {
        res.status(400).json({ success: false, message: 'Target assignee must be an active LMO or GATC.' });
        return;
      }

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          allocatedToId: officer.id,
          status: 'ALLOCATED'
        },
        include: {
          instrument: true,
          trader: true
        }
      });

      // Ledger entry
      await LedgerService.appendEntry({
        eventType: 'JOB_ALLOCATED',
        entityType: 'APPLICATION',
        entityId: updated.id,
        payload: {
          applicationNumber: updated.applicationNumber,
          allocatedOfficer: officer.fullName,
          officerRole: officer.role,
          jurisdiction: officer.district
        },
        actorId: req.user?.id
      });

      // Notify officer
      await NotificationService.sendNotification({
        userId: officer.id,
        type: 'INSPECTION_ASSIGNED',
        title: `New Verification Job Allocated: ${updated.applicationNumber}`,
        message: `You have been allocated verification inspection for instrument #${updated.instrument.serialNumber} at ${updated.instrument.installationAddress}.`,
        channel: 'IN_APP'
      });

      res.status(200).json({ success: true, message: 'Job successfully allocated.', data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error allocating job.', error: error.message });
    }
  }

  public static async scheduleApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, scheduledDate, remarks } = req.body;

      if (!applicationId || !scheduledDate) {
        res.status(400).json({ success: false, message: 'Application ID and scheduled date are required.' });
        return;
      }

      const currentApp = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { allocatedTo: true }
      });

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          scheduledDate: new Date(scheduledDate),
          status: 'SCHEDULED',
          remarks: remarks || undefined,
          allocatedToId: currentApp?.allocatedToId || req.user?.id
        },
        include: {
          instrument: true,
          trader: true,
          allocatedTo: { select: { fullName: true, role: true, phone: true } }
        }
      });

      // Ledger entry
      await LedgerService.appendEntry({
        eventType: 'JOB_SCHEDULED',
        entityType: 'APPLICATION',
        entityId: updated.id,
        payload: {
          applicationNumber: updated.applicationNumber,
          scheduledDate: updated.scheduledDate?.toISOString(),
          instrumentSerial: updated.instrument.serialNumber,
          officerName: req.user?.fullName
        },
        actorId: req.user?.id
      });

      // Notify trader
      await NotificationService.sendNotification({
        userId: updated.traderId,
        type: 'SCHEDULE_UPDATE',
        title: `Verification Inspection Scheduled: ${updated.applicationNumber}`,
        message: `Your inspection for instrument #${updated.instrument.serialNumber} has been scheduled for ${new Date(scheduledDate).toLocaleString('en-IN')}${req.user ? ` by Legal Metrology Officer ${req.user.fullName}` : ''}. Please ensure equipment and test weights area are ready.`,
        channel: 'IN_APP'
      });

      res.status(200).json({ success: true, message: 'Inspection date successfully scheduled.', data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error scheduling inspection.', error: error.message });
    }
  }

  public static async getAllApplications(req: Request, res: Response): Promise<void> {
    try {
      const { state, status, type } = req.query;

      const whereClause: any = {};
      if (status) whereClause.status = String(status);
      if (type) whereClause.type = String(type);
      if (state) whereClause.instrument = { state: String(state) };

      const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          trader: { select: { fullName: true, email: true, phone: true, profile: true } },
          instrument: true,
          allocatedTo: { select: { fullName: true, role: true } },
          inspection: true,
          certificate: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      res.status(200).json({ success: true, data: applications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving all applications.', error: error.message });
    }
  }
}
