import { Router } from 'express';
import { InstrumentController } from '../controllers/instrumentController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, requireRoles('TRADER'), InstrumentController.createInstrument);
router.get('/my', authenticateToken, requireRoles('TRADER'), InstrumentController.getMyInstruments);
router.get('/all', authenticateToken, requireRoles('LMO', 'GATC', 'STATE_ADMIN', 'CENTRAL_ADMIN'), InstrumentController.getAllInstruments);
router.get('/:id', authenticateToken, InstrumentController.getInstrumentById);

export default router;
