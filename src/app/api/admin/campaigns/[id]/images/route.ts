import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: danh sách ảnh
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const imgs = await prisma.campaignImage.findMany({
    where: { campaignId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, data: imgs });
}

// POST: thêm ảnh { url, caption? }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body?.url) return NextResponse.json({ ok: false, error: "Thiếu url" }, { status: 400 });
    const created = await prisma.campaignImage.create({
      data: { campaignId: params.id, url: body.url, caption: body.caption },
    });
    return NextResponse.json({ ok: true, data: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
