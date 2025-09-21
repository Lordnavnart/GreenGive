import { prisma } from "@/lib/prisma";
import EditForm from "./EditForm";

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const [init, orgs, categories] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: params.id },
      select: {
        id: true, title: true, goal: true, description: true, cover: true,
        orgId: true, categoryId: true, status: true,
      },
    }),
    prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!init) return <main className="container mx-auto px-6 py-8">Không tìm thấy chiến dịch</main>;

  // ✅ Ép goal về number để truyền vào Client component
  const initSafe = {
    ...init,
    goal: Number(init.goal),
  };

  return (
    <main className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Chỉnh sửa chiến dịch</h1>

      {init.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={init.cover} alt="" className="max-h-[40vh] object-contain rounded border bg-slate-100" />
      )}

      <EditForm init={initSafe} orgs={orgs} categories={categories} />
    </main>
  );
}
