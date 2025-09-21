import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = { cat?: string };

export default async function Home({
  searchParams,
}: {
  // ⬇️ Next.js 15: searchParams là Promise → cần await
  searchParams: Promise<SearchParams>;
}) {
  const { cat: catSlug } = await searchParams;

  // Danh mục để render bộ lọc
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Lọc theo danh mục (nếu có ?cat=slug)
  const where = catSlug ? { category: { slug: catSlug } } : {};

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      org: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      donations: {
        where: { status: "SUCCEEDED" },
        select: { amount: true },
      },
    },
  });

  return (
    <main className="container mx-auto px-6 py-8 space-y-6">
      {/* Bộ lọc danh mục */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className={`px-3 py-1 rounded border ${
            !catSlug ? "bg-emerald-600 text-white border-emerald-600" : ""
          }`}
        >
          Tất cả
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?cat=${c.slug}`}
            className={`px-3 py-1 rounded border ${
              catSlug === c.slug ? "bg-emerald-600 text-white border-emerald-600" : ""
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Danh sách chiến dịch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.map((c) => {
          const raised = c.donations.reduce(
            (sum, d) => sum + Number(d.amount || 0),
            0
          );
          const goal = Number(c.goal || 0);
          const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

          return (
            <div key={c.id} className="border rounded-2xl overflow-hidden bg-white">
              {/* Ảnh bìa */}
              <img
                src={c.cover || "/placeholder.jpg"}
                alt=""
                className="h-40 w-full object-cover"
              />
              <div className="p-4 space-y-2">
                <div className="text-xs text-slate-500">
                  {c.category?.name} • {c.org?.name}
                </div>
                <div className="font-semibold line-clamp-2 min-h-[3rem]">{c.title}</div>

                <div className="text-sm text-slate-600">
                  {raised.toLocaleString()} / {goal.toLocaleString()} VND
                </div>
                <div className="h-2 bg-slate-200 rounded">
                  <div
                    className="h-2 bg-emerald-500 rounded"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600">{percent}% hoàn thành</div>

                <div className="pt-2 flex gap-2">
                  <Link href={`/campaigns/${c.id}`} className="px-3 py-1 rounded border">
                    Chi tiết
                  </Link>
                  <Link
                    href={`/campaigns/${c.id}#donate`}
                    className="px-3 py-1 rounded bg-emerald-600 text-white"
                  >
                    Quyên góp
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center text-slate-500">Chưa có chiến dịch nào.</div>
      )}
    </main>
  );
}
