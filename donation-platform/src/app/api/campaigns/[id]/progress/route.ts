import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // Lấy campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true, goal: true, title: true },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Không tìm thấy campaign" }, { status: 404 });
  }

  // Tổng tiền đã quyên góp (status=success)
  const agg = await prisma.donation.aggregate({
    where: { campaignId: id, status: "success" },
    _sum: { amount: true },
  });

  const raised = agg._sum.amount ?? 0;
  const percent = Math.min(100, Math.round((raised * 100) / campaign.goal));

  return NextResponse.json({
    ok: true,
    campaignId: campaign.id,
    title: campaign.title,
    goal: campaign.goal,
    raised,
    percent,
  });
}
