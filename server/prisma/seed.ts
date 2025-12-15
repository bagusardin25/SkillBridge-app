import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  // passwords 
  const hashedPassword = hashSync("1234567", 10);

  // user
  const user = await prisma.user.upsert({
    where: { email: "demo@skillbridge.com" },
    update: {},
    create: {
      id: "dummy-user-123",
      email: "demo@skillbridge.com",
      name: "Demo User",
      password: hashedPassword,
      provider: "email",
      isVerified: true,
    },
  });
  console.log("Berhasil Membuat user:", user);
}

// opsional
// const adminUser = await prisma.user.upsert({
//   where: {email: "admin@skillbridge.com"},
//   update: {},
//   create: {
//     email: "",
//     name: "Admin User",
//     password: hashSync("admin123", 10),
//     role: "ADMIN",
//     provider: "email",
//     isVerified: true,
//   },
// });

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
