import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const email = "admin@greengive.dev";
  const newPass = "admin123";
  const passwordHash = await bcrypt.hash(newPass, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  console.log("✅ Reset password for:", user.email, "->", newPass);
}

main().catch(e => { console.error(e); process.exit(1); })
       .finally(() => prisma.$disconnect());
