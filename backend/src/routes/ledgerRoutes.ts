import { Router } from 'express';
import { LedgerController } from '../controllers/ledgerController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// Ledger history (available for audit review)
router.get('/', authenticateToken, LedgerController.getLedger);

// Chain integrity validator
router.get('/validate', authenticateToken, LedgerController.validateChain);

// Demonstrator utilities for evaluators/judges
router.post('/simulate-tamper', authenticateToken, requireRoles('CENTRAL_ADMIN'), LedgerController.simulateTamper);
router.post('/repair-chain', authenticateToken, requireRoles('CENTRAL_ADMIN'), LedgerController.repairChain);

export default router;
