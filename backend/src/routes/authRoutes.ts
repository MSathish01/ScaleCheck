import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.getMe);
router.get('/officers', authenticateToken, requireRoles('STATE_ADMIN', 'CENTRAL_ADMIN', 'LMO', 'GATC'), AuthController.getOfficers);

export default router;
