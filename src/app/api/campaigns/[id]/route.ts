import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const data: any = {};

    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.description === "string") data.description = body.description || null;
    if (typeof body.cover === "string") data.cover = body.cover || null;
    if (typeof body.orgId === "string") data.orgId = body.orgId;
    if (typeof body.categoryId === "string") data.categoryId = body.categoryId;
    if (body.goal != null) {
      const g = Number(body.goal);
      if (!(g > 0)) return NextResponse.json({ error: "goal phải > 0" }, { status: 400 });
      data.goal = g;
    }

    const updated = await prisma.campaign.update({ where: { id: params.id }, data });
    return NextResponse.json({ data: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Không cập nhật được" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Không xoá được" }, { status: 400 });
  }
}
