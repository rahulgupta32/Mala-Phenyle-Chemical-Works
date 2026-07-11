import { z } from 'zod';

const dbUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

// Safe diagnostics
console.log('--- Env Diagnostics ---');
console.log('DATABASE_URL exists:', !!dbUrl);
if (dbUrl) {
  console.log('DATABASE_URL starts with postgresql:// or postgres://:', dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'));
}
console.log('DIRECT_URL exists:', !!directUrl);
if (directUrl) {
  console.log('DIRECT_URL starts with postgresql:// or postgres://:', directUrl.startsWith('postgresql://') || directUrl.startsWith('postgres://'));
}
console.log('-----------------------');

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid connection string").optional(),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters long"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").default('http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
});

if (!parsed.success) {
  console.error('❌ Environment variable validation failed:', parsed.error.format());
  throw new Error('CRITICAL: Environment variable validation failed. Please check .env values.');
}

export const env = parsed.data;
