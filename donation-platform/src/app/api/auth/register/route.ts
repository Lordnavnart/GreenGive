import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
    }

    const existed = await prisma.user.findUnique({ where: { email } });
    if (existed) {
      return NextResponse.json({ ok: false, error: "Email đã tồn tại" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { email, passwordHash, name },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
