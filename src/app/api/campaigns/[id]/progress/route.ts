import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { donations: { where: { status: "SUCCEEDED" }, select: { amount: true } } },
    });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const raised = campaign.donations.reduce((s, d) => s + Number(d.amount || 0), 0);
    const goal = Number(campaign.goal || 0);
    const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

    const update = await prisma.progressUpdate.create({
      data: { campaignId: id, percent, content: `Đồng bộ tiến độ: ${percent}%` },
    });

    return NextResponse.json({ percent, raised, update }, { status: 200 });
  } catch (err: any) {
    console.error("Error in progress POST:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
