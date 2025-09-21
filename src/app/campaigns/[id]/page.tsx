import { prisma } from "@/lib/prisma";
import DonateForm from "./DonateForm";

// Next 15: params là Promise -> cần await
type Params = { id: string };

export default async function CampaignDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      org: { select: { name: true, slug: true } },
      category: { select: { name: true } },
      donations: {
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          isAnonymous: true,
          name: true,
          message: true,
          createdAt: true,
        },
      },
      images: true,
      updates: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!campaign) {
    return (
      <main className="container mx-auto px-6 py-10">
        <div className="text-center text-slate-500">Không tìm thấy chiến dịch.</div>
      </main>
    );
  }

  const raised = campaign.donations.reduce(
    (s, d) => s + Number(d.amount || 0),
    0
  );
  const goal = Number(campaign.goal || 0);
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const cover = campaign.cover || "/images/sample-cover.jpg";

  return (
    <main className="container mx-auto px-6 py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Ảnh + mô tả + lịch sử donate */}
        <section className="md:col-span-2 space-y-4">
          {/* Ảnh cover: hiển thị full, không crop */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={campaign.title}
            className="w-full h-auto max-h-[70vh] object-contain rounded-2xl bg-slate-100"
          />

          <h1 className="text-2xl font-semibold">{campaign.title}</h1>

          <div className="text-sm text-slate-600">
            {campaign.category?.name && <span>{campaign.category.name}</span>}
            {campaign.org?.name && (
              <>
                {" • "}
                <span>{campaign.org.name}</span>
              </>
            )}
          </div>

          <p className="leading-relaxed whitespace-pre-line">
            {campaign.description || "—"}
          </p>

          {/* Lịch sử ủng hộ */}
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Danh sách ủng hộ</h2>
            {campaign.donations.length === 0 ? (
              <div className="text-sm text-slate-500">Chưa có ủng hộ nào.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {campaign.donations.map((d) => (
                  <li key={d.id} className="flex justify-between border-b py-2">
                    <div className="pr-3">
                      <div className="font-medium">
                        {d.isAnonymous ? "Người ẩn danh" : d.name || "Không tên"}
                      </div>
                      {!!d.message && (
                        <div className="text-slate-600">“{d.message}”</div>
                      )}
                      <div className="text-xs text-slate-500">
                        {new Date(d.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className="min-w-[120px] text-right font-semibold">
                      {Number(d.amount).toLocaleString("vi-VN")} đ
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Cột phải: tiến độ + form donate */}
        <aside className="md:col-span-1 border rounded-2xl p-4 space-y-4">
          <div className="text-sm text-slate-600">
            Gây quỹ:{" "}
            <span className="font-semibold">
              {raised.toLocaleString("vi-VN")} / {goal.toLocaleString("vi-VN")} VND
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded">
            <div
              className="h-2 bg-emerald-500 rounded"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-xs text-slate-600">{percent}% hoàn thành</div>

          {/* Form quyên góp */}
          <DonateForm campaignId={campaign.id} />

          {/* (tuỳ chọn) các cập nhật tiến độ gần đây */}
          {campaign.updates.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2 text-sm">Cập nhật gần đây</h3>
              <ul className="space-y-1 text-xs text-slate-600">
                {campaign.updates.slice(0, 3).map((u) => (
                  <li key={u.id}>
                    {u.percent}% • {u.content || "Cập nhật tiến độ"} –{" "}
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
