import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend directory if present, then cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  DATABASE_URL: z.string().default('postgresql://dwh_user:dwh_password@localhost:5432/digital_wellness_hub?schema=public'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().default('default_development_jwt_access_secret_do_not_use_in_prod'),
  JWT_REFRESH_SECRET: z.string().default('default_development_jwt_refresh_secret_do_not_use_in_prod'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
}).refine(
  (data) => {
    if (data.NODE_ENV === 'production') {
      const isWeakAccess =
        !data.JWT_ACCESS_SECRET ||
        data.JWT_ACCESS_SECRET.includes('default_development') ||
        data.JWT_ACCESS_SECRET.length < 32;
      const isWeakRefresh =
        !data.JWT_REFRESH_SECRET ||
        data.JWT_REFRESH_SECRET.includes('default_development') ||
        data.JWT_REFRESH_SECRET.length < 32;
      return !isWeakAccess && !isWeakRefresh;
    }
    return true;
  },
  {
    message:
      'In production, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be strong, unique secrets of at least 32 characters and cannot use default dev values.',
  }
);

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = parsedEnv.data;
