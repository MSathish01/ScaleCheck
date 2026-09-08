import { Request, Response } from 'express';
import { prisma } from '../db';
import { LedgerService } from '../services/LedgerService';
import { NotificationService } from '../services/NotificationService';

export class InspectionController {
  public static async recordInspection(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const {
        applicationId,
        visualCheckPassed,
        repeatabilityCheckPassed,
        eccentricityErrorMm,
        maxPermissibleErrorMpe,
        observedError,
        testWeightsUsed,
        securitySealNumber,
        geoLatitude,
        geoLongitude,
        result,
        officerNotes,
        offlineSyncId,
        photoEvidenceUrl
      } = req.body;

      if (!applicationId || !testWeightsUsed || !securitySealNumber || !result) {
        res.status(400).json({ success: false, message: 'Application ID, test weights, seal number, and result are required.' });
        return;
      }

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { instrument: true, trader: true }
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      // Check if inspection already exists
      const existing = await prisma.inspection.findUnique({
        where: { applicationId }
      });

      if (existing) {
        res.status(400).json({ success: false, message: 'An inspection has already been recorded for this application.' });
        return;
      }

      const inspection = await prisma.inspection.create({
        data: {
          applicationId,
          instrumentId: application.instrumentId,
          inspectorId: req.user.id,
          visualCheckPassed: visualCheckPassed !== undefined ? Boolean(visualCheckPassed) : true,
          repeatabilityCheckPassed: repeatabilityCheckPassed !== undefined ? Boolean(repeatabilityCheckPassed) : true,
          eccentricityErrorMm: eccentricityErrorMm ? parseFloat(eccentricityErrorMm) : null,
          maxPermissibleErrorMpe: maxPermissibleErrorMpe ? parseFloat(maxPermissibleErrorMpe) : null,
          observedError: observedError !== undefined ? parseFloat(observedError) : 0.0,
          testWeightsUsed,
          securitySealNumber,
          geoLatitude: geoLatitude ? parseFloat(geoLatitude) : null,
          geoLongitude: geoLongitude ? parseFloat(geoLongitude) : null,
          result: result.toUpperCase() === 'PASS' ? 'PASS' : 'FAIL',
          officerNotes: officerNotes || null,
          offlineSyncId: offlineSyncId || null,
          photoEvidenceUrl: photoEvidenceUrl || null
        }
      });

      // Update application status
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: result.toUpperCase() === 'PASS' ? 'INSPECTION_COMPLETED' : 'REJECTED',
          rejectionReason: result.toUpperCase() === 'FAIL' ? (officerNotes || 'Failed statutory accuracy verification limits.') : null
        }
      });

      // Append to ledger
      await LedgerService.appendEntry({
        eventType: 'INSPECTION_COMPLETED',
        entityType: 'INSPECTION',
        entityId: inspection.id,
        payload: {
          inspectionId: inspection.id,
          applicationNumber: application.applicationNumber,
          instrumentSerial: application.instrument.serialNumber,
          inspectorId: req.user.id,
          result: inspection.result,
          securitySealNumber: inspection.securitySealNumber,
          observedError: inspection.observedError,
          offlineSynced: Boolean(offlineSyncId)
        },
        actorId: req.user.id
      });

      // Send notification to trader
      await NotificationService.sendNotification({
        userId: application.traderId,
        type: 'SCHEDULE_UPDATE',
        title: `Inspection Completed: ${application.applicationNumber}`,
        message: `Field inspection by ${req.user.fullName} completed with result: ${inspection.result}. Security seal #${inspection.securitySealNumber} applied.`,
        channel: 'SMS_STUB'
      });

      res.status(201).json({
        success: true,
        message: `Inspection recorded successfully with result: ${inspection.result}.`,
        data: inspection
      });
    } catch (error: any) {
      console.error('Record inspection error:', error);
      res.status(500).json({ success: false, message: 'Error recording inspection.', error: error.message });
    }
  }

  public static async syncOfflineBatch(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { inspections } = req.body; // Array of offline recorded inspection objects
      if (!Array.isArray(inspections) || inspections.length === 0) {
        res.status(400).json({ success: false, message: 'Array of inspection payloads is required.' });
        return;
      }

      const syncedIds: string[] = [];
      const errors: any[] = [];

      for (const item of inspections) {
        try {
          // Check if already synced via offlineSyncId
          if (item.offlineSyncId) {
            const existing = await prisma.inspection.findFirst({
              where: { offlineSyncId: item.offlineSyncId }
            });
            if (existing) {
              syncedIds.push(item.offlineSyncId);
              continue;
            }
          }

          const application = await prisma.application.findUnique({
            where: { id: item.applicationId },
            include: { instrument: true }
          });

          if (!application) {
            errors.push({ id: item.offlineSyncId, error: 'Application not found.' });
            continue;
          }

          const inspection = await prisma.inspection.create({
            data: {
              applicationId: item.applicationId,
              instrumentId: application.instrumentId,
              inspectorId: req.user.id,
              visualCheckPassed: item.visualCheckPassed ?? true,
              repeatabilityCheckPassed: item.repeatabilityCheckPassed ?? true,
              eccentricityErrorMm: item.eccentricityErrorMm ? parseFloat(item.eccentricityErrorMm) : null,
              maxPermissibleErrorMpe: item.maxPermissibleErrorMpe ? parseFloat(item.maxPermissibleErrorMpe) : null,
              observedError: item.observedError ? parseFloat(item.observedError) : 0.0,
              testWeightsUsed: item.testWeightsUsed || 'Standard Working Standards',
              securitySealNumber: item.securitySealNumber,
              geoLatitude: item.geoLatitude ? parseFloat(item.geoLatitude) : null,
              geoLongitude: item.geoLongitude ? parseFloat(item.geoLongitude) : null,
              result: item.result || 'PASS',
              officerNotes: item.officerNotes || 'Synced from Mobile Field Offline Storage',
              offlineSyncId: item.offlineSyncId
            }
          });

          await prisma.application.update({
            where: { id: item.applicationId },
            data: { status: item.result === 'PASS' ? 'INSPECTION_COMPLETED' : 'REJECTED' }
          });

          await LedgerService.appendEntry({
            eventType: 'INSPECTION_OFFLINE_SYNCED',
            entityType: 'INSPECTION',
            entityId: inspection.id,
            payload: {
              inspectionId: inspection.id,
              applicationNumber: application.applicationNumber,
              offlineSyncId: item.offlineSyncId,
              syncedAt: new Date().toISOString()
            },
            actorId: req.user.id
          });

          syncedIds.push(item.offlineSyncId);
        } catch (subErr: any) {
          errors.push({ id: item.offlineSyncId, error: subErr.message });
        }
      }

      res.status(200).json({
        success: true,
        message: `Synced ${syncedIds.length} offline inspection(s).`,
        data: { syncedIds, errors }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error syncing offline batch.', error: error.message });
    }
  }
}
