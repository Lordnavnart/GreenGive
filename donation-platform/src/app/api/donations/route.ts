import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/donations?campaignId=xxx
export async function GET(req: Request) {
  const url = new URL(req.url);
  const campaignId = url.searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ ok: false, error: "Thiếu campaignId" }, { status: 400 });
  }

  const donations = await prisma.donation.findMany({
    where: { campaignId, status: "success" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ ok: true, donations });
}

// POST /api/donations
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, amount, anonymous, message, method } = body;

    if (!campaignId || !amount) {
      return NextResponse.json({ ok: false, error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      return NextResponse.json({ ok: false, error: "Không tìm thấy campaign" }, { status: 404 });
    }

    const donation = await prisma.donation.create({
      data: {
        campaignId,
        amount: Number(amount),
        anonymous: Boolean(anonymous),
        message: message || null,
        method: (method as any) || "MANUAL",
        status: "success", // mock để test
      },
    });

    return NextResponse.json({ ok: true, donation }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Server error" }, { status: 500 });
  }
}
