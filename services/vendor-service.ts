import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const VendorService = {
    async getAllVendors() {
        return await prisma.vendor.findMany({
            select: {
                id: true,
                name: true,
                contactEmail: true,
                _count: {
                    select: {
                        stores: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    },
};
