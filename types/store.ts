export type BasicStore = {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    subdomain: string | null;
    currency: string;
    isMarketplace: boolean;
    commissionRate: number;
    aiEnabled: boolean;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    agency?: {
        id: string;
        name: string;
    } | null;
    vendor?: {
        id: string;
        name: string;
    } | null;
    _count?: {
        products: number;
        orders: number;
    };
};

export type StoreWithDetails = BasicStore & {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        role: string;
    };
    agency: {
        id: string;
        name: string;
        subdomain: string | null;
    } | null;
    vendor: {
        id: string;
        name: string;
        contactEmail: string;
    } | null;
    products: {
        id: string;
        name: string;
        price: number;
        inventory: number;
        variants: {
            id: string;
            name: string;
            price: number;
        }[];
    }[];
    categories: {
        id: string;
        name: string;
        productCount: number;
    }[];
    apiKeys: {
        id: string;
        name: string;
        lastUsed: Date | null;
    }[];
    analytics: {
        id: string;
        date: Date;
        visitors: number;
        sales: number;
    }[];
};
