import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create dummy user
  const user = await prisma.user.upsert({
    where: { email: "demo@skillbridge.com" },
    update: {},
    create: {
      id: "dummy-user-123",
      email: "demo@skillbridge.com",
      name: "Demo User",
    },
  });

  console.log("Created user:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
