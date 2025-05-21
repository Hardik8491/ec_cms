"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, CreditCard, TrendingUp } from "lucide-react";

interface DashboardStats {
    totalStores: number;
    totalUsers: number;
    totalSubscriptions: number;
    totalRevenue: number;
}

interface Store {
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
}

export default function AgencyDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch agency stats
                const statsResponse = await fetch(
                    `/api/agencies/${session?.user?.agencyId}/stats`
                );
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Fetch agency stores
                const storesResponse = await fetch(
                    `/api/agencies/${session?.user?.agencyId}/stores`
                );
                if (storesResponse.ok) {
                    const storesData = await storesResponse.json();
                    setStores(storesData.stores);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.agencyId) {
            fetchDashboardData();
        }
    }, [session?.user?.agencyId]);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <h1 className='text-3xl font-bold'>Agency Dashboard</h1>

            {/* Stats Grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Stores
                        </CardTitle>
                        <Store className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats?.totalStores || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Users
                        </CardTitle>
                        <Users className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats?.totalUsers || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Active Subscriptions
                        </CardTitle>
                        <CreditCard className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats?.totalSubscriptions || 0}
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
                            ${stats?.totalRevenue?.toLocaleString() || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stores List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Stores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {stores.length === 0 ? (
                            <div className='text-center py-8'>
                                <p className='text-gray-500'>
                                    No stores found. Create your first store to
                                    get started.
                                </p>
                            </div>
                        ) : (
                            stores.map((store) => (
                                <div
                                    key={store.id}
                                    className='flex items-center justify-between p-4 border rounded-lg'
                                >
                                    <div>
                                        <h3 className='font-medium'>
                                            {store.name}
                                        </h3>
                                        <p className='text-sm text-gray-500'>
                                            {store.slug}
                                        </p>
                                    </div>
                                    <div className='flex items-center space-x-4'>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                store.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {store.status}
                                        </span>
                                        <span className='text-sm text-gray-500'>
                                            Created{" "}
                                            {new Date(
                                                store.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
