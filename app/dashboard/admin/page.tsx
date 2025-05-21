"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Store, Users, TrendingUp } from "lucide-react";

interface DashboardStats {
    totalAgencies: number;
    totalStores: number;
    totalUsers: number;
    totalRevenue: number;
}

interface Agency {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    _count: {
        stores: number;
        users: number;
    };
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats
                const statsResponse = await fetch("/api/admin/stats");
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Fetch agencies
                const agenciesResponse = await fetch("/api/agencies");
                if (agenciesResponse.ok) {
                    const agenciesData = await agenciesResponse.json();
                    setAgencies(agenciesData.agencies);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Agencies
                        </CardTitle>
                        <Building2 className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {stats?.totalAgencies || 0}
                        </div>
                    </CardContent>
                </Card>

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

            {/* Agencies List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Agencies</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {agencies.map((agency) => (
                            <div
                                key={agency.id}
                                className='flex items-center justify-between p-4 border rounded-lg'
                            >
                                <div>
                                    <h3 className='font-medium'>
                                        {agency.name}
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        {agency.email}
                                    </p>
                                </div>
                                <div className='flex items-center space-x-4'>
                                    <div className='text-sm text-gray-500'>
                                        <span className='font-medium'>
                                            {agency._count.stores}
                                        </span>{" "}
                                        stores
                                    </div>
                                    <div className='text-sm text-gray-500'>
                                        <span className='font-medium'>
                                            {agency._count.users}
                                        </span>{" "}
                                        users
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${
                                            agency.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {agency.status}
                                    </span>
                                    <span className='text-sm text-gray-500'>
                                        Created{" "}
                                        {new Date(
                                            agency.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
