import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.orgId || !body.categoryId || body.goal == null) {
      return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc" }, { status: 400 });
    }
    const goal = Number(body.goal);
    if (!(goal > 0)) return NextResponse.json({ error: "goal phải > 0" }, { status: 400 });

    const data = await prisma.campaign.create({
      data: {
        title: body.title,
        description: body.description || null,
        goal,
        cover: body.cover || null, // "/uploads/xxx.jpg"
        orgId: body.orgId,
        categoryId: body.categoryId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (e) {
    console.error("Create campaign error:", e);
    return NextResponse.json({ error: "Không tạo được chiến dịch" }, { status: 500 });
  }
}
