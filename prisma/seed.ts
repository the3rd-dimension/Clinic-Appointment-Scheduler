import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() { await prisma.doctor.createMany({ data: [
  { id: "dr-alexandra-chen", name: "Dr. Alexandra Chen", specialization: "Cardiology" },
  { id: "dr-marcus-wright", name: "Dr. Marcus Wright", specialization: "General medicine" },
  { id: "dr-leila-hassan", name: "Dr. Leila Hassan", specialization: "Dermatology" },
], skipDuplicates: true }); }
main().finally(() => prisma.$disconnect());