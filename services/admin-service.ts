import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const AdminService = {
    async getAdminStatistics() {
        const [userCount, agencyCount, storeCount, orderCount] =
            await Promise.all([
                prisma.user.count(),
                prisma.agency.count(),
                prisma.store.count(),
                prisma.order.count(),
            ]);

        return { userCount, agencyCount, storeCount, orderCount };
    },

    async getRecentAgencies() {
        return await prisma.agency.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: true,
                _count: { select: { stores: true } },
            },
        });
    },

    async getRecentStores() {
        return await prisma.store.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: true,
                agency: true,
                _count: { select: { products: true, orders: true } },
            },
        });
    },

    async getAllUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                emailVerified: true,
                image: true,
                agency: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async getUserById(id: string) {
        return await prisma.user.findUnique({
            where: { id },
            include: {
                agency: true,
                stores: true,
            },
        });
    },

    async updateUser(
        id: string,
        data: {
            name?: string;
            email?: string;
            role?: string;
            agencyId?: string | null;
        }
    ) {
        return await prisma.user.update({
            where: { id },
            data,
            include: {
                agency: true,
            },
        });
    },

    async getAgenciesForSelect() {
        return await prisma.agency.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    },

    async createUser(data: {
        name: string;
        email: string;
        role: string;
        agencyId?: string | null;
    }) {
        return await prisma.user.create({
            data,
            include: {
                agency: true,
            },
        });
    },

    // New method: get users who can be assigned to an agency
    async getUsersForAgencyAssignment() {
        return await prisma.user.findMany({
            where: {
                agencyId: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },
};
