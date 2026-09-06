import bcrypt from "bcryptjs";
import { prisma } from "../../app/lib/prisma.js";
import { UserRole } from "./enums.js";

const seed = async () => {
  const email = "admin@servexa.com";
  const password = "Admin@123456";

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    console.log("Demo admin already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log("Demo admin created:", admin.email);
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });