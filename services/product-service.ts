// services/product-service.ts
import { OrderWithCustomer } from "@/types";
import { PrismaClient, Product } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRecentProducts(storeId: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function getRecentOrders(
  storeId: string
): Promise<OrderWithCustomer[]> {
  return prisma.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      customer: true,
    },
  });
}
