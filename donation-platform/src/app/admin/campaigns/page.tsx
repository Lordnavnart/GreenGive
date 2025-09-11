import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { org: { select: { name: true } }, category: { select: { name: true } } },
  });

  return (
    <main className="container mx-auto px-6 py-12 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý chiến dịch</h1>
        <Link href="/admin/campaigns/new" className="px-3 py-2 rounded bg-green-600 text-white">+ Tạo mới</Link>
      </header>

      <table className="w-full bg-white border rounded-xl overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Tiêu đề</th>
            <th className="p-3 text-left">Tổ chức</th>
            <th className="p-3 text-left">Danh mục</th>
            <th className="p-3 text-left">Trạng thái</th>
            <th className="p-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-3">{c.title}</td>
              <td className="p-3">{c.org?.name || "-"}</td>
              <td className="p-3">{c.category?.name || "-"}</td>
              <td className="p-3">{c.status}</td>
              <td className="p-3 text-right space-x-2">
                <Link href={`/admin/campaigns/${c.id}/edit`} className="px-2 py-1 border rounded">Sửa</Link>
                <form action={`/api/admin/campaigns/${c.id}`} method="post" className="inline"
                      onSubmit={(e:any)=>{ if(!confirm("Đóng chiến dịch?")) e.preventDefault(); }}>
                  <input type="hidden" name="_method" value="PATCH" />
                  <button formAction={`/api/admin/campaigns/${c.id}`} className="px-2 py-1 border rounded">Đóng</button>
                </form>
                <form action={`/api/admin/campaigns/${c.id}`} method="post" className="inline"
                      onSubmit={(e:any)=>{ if(!confirm("Xóa chiến dịch?")) e.preventDefault(); }}>
                  <input type="hidden" name="_method" value="DELETE" />
                  <button formAction={`/api/admin/campaigns/${c.id}`} className="px-2 py-1 border rounded text-red-600">Xóa</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
