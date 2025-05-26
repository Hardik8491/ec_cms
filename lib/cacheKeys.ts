export const CacheKeys = {
    agencyStores: (agencyId: string) => `agency:${agencyId}:stores`,
    storeDetails: (storeId: string) => `store:${storeId}:details`,
    storeCategories: (storeId: string) => `store:${storeId}:categories`,
    categoryDetails: (categoryId: string) => `category:${categoryId}:details`,
    categoryList: (storeId: string, page: number, limit: number, search: string) => 
      `store:${storeId}:categories:page:${page}:limit:${limit}:search:${search}`,
  };