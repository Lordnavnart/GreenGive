// src/app/admin/donations/page.tsx
import { prisma } from "@/lib/prisma";

function vnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default async function AdminDonationsPage({
  searchParams,
}: { searchParams: { campaignId?: string; status?: string } }) {
  const where: any = {};
  if (searchParams.campaignId) where.campaignId = searchParams.campaignId;
  if (searchParams.status) where.status = searchParams.status;

  const donations = await prisma.donation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      amount: true,
      anonymous: true,
      message: true,
      method: true,
      status: true,
      createdAt: true,
      campaign: { select: { title: true } },
    },
  });

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Admin · Donations</h1>

      <div className="text-sm text-gray-600 mb-4">
        Có thể lọc bằng query: <code>?campaignId=&lt;id&gt;&amp;status=success|pending|failed</code>
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Chiến dịch</th>
              <th className="p-3">Số tiền</th>
              <th className="p-3">PTTT</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ghi chú</th>
              <th className="p-3">Ẩn danh</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(d => (
              <tr key={d.id} className="border-t">
                <td className="p-3">{new Date(d.createdAt).toLocaleString("vi-VN")}</td>
                <td className="p-3">{d.campaign?.title ?? "—"}</td>
                <td className="p-3 font-medium">{vnd(Number(d.amount))}</td>
                <td className="p-3">{d.method}</td>
                <td className="p-3">{d.status}</td>
                <td className="p-3">{d.message ?? "—"}</td>
                <td className="p-3">{d.anonymous ? "✅" : "❌"}</td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={7}>Không có dữ liệu.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
