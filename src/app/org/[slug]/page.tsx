import { prisma } from "@/lib/prisma";
import CampaignCard from "@/components/CampaignCard";

export default async function OrgDetailPage({ params }: { params: { slug: string } }) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
    include: {
      campaigns: {
        include: {
          donations: { select: { amount: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!org) {
    return <main className="container mx-auto px-6 py-12">❌ Không tìm thấy tổ chức.</main>;
  }

  const totalRaised = org.campaigns
    .flatMap((c) => c.donations)
    .reduce((s, d) => s + Number(d.amount), 0);

  return (
    <main className="container mx-auto px-6 py-12 space-y-8">
      {/* Header tổ chức */}
      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h1 className="text-3xl font-semibold">{org.name}</h1>
        {org.website && (
          <a href={org.website} target="_blank" className="text-rose-600 underline underline-offset-2">
            {org.website}
          </a>
        )}
        {org.description && <p className="text-gray-700 whitespace-pre-line">{org.description}</p>}
        <div className="text-sm text-gray-600">
          Tổng dự án: <b>{org.campaigns.length}</b> • Tổng đã gây quỹ:{" "}
          <b>{totalRaised.toLocaleString("vi-VN")}đ</b>
        </div>
      </section>

      {/* Danh sách campaign của tổ chức */}
      {org.campaigns.length ? (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {org.campaigns.map((c) => {
            const raised = c.donations.reduce((s, d) => s + Number(d.amount), 0);
            return (
              <CampaignCard
                key={c.id}
                id={c.id}
                title={c.title}
                cover={c.cover}
                goal={Number(c.goal)}
                raised={raised}
                orgName={org.name}
                orgSlug={org.slug}
                badge={c.category?.name || undefined}
              />
            );
          })}
        </section>
      ) : (
        <p className="text-center text-gray-500">Tổ chức chưa có chiến dịch nào.</p>
      )}
    </main>
  );
}
