import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public Key Discovery (RFC 7517 inspired / Public Trust)
router.get('/public-key', AnalyticsController.getPublicKey);

// Role-based dashboard analytics
router.get('/dashboard', authenticateToken, AnalyticsController.getDashboardStats);

// User notifications
router.get('/notifications', authenticateToken, AnalyticsController.getNotifications);

export default router;
