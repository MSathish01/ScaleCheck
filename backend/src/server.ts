import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import apiRouter from './routes';
import { CryptoService } from './services/CryptoService';
import { LedgerService } from './services/LedgerService';
import { NotificationService } from './services/NotificationService';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static directory for generated PDF certificates & upload attachments
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'ScaleCheck Legal Metrology Backend API',
    department: 'Department of Consumer Affairs (DoCA)',
    health: '/health',
    endpoints: '/api/v1'
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'ScaleCheck Legal Metrology Backend',
    department: 'Department of Consumer Affairs (DoCA)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/v1', apiRouter);

// Global 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Start server and initialize cryptographic services
const startServer = async () => {
  try {
    // 1. Initialize asymmetric RSA-2048 signing keypair
    CryptoService.initializeKeys();

    // 2. Anchor genesis block if ledger is fresh (safely in background)
    LedgerService.ensureGenesisBlock().catch(err => {
      console.warn('⚠️ [LedgerService] Genesis block deferred check:', err.message);
    });

    // 3. Start periodic background validity check (runs only in non-serverless mode)
    if (!process.env.VERCEL) {
      setTimeout(() => {
        NotificationService.runAutomatedExpiryCheck().catch(err => {
          console.warn('Initial expiry check warning:', err.message);
        });
      }, 5000);

      app.listen(config.port, () => {
        console.log('\n================================================================');
        console.log('🏛️  ScaleCheck — Legal Metrology e-Governance Platform');
        console.log('🇮🇳  Ministry of Consumer Affairs, Food & Public Distribution (DoCA)');
        console.log(`🚀  Server running on http://localhost:${config.port}`);
        console.log(`🛡️  Tamper-Evident Ledger & Cryptographic Verification: ACTIVE`);
        console.log(`🌐  Public Crowd-Verify: http://localhost:${config.port}/api/v1/certificates/verify/:certId`);
        console.log('================================================================\n');
      });
    }
  } catch (error) {
    console.error('Fatal startup error:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

export default app;
