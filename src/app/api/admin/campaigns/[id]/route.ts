import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Lấy 1 campaign kèm org/category và (tuỳ schema) ảnh/updates
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const data = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      org: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },

      // CHỌN 1 TRONG 2 TÙY THEO SCHEMA CỦA BẠN:
      // Nếu trong model Campaign có field `images`:
      images: { select: { id: true, url: true, caption: true, createdAt: true } },
      // Nếu schema của bạn đặt tên khác, ví dụ `campaignImages`,
      // hãy đổi dòng trên thành:
      // campaignImages: { select: { id: true, url: true, caption: true, createdAt: true } },

      // Tùy chọn: nếu có field `updates`
      // updates: { select: { id: true, percent: true, content: true, createdAt: true } },
    } as any, // giúp TS bớt khắt khe nếu bạn comment/bật tắt các dòng trên
  });

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

/**
 * Cập nhật campaign (title/goal/description/cover/orgId/categoryId/status)
 * Body JSON: { title?, goal?, description?, cover?, orgId?, categoryId?, status? }
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const data: any = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.description === "string") data.description = body.description || null;
    if (typeof body.cover === "string") data.cover = body.cover || null;
    if (typeof body.orgId === "string") data.orgId = body.orgId;
    if (typeof body.categoryId === "string") data.categoryId = body.categoryId;
    if (typeof body.status === "string") data.status = body.status;

    if (body.goal != null) {
      const goal = Number(body.goal);
      if (!(goal > 0)) return NextResponse.json({ error: "goal phải > 0" }, { status: 400 });
      data.goal = goal;
    }

    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ data: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Không cập nhật được" }, { status: 400 });
  }
}

/**
 * Xoá campaign
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Không xoá được" }, { status: 400 });
  }
}

/**
 * Hỗ trợ _method override (nếu submit từ form)
 */
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("form")) {
    return NextResponse.json({ error: "Use PATCH/DELETE or form" }, { status: 400 });
  }
  const form = await req.formData();
  const method = String(form.get("_method") || "").toUpperCase();

  if (method === "DELETE") return DELETE(req, ctx);
  if (method === "PATCH") {
    const status = String(form.get("status") || "");
    const body: any = {};
    if (status) body.status = status;
    const fake = new Request(req.url, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return PATCH(fake, ctx);
  }
  return NextResponse.json({ error: "Unsupported _method" }, { status: 400 });
}
