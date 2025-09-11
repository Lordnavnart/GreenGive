// src/lib/campaign.ts
import { prisma } from "./prisma";

export async function getCampaignWithProgress(id: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return null;

  const agg = await prisma.donation.aggregate({
    where: { campaignId: id, status: "success" },
    _sum: { amount: true },
  });

  const raised = agg._sum.amount ?? 0;
  const percent = Math.min(100, Math.round((raised * 100) / campaign.goal));

  return { campaign, raised, percent };
}
