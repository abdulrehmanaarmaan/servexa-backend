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
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Electrical Repair",
        description: "Electrical troubleshooting and minor repairs for switches, sockets, lighting, and other household electrical fixtures.",
        basePrice: 600,
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Plumbing Services",
        description: "Plumbing inspections and repairs for leaking taps, blocked drains, pipes, and common household plumbing issues.",
        basePrice: 500,
        imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Home Cleaning",
        description: "Professional home cleaning for rooms, kitchens, bathrooms, and common living spaces.",
        basePrice: 1200,
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Air Conditioner Servicing",
        description: "Routine air conditioner inspection, filter cleaning, and basic servicing to support efficient operation.",
        basePrice: 1500,
        imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Appliance Repair",
        description: "Diagnosis and repair services for common household appliances, subject to the appliance and fault involved.",
        basePrice: 700,
        imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Painting Services",
        description: "Interior and exterior painting assistance for residential properties, depending on the area and required work.",
        basePrice: 2500,
        imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "General Repairs",
        description: "Help with everyday household repair tasks, fittings, fixtures, and minor property maintenance.",
        basePrice: 600,
        imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
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
                    imageUrl: service.imageUrl,
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
