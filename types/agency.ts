export type BasicAgency = {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    subdomain: string | null;
    aiEnabled: boolean;
    aiCredits: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    _count?: {
        stores: number;
        campaigns: number;
    };
};

export type AgencyWithDetails = BasicAgency & {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        role: string;
    };
    stores: {
        id: string;
        name: string;
        _count: {
            products: number;
        };
    }[];
    subscription: {
        id: string;
        plan: string;
        status: string;
        endsAt: Date | null;
    } | null;
    campaigns: {
        id: string;
        name: string;
        status: string;
        budget: number;
    }[];
};
