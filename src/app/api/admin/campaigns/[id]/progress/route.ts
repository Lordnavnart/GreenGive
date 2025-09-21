import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: danh sách cập nhật tiến độ
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const updates = await prisma.progressUpdate.findMany({
    where: { campaignId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, data: updates });
}

// POST: thêm cập nhật { percent, content? }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const percent = Number(body?.percent);
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      return NextResponse.json({ ok: false, error: "percent phải 0..100" }, { status: 400 });
    }
    const created = await prisma.progressUpdate.create({
      data: { campaignId: params.id, percent, content: body?.content },
    });
    return NextResponse.json({ ok: true, data: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
