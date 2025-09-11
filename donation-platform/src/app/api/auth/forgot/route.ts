import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true }); // tránh lộ thông tin

  // tạo token hết hạn sau 30 phút
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: expires },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset?token=${token}`;

  // Trong dev: trả về link để bạn bấm luôn. Deploy thật thì gửi email.
  return NextResponse.json({ ok: true, resetLink });
}
