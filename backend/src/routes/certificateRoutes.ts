import { Router } from 'express';
import { CertificateController } from '../controllers/certificateController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// Public crowd-verification endpoint (NO AUTH REQUIRED)
router.get('/verify/:certId', CertificateController.publicVerifyCertificate);

// Public or authorized PDF certificate download
router.get('/:id/pdf', CertificateController.downloadPdf);

// Officer certificate issuance
router.post('/issue', authenticateToken, requireRoles('LMO', 'GATC'), CertificateController.issueCertificate);

export default router;
