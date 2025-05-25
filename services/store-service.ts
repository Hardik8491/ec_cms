import { StoreWithStats } from "@/types"
import { PrismaClient } from "@prisma/client"


const prisma = new PrismaClient()

export async function getStoreWithStats(storeId: string, userId?: string): Promise<StoreWithStats | null> {
    const whereClause = userId 
      ? { id: storeId, agency: { userId } } 
      : { id: storeId }
    
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
    })
  }