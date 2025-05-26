import { StoreWithStats } from "@/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getStoreWithStats(
    storeId: string,
    userId?: string
): Promise<StoreWithStats | null> {
    const whereClause = userId
        ? { id: storeId, agency: { userId } }
        : { id: storeId };

    return prisma.store.findUnique({
        where: whereClause,
        include: {
            _count: {
                select: {
                    products: true,
                    orders: true,
                    customers: true,
                },
            },
        },
    });
}

export const StoreService = {
    async getAllStores() {
        return await prisma.store.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                subdomain: true,
                currency: true,
                isMarketplace: true,
                commissionRate: true,
                aiEnabled: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                agency: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                vendor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                        orders: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async getStoreById(id: string) {
        return await prisma.store.findUnique({
            where: { id },
            include: {
                user: true,
                agency: true,
                vendor: true,
                products: {
                    include: {
                        variants: true,
                    },
                    take: 5,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                categories: true,
                apiKeys: true,
                analytics: {
                    orderBy: {
                        date: "desc",
                    },
                    take: 7,
                },
            },
        });
    },

    async createStore(data: {
        name: string;
        description?: string;
        logo?: string;
        subdomain?: string;
        currency?: string;
        userId: string;
        agencyId?: string | null;
        vendorId?: string | null;
        isMarketplace?: boolean;
        commissionRate?: number;
        aiEnabled?: boolean;
        channels?: any;
    }) {
        return await prisma.store.create({
            data,
            include: {
                user: true,
            },
        });
    },

    async updateStore(
        id: string,
        data: {
            name?: string;
            description?: string | null;
            logo?: string | null;
            subdomain?: string | null;
            currency?: string;
            agencyId?: string | null;
            vendorId?: string | null;
            isMarketplace?: boolean;
            commissionRate?: number;
            aiEnabled?: boolean;
            channels?: any;
        }
    ) {
        return await prisma.store.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    },

    async deleteStore(id: string) {
        return await prisma.store.delete({
            where: { id },
        });
    },

    async getAvailableSubdomains() {
        return await prisma.store.findMany({
            select: {
                subdomain: true,
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

    async getVendorsForSelect() {
        return await prisma.vendor.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    },
};
