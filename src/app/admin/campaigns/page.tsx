import { prisma } from "@/lib/prisma";
import ActionsCell from "./ActionsCell";
import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// tiện tạo URL giữ nguyên query hiện tại rồi thay vài key
function buildQS(base: URLSearchParams, patch: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams(base.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null || v === "" || v === "ALL") qs.delete(k);
    else qs.set(k, String(v));
  }
  return `?${qs.toString()}`;
}

export default async function AdminCampaignsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" ? sp.status.toUpperCase() : "ALL";
  const orgId = typeof sp.orgId === "string" ? sp.orgId : "ALL";
  const categoryId = typeof sp.categoryId === "string" ? sp.categoryId : "ALL";

  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = Math.max(1, Number(sp.pageSize ?? 10));
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // where điều kiện
  const where: any = {};
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (["ACTIVE", "DRAFT", "CLOSED", "COMPLETED"].includes(status)) where.status = status;
  if (orgId !== "ALL") where.orgId = orgId;
  if (categoryId !== "ALL") where.categoryId = categoryId;

  // lấy dữ liệu lọc (dropdown)
  const [orgs, categories, total, campaigns] = await Promise.all([
    prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        goal: true,
        cover: true,
        status: true,
        createdAt: true,
      },
      skip,
      take,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const baseQS = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status !== "ALL" ? { status } : {}),
    ...(orgId !== "ALL" ? { orgId } : {}),
    ...(categoryId !== "ALL" ? { categoryId } : {}),
    pageSize: String(pageSize),
  });

  return (
    <main className="container mx-auto px-6 py-8 space-y-4">
      {/* === Header có nút tạo chiến dịch === */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý chiến dịch</h1>
        <Link
          href="/admin/campaigns/new"
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          + Tạo chiến dịch
        </Link>
      </div>

      {/* Bộ lọc */}
      <form method="get" className="flex flex-wrap gap-3 items-center bg-white border rounded p-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tiêu đề…"
          className="border rounded px-3 py-2 w-64"
        />

        <select name="status" defaultValue={status} className="border rounded px-3 py-2">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CLOSED">CLOSED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <select name="orgId" defaultValue={orgId} className="border rounded px-3 py-2">
          <option value="ALL">Tất cả tổ chức</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        <select name="categoryId" defaultValue={categoryId} className="border rounded px-3 py-2">
          <option value="ALL">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select name="pageSize" defaultValue={String(pageSize)} className="border rounded px-3 py-2">
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/trang
            </option>
          ))}
        </select>

        <button className="px-4 py-2 bg-emerald-600 text-white rounded" type="submit">
          Lọc
        </button>

        {(q || status !== "ALL" || orgId !== "ALL" || categoryId !== "ALL" || page !== 1) && (
          <a href="/admin/campaigns" className="px-3 py-2 border rounded">
            Xoá lọc
          </a>
        )}
      </form>

      <div className="text-sm text-slate-600">
        Tổng: <b>{total}</b> chiến dịch • Trang <b>{page}</b>/<b>{totalPages}</b>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Ảnh</th>
            <th className="p-2 border">Tiêu đề</th>
            <th className="p-2 border">Mục tiêu</th>
            <th className="p-2 border">Trạng thái</th>
            <th className="p-2 border">Ngày tạo</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="text-sm">
              <td className="p-2 border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.cover || "/images/sample-cover.jpg"}
                  alt=""
                  className="h-12 w-20 object-cover rounded"
                />
              </td>
              <td className="p-2 border">{c.title}</td>
              <td className="p-2 border">{Number(c.goal).toLocaleString("vi-VN")} đ</td>
              <td className="p-2 border">{c.status}</td>
              <td className="p-2 border">
                {new Intl.DateTimeFormat("vi-VN").format(new Date(c.createdAt))}
              </td>
              <td className="p-2 border">
                <ActionsCell id={c.id} />
              </td>
            </tr>
          ))}

          {campaigns.length === 0 && (
            <tr>
              <td className="p-4 text-center text-slate-500" colSpan={6}>
                Không có chiến dịch nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="flex items-center gap-2 justify-end">
        <Link
          href={buildQS(baseQS, { page: Math.max(1, page - 1) })}
          aria-disabled={page <= 1}
          className={`px-3 py-2 border rounded ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          « Trước
        </Link>
        <span className="px-2 text-sm">
          {page} / {totalPages}
        </span>
        <Link
          href={buildQS(baseQS, { page: Math.min(totalPages, page + 1) })}
          aria-disabled={page >= totalPages}
          className={`px-3 py-2 border rounded ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Sau »
        </Link>
      </div>
    </main>
  );
}
