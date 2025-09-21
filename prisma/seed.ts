import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ===== Category =====
  const catTreEm = await prisma.category.upsert({
    where: { slug: "tre-em" },
    update: {},
    create: { slug: "tre-em", name: "Trẻ em" },
  });

  const catGiaoDuc = await prisma.category.upsert({
    where: { slug: "giao-duc" },
    update: {},
    create: { slug: "giao-duc", name: "Giáo dục" },
  });

  const catYTe = await prisma.category.upsert({
    where: { slug: "y-te" },
    update: {},
    create: { slug: "y-te", name: "Y tế" },
  });

  const catMoiTruong = await prisma.category.upsert({
    where: { slug: "moi-truong" },
    update: {},
    create: { slug: "moi-truong", name: "Môi trường" },
  });

  const catNguoiGia = await prisma.category.upsert({
    where: { slug: "nguoi-gia" },
    update: {},
    create: { slug: "nguoi-gia", name: "Người già" },
  });

  // ===== Organization =====
  const orgTreEm = await prisma.organization.upsert({
    where: { slug: "quy-nang-buoc-tuoi-tho" },
    update: {},
    create: {
      slug: "quy-nang-buoc-tuoi-tho",
      name: "Quỹ Từ thiện Nâng bước tuổi thơ",
      description: "Hỗ trợ trẻ em nghèo và bệnh nhi",
      status: "ACTIVE",
    },
  });

  const orgChuThapDo = await prisma.organization.upsert({
    where: { slug: "hoi-chu-thap-do" },
    update: {},
    create: {
      slug: "hoi-chu-thap-do",
      name: "Hội Chữ thập đỏ Việt Nam",
      description: "Tổ chức nhân đạo toàn cầu",
      status: "ACTIVE",
    },
  });

  const orgMoiTruong = await prisma.organization.upsert({
    where: { slug: "quy-vi-moi-truong-xanh" },
    update: {},
    create: {
      slug: "quy-vi-moi-truong-xanh",
      name: "Quỹ Vì Môi trường Xanh",
      description: "Bảo vệ và phát triển môi trường bền vững",
      status: "ACTIVE",
    },
  });

  // ===== Campaigns =====
  await prisma.campaign.createMany({
    data: [
      {
        title: "Một ngàn cánh diều cho hy vọng",
        description: "Góp một bàn tay cho nhiều cuộc đời",
        cover: "https://picsum.photos/600/400?random=1",
        goal: 380_000_000,
        orgId: orgTreEm.id,
        categoryId: catTreEm.id,
        status: "ACTIVE",
      },
      {
        title: "Giúp bé Nhật Trường giữ lại nguồn sáng yêu thương",
        description: "Chi phí điều trị cho bé Nhật Trường",
        cover: "https://picsum.photos/600/400?random=2",
        goal: 50_000_000,
        orgId: orgTreEm.id,
        categoryId: catTreEm.id,
        status: "ACTIVE",
      },
      {
        title: "Xin hãy giúp bé Huỳnh Tấn Phúc điều trị dị tật bẩm sinh",
        description: "Hỗ trợ bé Phúc phẫu thuật và hồi phục",
        cover: "https://picsum.photos/600/400?random=3",
        goal: 20_000_000,
        orgId: orgTreEm.id,
        categoryId: catYTe.id,
        status: "ACTIVE",
      },
      {
        title: "Tiếp sức cho trẻ em đến trường",
        description: "Mua sách vở, đồng phục cho học sinh nghèo",
        cover: "https://picsum.photos/600/400?random=4",
        goal: 100_000_000,
        orgId: orgTreEm.id,
        categoryId: catGiaoDuc.id,
        status: "ACTIVE",
      },
      {
        title: "Cứu trợ lũ lụt miền Trung",
        description: "Giúp đỡ bà con vùng lũ vượt qua khó khăn",
        cover: "https://picsum.photos/600/400?random=5",
        goal: 500_000_000,
        orgId: orgChuThapDo.id,
        categoryId: catNguoiGia.id,
        status: "ACTIVE",
      },
      {
        title: "Hiến máu nhân đạo cứu người",
        description: "Mỗi giọt máu cho đi, một cuộc đời ở lại",
        cover: "https://picsum.photos/600/400?random=6",
        goal: 10_000_000,
        orgId: orgChuThapDo.id,
        categoryId: catYTe.id,
        status: "ACTIVE",
      },
      {
        title: "Trồng 1 triệu cây xanh",
        description: "Cùng chung tay vì một Việt Nam xanh",
        cover: "https://picsum.photos/600/400?random=7",
        goal: 1_000_000_000,
        orgId: orgMoiTruong.id,
        categoryId: catMoiTruong.id,
        status: "ACTIVE",
      },
      {
        title: "Chung tay bảo vệ biển đảo",
        description: "Giữ gìn môi trường biển sạch đẹp cho thế hệ sau",
        cover: "https://picsum.photos/600/400?random=8",
        goal: 200_000_000,
        orgId: orgMoiTruong.id,
        categoryId: catMoiTruong.id,
        status: "ACTIVE",
      },
    ],
  });
}

main()
  .then(() => console.log("✅ Seed done"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
