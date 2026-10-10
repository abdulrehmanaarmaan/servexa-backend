import bcrypt from "bcryptjs";
import { prisma } from "../../app/lib/prisma.js";
import { UserRole } from "./enums.js";
const demoAdmin = {
    email: "admin@servexa.com",
    password: "Admin@123456",
};
const services = [
    {
        name: "Home Maintenance",
        description: "Routine home maintenance and minor household repairs to keep your property safe and functional.",
        basePrice: 800,
    },
    {
        name: "Electrical Repair",
        description: "Electrical troubleshooting and minor repairs for switches, sockets, lighting, and other household electrical fixtures.",
        basePrice: 600,
    },
    {
        name: "Plumbing Services",
        description: "Plumbing inspections and repairs for leaking taps, blocked drains, pipes, and common household plumbing issues.",
        basePrice: 500,
    },
    {
        name: "Home Cleaning",
        description: "Professional home cleaning for rooms, kitchens, bathrooms, and common living spaces.",
        basePrice: 1200,
    },
    {
        name: "Air Conditioner Servicing",
        description: "Routine air conditioner inspection, filter cleaning, and basic servicing to support efficient operation.",
        basePrice: 1500,
    },
    {
        name: "Appliance Repair",
        description: "Diagnosis and repair services for common household appliances, subject to the appliance and fault involved.",
        basePrice: 700,
    },
    {
        name: "Painting Services",
        description: "Interior and exterior painting assistance for residential properties, depending on the area and required work.",
        basePrice: 2500,
    },
    {
        name: "General Repairs",
        description: "Help with everyday household repair tasks, fittings, fixtures, and minor property maintenance.",
        basePrice: 600,
    },
];
const seedAdmin = async () => {
    const existingAdmin = await prisma.user.findUnique({
        where: {
            email: demoAdmin.email,
        },
    });
    if (existingAdmin) {
        console.log("Demo admin already exists.");
        return;
    }
    const passwordHash = await bcrypt.hash(demoAdmin.password, 12);
    const admin = await prisma.user.create({
        data: {
            email: demoAdmin.email,
            passwordHash,
            role: UserRole.ADMIN,
            isActive: true,
        },
    });
    console.log(`Demo admin created: ${admin.email}`);
};
const seedServices = async () => {
    let createdCount = 0;
    let updatedCount = 0;
    for (const service of services) {
        // Service names are not unique in the current Prisma schema,
        // so findFirst + update/create makes this seed idempotent
        // for the service names defined above.
        const existingService = await prisma.service.findFirst({
            where: {
                name: service.name,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        if (existingService) {
            await prisma.service.update({
                where: {
                    id: existingService.id,
                },
                data: {
                    description: service.description,
                    basePrice: service.basePrice,
                    isActive: true,
                    deletedAt: null,
                },
            });
            updatedCount++;
            continue;
        }
        await prisma.service.create({
            data: {
                ...service,
                isActive: true,
            },
        });
        createdCount++;
    }
    console.log(`Services seeded successfully. Created: ${createdCount}, updated: ${updatedCount}.`);
};
const seed = async () => {
    await seedAdmin();
    await seedServices();
};
seed()
    .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
