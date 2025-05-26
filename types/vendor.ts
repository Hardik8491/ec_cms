export type BasicVendor = {
    id: string;
    name: string;
    contactEmail: string;
    _count?: {
        stores: number;
    };
};

export type VendorWithDetails = BasicVendor & {
    stores: {
        id: string;
        name: string;
        subdomain: string | null;
    }[];
};
