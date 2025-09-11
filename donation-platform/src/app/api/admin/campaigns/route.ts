import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/campaigns?take=20
export async function GET(req: Request) {
  const url = new URL(req.url);
  const take = Number(url.searchParams.get("take") || 20);
  const data = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      org: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { donations: true } },
    },
  });
  return NextResponse.json({ ok: true, data });
}

// POST /api/admin/campaigns
// body: { title, description?, goal, orgId, categoryId, cover? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, goal, orgId, categoryId } = body;
    if (!title || !goal || !orgId || !categoryId) {
      return NextResponse.json({ ok: false, error: "Thiếu trường bắt buộc" }, { status: 400 });
    }
    const created = await prisma.campaign.create({ data: body });
    return NextResponse.json({ ok: true, data: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
