import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.campaignId || !body?.amount) {
      return NextResponse.json({ error: "Thiếu campaignId hoặc số tiền" }, { status: 400 });
    }

    const donation = await prisma.donation.create({
      data: {
        campaignId: body.campaignId,
        amount: body.amount,
        name: body.name || null,
        message: body.message || null,
        isAnonymous: !!body.isAnonymous,
        method: body.method || "MANUAL",
        status: "SUCCEEDED",
      },
    });

    // ✅ luôn trả JSON
    return NextResponse.json({ data: donation }, { status: 201 });
  } catch (err: any) {
    console.error("Error in donations POST:", err);
    return NextResponse.json({ error: "Lỗi server khi tạo donation" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const q = searchParams.get("q") || undefined;

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (q) where.OR = [{ name: { contains: q } }, { message: { contains: q } }];

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: donations });
  } catch (err: any) {
    console.error("Error in donations GET:", err);
    return NextResponse.json({ error: "Lỗi server khi lấy donations" }, { status: 500 });
  }
}
