import { Router } from 'express';
import authRoutes from './authRoutes';
import instrumentRoutes from './instrumentRoutes';
import applicationRoutes from './applicationRoutes';
import inspectionRoutes from './inspectionRoutes';
import certificateRoutes from './certificateRoutes';
import ledgerRoutes from './ledgerRoutes';
import analyticsRoutes from './analyticsRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/instruments', instrumentRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/inspections', inspectionRoutes);
apiRouter.use('/certificates', certificateRoutes);
apiRouter.use('/ledger', ledgerRoutes);
apiRouter.use('/analytics', analyticsRoutes);

export default apiRouter;
