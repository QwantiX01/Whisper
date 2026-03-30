import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");
  // No seed data needed — users created via Clerk webhooks
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
