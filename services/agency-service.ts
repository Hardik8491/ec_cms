import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const AgencyService = {
    async getAllAgencies() {
        return await prisma.agency.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                website: true,
                subdomain: true,
                aiEnabled: true,
                aiCredits: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        stores: true,
                        campaigns: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async getAgencyById(id: string) {
        return await prisma.agency.findUnique({
            where: { id },
            include: {
                user: true,
                stores: {
                    include: {
                        _count: {
                            select: {
                                products: true,
                            },
                        },
                    },
                },
                subscription: true,
                campaigns: true,
            },
        });
    },

    async createAgency(data: {
        name: string;
        description?: string;
        logo?: string;
        website?: string;
        subdomain?: string;
        userId: string;
        aiEnabled?: boolean;
        aiCredits?: number;
    }) {
        return await prisma.agency.create({
            data,
            include: {
                user: true,
            },
        });
    },

    async updateAgency(
        id: string,
        data: {
            name?: string;
            description?: string | null;
            logo?: string | null;
            website?: string | null;
            subdomain?: string | null;
            aiEnabled?: boolean;
            aiCredits?: number;
        }
    ) {
        return await prisma.agency.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    },

    async deleteAgency(id: string) {
        return await prisma.agency.delete({
            where: { id },
        });
    },

    async getAvailableSubdomains() {
        return await prisma.agency.findMany({
            select: {
                subdomain: true,
            },
        });
    },
    async getAgencyBySubdomain(subdomain: string) {
        return await prisma.agency.findUnique({
            where: { subdomain },
        });
    },
};
