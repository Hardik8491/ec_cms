"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, CreditCard, Users, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface StoreStats {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
}

interface Store {
    id: string;
    name: string;
    slug: string;
    description?: string;
    currency: string;
    active: boolean;
    agency: {
        name: string;
        id: string;
    };
    _count: {
        products: number;
        orders: number;
        customers: number;
    };
}

export default function StorePage({ params }: { params: { storeId: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [store, setStore] = useState<Store | null>(null);
    const [stats, setStats] = useState<StoreStats>({
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch store details
                const storeResponse = await fetch(
                    `/api/stores/${params.storeId}`
                );
                if (!storeResponse.ok) {
                    throw new Error("Failed to fetch store");
                }
                const storeData = await storeResponse.json();
                setStore(storeData.store);

                // Fetch store stats
                const statsResponse = await fetch(
                    `/api/analytics?storeId=${params.storeId}`
                );
                if (!statsResponse.ok) {
                    throw new Error("Failed to fetch stats");
                }
                const statsData = await statsResponse.json();
                setStats({
                    totalProducts: storeData.store._count.products,
                    totalOrders: statsData.totalOrders,
                    totalCustomers: storeData.store._count.customers,
                    totalRevenue: statsData.totalRevenue,
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(
                    error instanceof Error ? error.message : "An error occurred"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.storeId]);

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>
                        Loading store information...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-red-600 mb-2'>
                        Error
                    </h2>
                    <p className='text-gray-600'>{error}</p>
                    <button
                        onClick={() => router.back()}
                        className='mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800'
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                        Store Not Found
                    </h2>
                    <p className='text-gray-600'>
                        The store you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className='mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800'
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto p-6'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold'>{store.name}</h1>
                <p className='text-muted-foreground'>{store.description}</p>
            </div>

            {/* Stats Grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Products
                        </CardTitle>
                        <Package className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats.totalProducts}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Orders
                        </CardTitle>
                        <CreditCard className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats.totalOrders}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Customers
                        </CardTitle>
                        <Users className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats.totalCustomers}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Revenue
                        </CardTitle>
                        <Store className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            ${stats.totalRevenue.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Store Details */}
            <Card className='mb-8'>
                <CardHeader>
                    <CardTitle>Store Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                            <dt className='text-sm font-medium text-muted-foreground'>
                                Store ID
                            </dt>
                            <dd className='mt-1 text-sm'>{store.id}</dd>
                        </div>
                        <div>
                            <dt className='text-sm font-medium text-muted-foreground'>
                                Slug
                            </dt>
                            <dd className='mt-1 text-sm'>{store.slug}</dd>
                        </div>
                        <div>
                            <dt className='text-sm font-medium text-muted-foreground'>
                                Currency
                            </dt>
                            <dd className='mt-1 text-sm'>{store.currency}</dd>
                        </div>
                        <div>
                            <dt className='text-sm font-medium text-muted-foreground'>
                                Status
                            </dt>
                            <dd className='mt-1 text-sm'>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        store.active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {store.active ? "Active" : "Inactive"}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className='text-sm font-medium text-muted-foreground'>
                                Agency
                            </dt>
                            <dd className='mt-1 text-sm'>
                                {store.agency.name}
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}
