import { prisma } from "@/lib/prisma";
import Progress from "@/components/Progress";
import DonateForm from "./DonateForm";
import Tabs from "@/components/Tabs";
import Link from "next/link";

function VND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default async function CampaignDetail({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      org: { select: { name: true, slug: true } },
      category: { select: { name: true } },
      donations: {
        // ✅ các field hợp lệ theo schema
        select: { amount: true, anonymous: true, message: true, createdAt: true, /* user: { select: { name: true } } */ },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!campaign) {
    return <main className="container mx-auto px-6 py-12">❌ Không tìm thấy chiến dịch.</main>;
  }

  // Tổng số tiền đã quyên góp
  const raised = campaign.donations.reduce((s, d) => s + Number(d.amount), 0);
  const goal = Number(campaign.goal);
  const pct = Math.min(100, Math.round((raised * 100) / Math.max(1, goal)));

  return (
    <main className="container mx-auto px-6 py-8 space-y-8">
      {/* Breadcrumb + Tiêu đề */}
      <section className="space-y-2">
        <p className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">Trang chủ</Link> /{" "}
          <Link href="/campaigns" className="hover:underline">Dự án</Link> /{" "}
          <span className="text-gray-700">{campaign.title}</span>
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold">{campaign.title}</h1>
      </section>

      {/* Khối chính */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Trái: Ảnh lớn */}
        <div className="lg:col-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.cover || "/images/sample-cover.jpg"}
            alt=""
            className="w-full h-[360px] object-cover rounded-xl border"
          />
        </div>

        {/* Phải: Card thông tin */}
        <aside className="space-y-4">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            {/* Tổ chức & badge */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 grid place-items-center text-rose-600">💕</div>
                <div>
                  <p className="leading-tight">
                    <span className="text-gray-500">Quỹ/Tổ chức: </span>
                    <Link href={`/org/${campaign.org?.slug ?? ""}`} className="font-medium hover:text-rose-600">
                      {campaign.org?.name ?? "—"}
                    </Link>
                  </p>
                  {campaign.category?.name && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600 mt-1">
                      {campaign.category.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-gray-500">
                {campaign.donations.length} lượt ủng hộ
              </div>
            </div>

            {/* Mục tiêu & đã đạt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Mục tiêu dự án</span>
                <span className="font-medium">{VND(goal)}</span>
              </div>
              <Progress value={pct} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Đã đạt được</span>
                <span className="text-xl font-semibold text-rose-600">{VND(raised)}</span>
              </div>
            </div>

            {/* Form ủng hộ nhanh */}
            <DonateForm campaignId={campaign.id} />
          </div>
        </aside>
      </section>

      {/* Tabs nội dung / Ủng hộ gần đây */}
      <section className="bg-white border rounded-xl p-5" id="tabs">
        <Tabs tabs={["Nội dung", "Danh sách ủng hộ"]}>
          {/* Tab Nội dung */}
          <div>
            {campaign.description ? (
              <article className="prose max-w-none prose-p:leading-7">
                {campaign.description}
              </article>
            ) : (
              <p className="text-gray-500">Chưa có mô tả cho chiến dịch này.</p>
            )}
          </div>

          {/* Tab Danh sách ủng hộ */}
          <div id="supporters" className="space-y-3">
            {campaign.donations.length ? (
              <ul className="divide-y">
                {campaign.donations.map((d, i) => (
                  <li key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center">🎁</div>
                      <div className="text-sm">
                        <p className="font-medium">
                          {d.anonymous ? "Ẩn danh" : "Người ủng hộ"}
                          {d.message ? ` · “${d.message}”` : ""}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(d.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="font-semibold text-rose-600">{VND(Number(d.amount))}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Chưa có lượt ủng hộ nào.</p>
            )}
          </div>
        </Tabs>
      </section>
    </main>
  );
}
