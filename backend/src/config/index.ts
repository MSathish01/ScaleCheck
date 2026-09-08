import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'scalecheck_secure_jwt_secret_dev_2026_doca',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'scalecheck_secure_refresh_secret_dev_2026_doca',
  jwtExpiresIn: '24h',
  jwtRefreshExpiresIn: '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mobileUrl: process.env.MOBILE_URL || 'http://localhost:5174',
  keysPath: process.env.KEYS_PATH || (process.env.VERCEL ? '/tmp/keys' : path.resolve(__dirname, '../../keys')),
  uploadsPath: process.env.UPLOADS_PATH || (process.env.VERCEL ? '/tmp/uploads' : path.resolve(__dirname, '../../uploads')),
  certificatesPath: process.env.CERTIFICATES_PATH || (process.env.VERCEL ? '/tmp/uploads/certificates' : path.resolve(__dirname, '../../uploads/certificates'))
};
