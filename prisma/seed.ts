import { PrismaClient, UserRole, SubscriptionStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Create super admin
    const superAdminPassword = await hash("admin123", 12);
    const superAdmin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            name: "Super Admin",
            password: superAdminPassword,
            role: UserRole.SUPER_ADMIN,
        },
    });

    // Create an agency
    const agency = await prisma.agency.create({
        data: {
            name: "Demo Agency",
            slug: "demo-agency",
            logo: "https://example.com/logo.png",
            subscription: {
                create: {
                    status: SubscriptionStatus.ACTIVE,
                    plan: "PRO",
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                },
            },
        },
    });

    // Create agency admin
    const agencyAdminPassword = await hash("agency123", 12);
    const agencyAdmin = await prisma.user.create({
        data: {
            email: "agency@example.com",
            name: "Agency Admin",
            password: agencyAdminPassword,
            role: UserRole.AGENCY_ADMIN,
            agencyId: agency.id,
        },
    });

    // Create agency user
    const agencyUserPassword = await hash("user123", 12);
    const agencyUser = await prisma.user.create({
        data: {
            email: "user@example.com",
            name: "Agency User",
            password: agencyUserPassword,
            role: UserRole.AGENCY_USER,
            agencyId: agency.id,
        },
    });

    // Create a store
    const store = await prisma.store.create({
        data: {
            name: "Demo Store",
            slug: "demo-store",
            description: "A demo store for testing",
            agencyId: agency.id,
            managers: {
                connect: { id: agencyAdmin.id },
            },
            users: {
                connect: { id: agencyUser.id },
            },
        },
    });

    console.log({
        superAdmin,
        agency,
        agencyAdmin,
        agencyUser,
        store,
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
