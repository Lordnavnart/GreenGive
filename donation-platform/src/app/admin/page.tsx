// src/app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createCampaign, deleteCampaign } from "./actions";

function vnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default async function AdminPage() {
  // ====== Dashboard aggregates ======
  const [donSum, donCount] = await Promise.all([
    prisma.donation.aggregate({
      where: { status: "success" },
      _sum: { amount: true },
    }),
    prisma.donation.count({ where: { status: "success" } }),
  ]);

  // Top 5 campaigns theo số tiền đã nhận
  const grouped = await prisma.donation.groupBy({
    by: ["campaignId"],
    where: { status: "success" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });

  const campaignIds = grouped.map((g) => g.campaignId);
  const campaigns = await prisma.campaign.findMany({
    where: { id: { in: campaignIds } },
    select: { id: true, title: true, goal: true },
  });
  const byId = new Map(campaigns.map((c) => [c.id, c]));

  const top5 = grouped.map((g) => ({
    id: g.campaignId,
    title: byId.get(g.campaignId)?.title ?? "(đã xoá)",
    raised: Number(g._sum.amount ?? 0),
    goal: Number(byId.get(g.campaignId)?.goal ?? 0),
  }));

  // ====== Dữ liệu form tạo mới ======
  const [orgs, cats] = await Promise.all([
    prisma.organization.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ]);

  // ====== Bảng chiến dịch (rút gọn) ======
  const list = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      goal: true,
      org: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { donations: true } },
    },
    take: 50,
  });

  // tổng đã nhận cho từng dòng bảng
  const sumRows = await prisma.donation.groupBy({
    by: ["campaignId"],
    where: { status: "success", campaignId: { in: list.map((l) => l.id) } },
    _sum: { amount: true },
  });
  const rowSumMap = new Map(
    sumRows.map((r) => [r.campaignId, Number(r._sum.amount ?? 0)])
  );

  return (
    <main className="container mx-auto px-6 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold">Admin Dashboard</h1>
        <Link
          href="/"
          className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
        >
          ← Về trang chủ
        </Link>
      </header>

      {/* ==== Cards tổng quan ==== */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-500 text-sm">Tổng tiền đã nhận</p>
          <p className="mt-1 text-2xl font-semibold text-rose-600">
            {vnd(Number(donSum._sum.amount ?? 0))}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-500 text-sm">Tổng lượt quyên góp</p>
          <p className="mt-1 text-2xl font-semibold">{donCount}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-500 text-sm">Số chiến dịch</p>
          <p className="mt-1 text-2xl font-semibold">
            {await prisma.campaign.count()}
          </p>
        </div>
      </section>

      {/* ==== Top 5 ==== */}
      <section className="bg-white border rounded-xl p-4">
        <h2 className="font-medium mb-3">Top 5 chiến dịch theo số tiền</h2>
        {top5.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có dữ liệu.</p>
        ) : (
          <ul className="divide-y">
            {top5.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between">
                <span className="truncate">{t.title}</span>
                <span className="text-sm text-gray-600">
                  {vnd(t.raised)} / mục tiêu {vnd(t.goal)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ==== Form tạo mới ==== */}
      <section className="bg-white border rounded-xl p-4 space-y-4">
        <h2 className="font-medium">Tạo chiến dịch mới</h2>
        <form
          action={createCampaign}
          encType="multipart/form-data"
          className="grid sm:grid-cols-2 gap-3"
        >
          <input
            name="title"
            placeholder="Tiêu đề *"
            className="h-9 px-3 rounded border"
            required
          />
          <input
            name="goal"
            type="number"
            min={1000}
            placeholder="Mục tiêu (đ) *"
            className="h-9 px-3 rounded border"
            required
          />

          {/* Ô upload ảnh từ máy */}
          <input
            type="file"
            name="coverFile"
            accept="image/*"
            className="h-9 px-3 rounded border sm:col-span-2"
          />

          <select name="orgId" className="h-9 px-3 rounded border" required>
            <option value="">-- Chọn tổ chức --</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          <select name="categoryId" className="h-9 px-3 rounded border" required>
            <option value="">-- Chọn danh mục --</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-4 h-9 rounded bg-rose-600 text-white hover:bg-rose-700"
            >
              Tạo chiến dịch
            </button>
          </div>
        </form>
      </section>

      {/* ==== Bảng chiến dịch ==== */}
      <section className="bg-white border rounded-xl p-4">
        <h2 className="font-medium mb-3">Danh sách chiến dịch (mới nhất)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Tiêu đề</th>
                <th className="py-2 pr-3">Tổ chức</th>
                <th className="py-2 pr-3">Danh mục</th>
                <th className="py-2 pr-3">Mục tiêu</th>
                <th className="py-2 pr-3">Đã đạt</th>
                <th className="py-2 pr-3">Lượt ủng hộ</th>
                <th className="py-2 pr-3">Trạng thái</th>
                <th className="py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3">
                    <Link
                      href={`/campaigns/${c.id}`}
                      className="text-rose-600 hover:underline"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{c.org?.name || "—"}</td>
                  <td className="py-2 pr-3">{c.category?.name || "—"}</td>
                  <td className="py-2 pr-3">{vnd(Number(c.goal))}</td>
                  <td className="py-2 pr-3">{vnd(rowSumMap.get(c.id) ?? 0)}</td>
                  <td className="py-2 pr-3">{c._count.donations}</td>
                  <td className="py-2 pr-3">{c.status}</td>
                  <td className="py-2">
                    <form
                      action={async () => {
                        "use server";
                        await deleteCampaign(c.id);
                      }}
                    >
                      <button
                        className="px-2 py-1 rounded border hover:bg-gray-50"
                        type="submit"
                      >
                        Xoá
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500">
                    Chưa có chiến dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
