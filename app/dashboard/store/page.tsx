"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

interface DashboardStats {
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
    status: string;
    createdAt: string;
}

export default function StoreDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch store details
                const storeResponse = await fetch(
                    `/api/stores/${session?.user?.storeId}`
                );
                if (storeResponse.ok) {
                    const storeData = await storeResponse.json();
                    setStore(storeData.store);
                }

                // Fetch store stats
                const statsResponse = await fetch(
                    `/api/stores/${session?.user?.storeId}/stats`
                );
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.storeId) {
            fetchDashboardData();
        }
    }, [session?.user?.storeId]);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <div className='text-center'>
                    <h2 className='text-xl font-semibold mb-2'>
                        No Store Found
                    </h2>
                    <p className='text-gray-500'>
                        You don't have access to any store.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl font-bold'>{store.name}</h1>
                {store.description && (
                    <p className='text-gray-500 mt-1'>{store.description}</p>
                )}
            </div>

            {/* Stats Grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Products
                        </CardTitle>
                        <Package className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats?.totalProducts || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Orders
                        </CardTitle>
                        <ShoppingCart className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats?.totalOrders || 0}
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
                            {stats?.totalCustomers || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Revenue
                        </CardTitle>
                        <TrendingUp className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {store.currency}{" "}
                            {stats?.totalRevenue?.toLocaleString() || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Store Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Store Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <h3 className='text-sm font-medium text-gray-500'>
                                Store ID
                            </h3>
                            <p className='mt-1'>{store.id}</p>
                        </div>
                        <div>
                            <h3 className='text-sm font-medium text-gray-500'>
                                Store Slug
                            </h3>
                            <p className='mt-1'>{store.slug}</p>
                        </div>
                        <div>
                            <h3 className='text-sm font-medium text-gray-500'>
                                Currency
                            </h3>
                            <p className='mt-1'>{store.currency}</p>
                        </div>
                        <div>
                            <h3 className='text-sm font-medium text-gray-500'>
                                Status
                            </h3>
                            <p className='mt-1'>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        store.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {store.status}
                                </span>
                            </p>
                        </div>
                        <div>
                            <h3 className='text-sm font-medium text-gray-500'>
                                Created At
                            </h3>
                            <p className='mt-1'>
                                {new Date(store.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
