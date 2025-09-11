// src/app/campaigns/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FilterBar from "@/components/FilterBar";
import { safeCover } from "@/lib/image";

function vnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

type PageProps = {
  searchParams: {
    q?: string;         // từ khoá
    category?: string;  // slug category
    sort?: "new" | "raised";
  };
};

export default async function CampaignListPage({ searchParams }: PageProps) {
  // --- đọc & chuẩn hoá query ---
  const q = (searchParams.q ?? "").trim();
  const category = (searchParams.category ?? "").trim();
  const sort: "new" | "raised" = searchParams.sort === "raised" ? "raised" : "new";

  // --- categories cho FilterBar ---
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  // --- điều kiện where cho Prisma ---
  // lưu ý filter quan hệ cần { category: { is: { slug: ... } } }
  const where: any = {};
  if (q) where.title = { contains: q };
  if (category) where.category = { is: { slug: category } };

  // --- lấy danh sách campaign cơ bản ---
  const campaigns = await prisma.campaign.findMany({
    where,
    select: {
      id: true,
      title: true,
      cover: true,
      goal: true,
      createdAt: true,
      category: { select: { name: true } },
      org: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" }, // sort bước 1 (mặc định)
  });

  // --- tổng tiền đã nhận cho các campaign này ---
  const sums = await prisma.donation.groupBy({
    by: ["campaignId"],
    where: {
      status: "success",
      campaignId: { in: campaigns.map((c) => c.id) },
    },
    _sum: { amount: true },
  });
  const sumById = new Map(sums.map((s) => [s.campaignId, Number(s._sum.amount ?? 0)]));

  // --- tính raised/goal/% và sort theo lựa chọn ---
  const data = campaigns
    .map((c) => {
      const raised = sumById.get(c.id) ?? 0;
      const goal = Number(c.goal);
      const pct = Math.min(100, Math.round((raised * 100) / Math.max(1, goal)));
      return {
        id: c.id,
        title: c.title,
        cover: c.cover ?? "",
        createdAt: c.createdAt,
        goal,
        raised,
        pct,
        categoryName: c.category?.name ?? "",
        orgName: c.org?.name ?? "",
      };
    })
    .sort((a, b) => {
      if (sort === "raised") return b.raised - a.raised; // nhiều tiền trước
      return b.createdAt.getTime() - a.createdAt.getTime(); // mới nhất trước
    });

  return (
    <main className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold">Chiến dịch</h1>

      {/* Thanh lọc/tìm kiếm (client component) */}
      <FilterBar
        categories={[{ slug: "", name: "Tất cả" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))]}
        defaultQuery={q}
        defaultCategory={category}
        defaultSort={sort}
      />

      {data.length === 0 ? (
        <p className="text-gray-500">Không có kết quả phù hợp.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="group bg-white border rounded-xl overflow-hidden hover:shadow-md transition"
            >
              {/* Ảnh cover với fallback an toàn */}
              <div className="relative h-40 w-full bg-gray-100">
                <Image
                  src={safeCover(c.cover)}
                  alt={c.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{c.orgName || "Chiến dịch cộng đồng"}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <h2 className="font-medium line-clamp-2 group-hover:text-rose-600">
                  {c.title}
                </h2>

                {c.categoryName && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                    {c.categoryName}
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
      )}
    </main>
  );
}
