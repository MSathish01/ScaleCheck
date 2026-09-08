import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, requireRoles('TRADER'), ApplicationController.submitApplication);
router.get('/my', authenticateToken, requireRoles('TRADER'), ApplicationController.getMyApplications);
router.get('/allocated', authenticateToken, requireRoles('LMO', 'GATC'), ApplicationController.getAllocatedApplications);
router.get('/all', authenticateToken, requireRoles('STATE_ADMIN', 'CENTRAL_ADMIN'), ApplicationController.getAllApplications);
router.post('/allocate', authenticateToken, requireRoles('STATE_ADMIN', 'CENTRAL_ADMIN', 'LMO', 'GATC'), ApplicationController.allocateApplication);
router.post('/schedule', authenticateToken, requireRoles('LMO', 'GATC'), ApplicationController.scheduleApplication);

export default router;
