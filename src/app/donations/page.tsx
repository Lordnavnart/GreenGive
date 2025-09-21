import Link from "next/link";
import { prisma } from "@/lib/prisma";

type S = {
  campaignId?: string;
  q?: string;
  method?: "STRIPE" | "VNPAY" | "MOMO" | "PAYPAL" | "MANUAL";
  status?: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  min?: string;
  max?: string;
  from?: string; // yyyy-mm-dd
  to?: string;
  page?: string;
  pageSize?: string;
};

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<S>;
}) {
  const sp = await searchParams;

  // lấy danh sách campaign để fill dropdown
  const campaigns = await prisma.campaign.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // build where giống API để truy vấn trực tiếp (trang này render server-side)
  const where: any = {};
  if (sp.campaignId) where.campaignId = sp.campaignId;
  if (sp.q) where.OR = [{ name: { contains: sp.q } }, { message: { contains: sp.q } }];
  if (sp.method) where.method = sp.method;
  if (sp.status) where.status = sp.status;
  if (sp.min || sp.max) {
    where.amount = {};
    if (sp.min) (where.amount as any).gte = Number(sp.min);
    if (sp.max) (where.amount as any).lte = Number(sp.max);
  }
  if (sp.from || sp.to) {
    where.createdAt = {};
    if (sp.from) (where.createdAt as any).gte = new Date(sp.from);
    if (sp.to)   (where.createdAt as any).lte = new Date(sp.to);
  }

  const page = Math.max(1, Number(sp.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(sp.pageSize || 10)));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        campaign: { select: { id: true, title: true } },
      },
    }),
    prisma.donation.count({ where }),
  ]);

  const pages = Math.ceil(total / pageSize);

  // helper tạo URL query
  const q = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v != null && v !== "") as any
  );

  return (
    <main className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Lịch sử quyên góp</h1>

      {/* Form lọc / tìm kiếm (gửi bằng GET) */}
      <form method="GET" className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 rounded border">
        <select name="campaignId" defaultValue={sp.campaignId || ""} className="border px-3 py-2 rounded">
          <option value="">Tất cả chiến dịch</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <input name="q" defaultValue={sp.q || ""} placeholder="Tìm theo tên/lời nhắn"
               className="border px-3 py-2 rounded md:col-span-2" />

        <select name="method" defaultValue={sp.method || ""} className="border px-3 py-2 rounded">
          <option value="">Mọi phương thức</option>
          <option>MANUAL</option><option>MOMO</option><option>VNPAY</option>
          <option>STRIPE</option><option>PAYPAL</option>
        </select>

        <select name="status" defaultValue={sp.status || ""} className="border px-3 py-2 rounded">
          <option value="">Mọi trạng thái</option>
          <option>SUCCEEDED</option><option>PENDING</option>
          <option>FAILED</option><option>REFUNDED</option>
        </select>

        <div className="flex gap-2">
          <input name="min" type="number" defaultValue={sp.min || ""} placeholder="Min"
                 className="border px-3 py-2 rounded w-full" />
          <input name="max" type="number" defaultValue={sp.max || ""} placeholder="Max"
                 className="border px-3 py-2 rounded w-full" />
        </div>

        <div className="flex gap-2">
          <input name="from" type="date" defaultValue={sp.from || ""} className="border px-3 py-2 rounded w-full" />
          <input name="to"   type="date" defaultValue={sp.to || ""}   className="border px-3 py-2 rounded w-full" />
        </div>

        <input type="hidden" name="pageSize" value={pageSize} />

        <div className="md:col-span-6 flex gap-2">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded" type="submit">Lọc</button>
          <a href="/donations" className="px-4 py-2 border rounded">Xóa lọc</a>
        </div>
      </form>

      {/* Bảng kết quả */}
      <div className="overflow-x-auto bg-white rounded border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Ngày</th>
              <th className="p-2 text-left">Chiến dịch</th>
              <th className="p-2 text-left">Người ủng hộ</th>
              <th className="p-2 text-left">Lời nhắn</th>
              <th className="p-2 text-right">Số tiền</th>
              <th className="p-2 text-left">PTTT</th>
              <th className="p-2 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map(d => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{new Date(d.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <Link href={`/campaigns/${d.campaignId}`} className="underline">
                    {d.campaign?.title || d.campaignId}
                  </Link>
                </td>
                <td className="p-2">{d.isAnonymous ? "Ẩn danh" : (d.name || "—")}</td>
                <td className="p-2">{d.message || "—"}</td>
                <td className="p-2 text-right">{Number(d.amount).toLocaleString()} đ</td>
                <td className="p-2">{d.method}</td>
                <td className="p-2">{d.status}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-4 text-center text-slate-500" colSpan={7}>Không có kết quả.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between">
        <div>Tổng: {total}</div>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/donations?${new URLSearchParams({ ...Object.fromEntries(q), page: String(page - 1) })}`}
                  className="px-3 py-1 border rounded">« Trước</Link>
          )}
          <span className="px-3 py-1">Trang {page}/{pages || 1}</span>
          {page < pages && (
            <Link href={`/donations?${new URLSearchParams({ ...Object.fromEntries(q), page: String(page + 1) })}`}
                  className="px-3 py-1 border rounded">Sau »</Link>
          )}
        </div>
      </div>
    </main>
  );
}
