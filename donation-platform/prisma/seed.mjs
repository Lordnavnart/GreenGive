import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "thien-tai" },
    update: {},
    create: { slug: "thien-tai", name: "Thiên tai" },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "greengive" },
    update: {},
    create: { name: "GreenGive", slug: "greengive", status: "ACTIVE", website: "https://example.org" },
  });

  const title = "Cứu trợ miền Trung";
  let campaign = await prisma.campaign.findFirst({ where: { title } });
  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        title,
        description: "Hỗ trợ khẩn cấp đồng bào miền Trung sau bão lũ.",
        cover: "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=1280&q=80&auto=format&fit=crop",
        goal: 100_000_000,
        status: "ACTIVE",
        orgId: org.id,
        categoryId: category.id, // nếu categoryId là optional có thể bỏ
      },
    });
  }

  console.log("Seed xong:", { category: category.slug, org: org.slug, campaign: { id: campaign.id, title: campaign.title }});
}

main().catch((e) => { console.error(e); process.exit(1); })
       .finally(async () => { await prisma.$disconnect(); });
