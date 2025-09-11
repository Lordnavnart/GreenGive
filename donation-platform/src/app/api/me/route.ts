import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, user });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const name = body.name as string | undefined;

  // đổi tên
  if (typeof name === "string") {
    await prisma.user.update({ where: { id: session.sub }, data: { name } });
  }

  // đổi mật khẩu (cần gửi currentPassword + newPassword)
  if (body.currentPassword && body.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    const ok = await verifyPassword(String(body.currentPassword), user.passwordHash);
    if (!ok) return NextResponse.json({ ok: false, error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
    const passwordHash = await hashPassword(String(body.newPassword));
    await prisma.user.update({ where: { id: session.sub }, data: { passwordHash } });
  }

  return NextResponse.json({ ok: true });
}
