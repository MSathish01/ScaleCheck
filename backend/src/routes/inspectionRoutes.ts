import { Router } from 'express';
import { InspectionController } from '../controllers/inspectionController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.post('/record', authenticateToken, requireRoles('LMO', 'GATC'), InspectionController.recordInspection);
router.put('/:id', authenticateToken, requireRoles('LMO', 'GATC', 'STATE_ADMIN'), InspectionController.updateInspection);
router.post('/sync-offline', authenticateToken, requireRoles('LMO', 'GATC'), InspectionController.syncOfflineBatch);

export default router;
