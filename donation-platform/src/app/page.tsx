// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// helper format tiền
function vnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default async function Home() {
  // 1) Lấy danh sách campaign (mới nhất trước)
  const campaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      title: true,
      cover: true,
      goal: true,
      createdAt: true,
      org: { select: { name: true, slug: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 9, // Top 9 chiến dịch
  });

  // 2) Lấy tổng tiền đã quyên góp (status=success) theo campaignId, rồi map vào
  const sums = await prisma.donation.groupBy({
    by: ["campaignId"],
    where: { status: "success", campaignId: { in: campaigns.map(c => c.id) } },
    _sum: { amount: true },
  });
  const sumById = new Map(sums.map(s => [s.campaignId, Number(s._sum.amount ?? 0)]));

  // 3) Chuẩn hoá dữ liệu cho view
  const view = campaigns.map(c => {
    const raised = sumById.get(c.id) ?? 0;
    const goal = Number(c.goal);
    const pct = Math.min(100, Math.round((raised * 100) / Math.max(1, goal)));
    return {
      id: c.id,
      title: c.title,
      cover: c.cover,
      goal,
      createdAt: c.createdAt,
      raised,
      pct,
      badge: c.category?.name || undefined,
      orgName: c.org?.name ?? null,
      orgSlug: c.org?.slug ?? null,
    };
  });

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-500 to-rose-600 text-white py-16">
        <div className="container mx-auto px-6 text-center space-y-4">
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-white/20">
            Nền tảng gây quỹ cộng đồng trực tuyến
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold">
            🌱 GreenGive – Chung tay vì cộng đồng
          </h1>
          <p className="max-w-2xl mx-auto text-white/90">
            Khám phá các chiến dịch đang kêu gọi ủng hộ và đóng góp theo cách của bạn.
          </p>
          <div className="pt-2">
            <Link
              href="/campaigns"
              className="inline-block px-4 py-2 bg-white text-rose-600 rounded-lg font-medium hover:bg-rose-50"
            >
              Xem tất cả chiến dịch
            </Link>
          </div>
        </div>
      </section>

      {/* Danh sách chiến dịch */}
      <section className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Chiến dịch nổi bật</h2>
          <Link href="/campaigns" className="text-sm text-rose-600 hover:underline">
            Xem thêm
          </Link>
        </div>

        {view.length === 0 && (
          <p className="text-gray-500">Chưa có chiến dịch nào.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {view.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="group bg-white border rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <div className="relative h-40 w-full bg-gray-100">
                <Image
                  src={
                    c.cover ||
                    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b"
                  }
                  alt={c.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {c.orgName ? (
                      <span>
                        Quỹ: <span className="font-medium">{c.orgName}</span>
                      </span>
                    ) : (
                      <span>Chiến dịch cộng đồng</span>
                    )}
                  </span>
                  <span>
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <h3 className="font-medium line-clamp-2 group-hover:text-rose-600">
                  {c.title}
                </h3>

                {/* badge category */}
                {c.badge && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                    {c.badge}
                  </span>
                )}

                {/* progress mini */}
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-green-600 rounded"
                      style={{ width: `${c.pct}%` }}
                      title={`${c.pct}%`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Đạt: <b>{vnd(c.raised)}</b></span>
                    <span>Mục tiêu: <b>{vnd(c.goal)}</b></span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
