import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } }, org: { select: { name: true } } },
    take: 100,
  });
  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const goal = Number(body?.goal || 0);
    const orgId = String(body?.orgId || "");
    const categoryId = String(body?.categoryId || "");
    const cover = (body?.cover as string) || null;
    const description = (body?.description as string) || null;

    if (!title) return NextResponse.json({ error: "Thiếu tiêu đề" }, { status: 400 });
    if (!orgId || !categoryId) {
      return NextResponse.json({ error: "Thiếu tổ chức (orgId) hoặc danh mục (categoryId)" }, { status: 400 });
    }
    if (!(goal > 0)) return NextResponse.json({ error: "Mục tiêu (goal) phải > 0" }, { status: 400 });

    const created = await prisma.campaign.create({
      data: { title, goal, orgId, categoryId, cover, description, status: "ACTIVE" },
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
