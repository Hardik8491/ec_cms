import { redis } from "./redis";
import { CacheKeys } from "./cacheKeys";
import { prisma } from "./db";

export const StoreCache = {
  // Invalidate all cache related to a specific agency
  invalidateAgencyStores: async (agencyId: string) => {
    await redis.del(CacheKeys.agencyStores(agencyId));
  },

  // Invalidate cache for a specific store
  invalidateStore: async (storeId: string) => {
    await redis.del(CacheKeys.storeDetails(storeId));
  },

  // Prefetch and cache store data
  prefetchStore: async (storeId: string) => {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
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

    if (store) {
      await redis.setex(
        CacheKeys.storeDetails(storeId),
        300, // 5 minutes
        store
      );
    }

    return store;
  },
};