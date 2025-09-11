import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const c = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { CampaignImage: true, ProgressUpdate: true }, // nếu muốn xem luôn
  });
  if (!c) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data: c });
}

// PUT: thay toàn bộ trường (tiêu đề, mô tả, goal, cover, orgId, categoryId, status)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.campaign.update({ where: { id: params.id }, data: body });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// PATCH: đóng chiến dịch (status = CLOSED) hoặc đổi status nhanh
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const status = body?.status ?? "CLOSED";
    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
