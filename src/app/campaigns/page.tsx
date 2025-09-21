import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Hàm tính %
function percent(raised: number, goal: number) {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      donations: { where: { status: "SUCCEEDED" }, select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Danh sách chiến dịch</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => {
          const raised = c.donations.reduce(
            (s, d) => s + Number(d.amount || 0),
            0
          );
          const pct = percent(raised, Number(c.goal || 0));

          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="block border rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
            >
              <img
                src={c.cover || "/images/campaign-placeholder.jpg"}
                alt={c.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 space-y-2">
                <h2 className="font-semibold text-lg">{c.title}</h2>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {c.description}
                </p>

                <div className="h-2 bg-slate-200 rounded">
                  <div
                    className="h-2 bg-emerald-500 rounded"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600">
                  {raised.toLocaleString()} / {Number(c.goal).toLocaleString()} đ
                  ({pct}%)
                </div>
              </div>
            </Link>
          );
        })}

        {campaigns.length === 0 && (
          <p className="text-slate-500">Chưa có chiến dịch nào.</p>
        )}
      </div>
    </main>
  );
}
