import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: false, error: "Sai email/mật khẩu" }, { status: 401 });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ ok: false, error: "Sai email/mật khẩu" }, { status: 401 });

  await createSession({ sub: user.id, email: user.email, role: user.role });

  return NextResponse.json({ ok: true });
}
