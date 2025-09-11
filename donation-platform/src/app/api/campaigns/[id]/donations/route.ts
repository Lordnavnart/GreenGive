import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const items = await prisma.donation.findMany({
    where: { campaignId: id, status: "success" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      amount: true,
      anonymous: true,
      message: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, items });
}
