import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';
import { Role } from '@prisma/client';

const JWT_SECRET_STR = process.env.JWT_SECRET || 'mala_phenyle_jwt_secret_token_123_change_in_production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STR);

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

// 1. Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(password, hashed);
}

// 2. JWT Management
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Session lasts 7 days
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// 3. Cookie Management
export async function setAuthCookie(payload: JWTPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

// 4. Retrieve Logged-in User
export async function getAuthUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch (e) {
    return null;
  }
}

// 5. Database level User lookup
export async function getDbUser() {
  const session = await getAuthUser();
  if (!session) return null;
  
  return await db.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
    },
  });
}
