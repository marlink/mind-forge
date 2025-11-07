import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  
  // Sentry (optional)
  SENTRY_DSN: z.string().url().optional(),
  
  // App version (optional)
  APP_VERSION: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Validate JWT_SECRET strength in production
if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters in production');
  process.exit(1);
}

export default env;

