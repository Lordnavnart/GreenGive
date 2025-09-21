// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import CampaignCard from "@/components/CampaignCard";
import Link from "next/link";

/** Next 15: searchParams là Promise */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const catSlug = typeof sp.cat === "string" ? sp.cat : "";

  // Lấy categories
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Điều kiện where
  const where: any = {};
  if (catSlug) where.category = { slug: catSlug };

  // Lấy campaigns
  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      cover: true,
      goal: true,
      org: { select: { name: true, slug: true } },
      donations: {
        where: { status: "SUCCEEDED" },
        select: { amount: true },
      },
    },
  });

  // Chuẩn hoá dữ liệu
  const items = campaigns.map((c) => {
    const raised = c.donations.reduce((sum, d) => sum + Number(d.amount), 0);
    return {
      id: c.id,
      title: c.title,
      cover: c.cover ?? null,
      goal: Number(c.goal),
      raised,
      orgName: c.org?.name ?? null,
      orgSlug: c.org?.slug ?? null,
      badge: undefined as string | undefined,
    };
  });

  return (
    <main className="relative isolate">
      {/* Nền gradient nhẹ */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-white" />

      {/* Hero */}
      <section className="container mx-auto px-6 py-16 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          Kết nối gây quỹ &{" "}
          <span className="text-emerald-600">ủng hộ trực tuyến</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Tiện lợi, tin cậy và minh bạch. Mỗi đóng góp đều được ghi nhận và
          theo dõi minh bạch.
        </p>
        <Link
          href="/campaigns"
          className="shine-btn inline-block mt-4 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow-lg hover:-translate-y-0.5 transition"
        >
          Ủng hộ ngay
        </Link>
      </section>

      {/* Bộ lọc Category */}
      <section className="container mx-auto px-6 mb-10 flex flex-wrap justify-center gap-2">
        <Chip href="/" active={!catSlug} label="Tất cả" />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            href={`/?cat=${encodeURIComponent(cat.slug)}`}
            active={catSlug === cat.slug}
            label={cat.name}
          />
        ))}
      </section>

      {/* Danh sách Campaign */}
      <section className="container mx-auto px-6 pb-16">
        {items.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-16 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 backdrop-blur">
            Chưa có chiến dịch phù hợp.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white shadow hover:shadow-lg transition hover:-translate-y-1"
              >
                <CampaignCard {...c} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/** Component Chip filter */
function Chip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "px-4 py-1.5 rounded-full text-sm font-medium border shadow-sm transition",
        active
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:-translate-y-0.5",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
