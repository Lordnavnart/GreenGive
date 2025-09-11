// src/lib/session.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type Session = { sub: string; role?: string } | null;

export function getSession(): Session {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return payload as any; // { sub: userId, role?: 'ADMIN' | 'USER' | ... }
  } catch {
    return null;
  }
}
