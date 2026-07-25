import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "markaz-super-secret-key-2026";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}

let adminAuth: Awaited<ReturnType<typeof initAdminAuth>> | null = null;

async function initAdminAuth() {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) return null;
    const { cert, getApps, initializeApp } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    if (getApps().length === 0) {
      initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
    }
    return getAuth();
  } catch {
    return null;
  }
}

async function getAdminAuth() {
  if (adminAuth === null) adminAuth = await initAdminAuth();
  return adminAuth;
}

export async function verifyFirebaseToken(token: string) {
  const auth = await getAdminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    return { userId: decoded.uid, email: decoded.email || "" };
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const fb = await verifyFirebaseToken(token);
  if (fb) return { userId: fb.userId, email: fb.email };

  const jwtPayload = verifyToken(token);
  if (jwtPayload) return { userId: jwtPayload.userId, email: jwtPayload.email };

  return null;
}
