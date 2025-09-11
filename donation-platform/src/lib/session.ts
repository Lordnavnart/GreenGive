// src/lib/session.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type Session = { sub: string; role?: string } | null;

export async function getSession(): Promise<Session> {
  const cookie = cookies().get("token")?.value;
  if (!cookie) return null;

  try {
    const payload = jwt.verify(cookie, process.env.JWT_SECRET || "secret") as any;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
