import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, role: true } });

  for (const u of users) {
    const raw = (u.role as any) ?? "USER";
    const up = String(raw).toUpperCase();
    const role = ["USER","ADMIN","ORG"].includes(up)
      ? (up as any)
      : (up.startsWith("ADM") ? "ADMIN" : "USER");

    await prisma.user.update({ where: { id: u.id }, data: { role } });
    console.log(`Updated ${u.id} -> ${role}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
