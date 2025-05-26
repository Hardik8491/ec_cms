"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3,
    Store,
    Users,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Plus,
    Eye,
    Settings,
    Target,
    Bot,
    Globe,
    Package,
} from "lucide-react";
import Link from "next/link";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Line,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Bar,
    BarChart,
} from "recharts";
import { useDashboardStore } from "@/(Zustand)/stores/useDashboardStore";


interface DashboardData {
    overview: {
        totalStores: number;
        totalRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        revenueGrowth: number;
        ordersGrowth: number;
    };
    stores: Array<{
        id: string;
        name: string;
        revenue: number;
        orders: number;
        status: string;
        lastActivity: string;
    }>;
    recentActivity: Array<{
        id: string;
        type: string;
        message: string;
        timestamp: string;
        storeId: string;
        storeName: string;
    }>;
    revenueChart: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
}

export default function DashboardClient() {
    const { data: session } = useSession();
    const { data, loading, error, timeRange, fetchData, setTimeRange } =
        useDashboardStore();

    useEffect(() => {
        fetchData();
    }, [timeRange, fetchData]);

    if (loading) {
        return (
            <div className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className='animate-pulse'>
                            <CardHeader className='pb-2'>
                                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                            </CardHeader>
                            <CardContent>
                                <div className='h-8 bg-gray-200 rounded w-3/4 mb-2'></div>
                                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <div>Error loading dashboard data: {error}</div>;
    if (!data) return <div>No data available</div>;

    return (
        <div className='p-6 space-y-6'>
            {/* Header */}
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Agency Dashboard
                    </h1>
                    <p className='text-gray-600'>
                        Welcome back, {session?.user?.name}
                    </p>
                </div>
                <div className='flex gap-3'>
                    <Link href='/agency/stores/create'>
                        <Button>
                            <Plus className='w-4 h-4 mr-2' />
                            Create Store
                        </Button>
                    </Link>
                    <Button variant='outline'>
                        <Settings className='w-4 h-4 mr-2' />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Stores
                        </CardTitle>
                        <Store className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {data.overview.totalStores}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            Active stores in your agency
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Revenue
                        </CardTitle>
                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            ${data?.overview?.totalRevenue?.toLocaleString()}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            <span
                                className={`${
                                    data.overview.revenueGrowth >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {data.overview.revenueGrowth >= 0 ? "+" : ""}
                                {data.overview.revenueGrowth}%
                            </span>{" "}
                            from last period
                        </p>
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
                            {data?.overview?.totalOrders?.toLocaleString()}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            <span
                                className={`${
                                    data.overview.ordersGrowth >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {data?.overview?.ordersGrowth >= 0 ? "+" : ""}
                                {data?.overview?.ordersGrowth}%
                            </span>{" "}
                            from last period
                        </p>
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
                            {data?.overview?.totalCustomers?.toLocaleString()}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            Across all stores
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue='overview' className='space-y-6'>
                <TabsList>
                    <TabsTrigger value='overview'>Overview</TabsTrigger>
                    <TabsTrigger value='stores'>Stores</TabsTrigger>
                    <TabsTrigger value='activity'>Recent Activity</TabsTrigger>
                    <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='space-y-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                                <CardDescription>
                                    Revenue over the last {timeRange}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        revenue: {
                                            label: "Revenue",
                                            color: "hsl(var(--chart-1))",
                                        },
                                    }}
                                    className='h-[300px]'
                                >
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <LineChart data={data.revenueChart}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='date' />
                                            <YAxis />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Line
                                                type='monotone'
                                                dataKey='revenue'
                                                stroke='var(--color-revenue)'
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Orders Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Orders Trend</CardTitle>
                                <CardDescription>
                                    Orders over the last {timeRange}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        orders: {
                                            label: "Orders",
                                            color: "hsl(var(--chart-2))",
                                        },
                                    }}
                                    className='h-[300px]'
                                >
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <BarChart data={data.revenueChart}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='date' />
                                            <YAxis />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Bar
                                                dataKey='orders'
                                                fill='var(--color-orders)'
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='stores' className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Stores</CardTitle>
                            <CardDescription>
                                Manage and monitor all your stores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {data.stores.map((store) => (
                                    <div
                                        key={store.id}
                                        className='flex items-center justify-between p-4 border rounded-lg'
                                    >
                                        <div className='flex items-center space-x-4'>
                                            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center'>
                                                <Store className='w-5 h-5 text-white' />
                                            </div>
                                            <div>
                                                <h3 className='font-semibold'>
                                                    {store.name}
                                                </h3>
                                                <p className='text-sm text-gray-600'>
                                                    $
                                                    {store?.revenue?.toLocaleString()}{" "}
                                                    revenue • {store?.orders}{" "}
                                                    orders
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-center space-x-3'>
                                            <Badge
                                                variant={
                                                    store.status === "active"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {store.status}
                                            </Badge>
                                            <Link
                                                href={`/agency/stores/${store.id}`}
                                            >
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                >
                                                    <Eye className='w-4 h-4 mr-2' />
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='activity' className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest updates from your stores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {data?.recentActivity?.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className='flex items-start space-x-4 p-4 border rounded-lg'
                                    >
                                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                            <TrendingUp className='w-4 h-4 text-blue-600' />
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-sm'>
                                                {activity?.message}
                                            </p>
                                            <div className='flex items-center space-x-2 mt-1'>
                                                <Badge
                                                    variant='outline'
                                                    className='text-xs'
                                                >
                                                    {activity?.storeName}
                                                </Badge>
                                                <span className='text-xs text-gray-500'>
                                                    {activity?.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='analytics' className='space-y-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        <Card className='lg:col-span-2'>
                            <CardHeader>
                                <CardTitle>Performance Analytics</CardTitle>
                                <CardDescription>
                                    Detailed insights across all stores
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='p-4 bg-green-50 rounded-lg'>
                                            <div className='text-2xl font-bold text-green-600'>
                                                {(
                                                    data?.overview
                                                        ?.totalRevenue /
                                                        data?.overview
                                                            ?.totalOrders || 0
                                                ).toFixed(2)}
                                            </div>
                                            <div className='text-sm text-green-700'>
                                                Average Order Value
                                            </div>
                                        </div>
                                        <div className='p-4 bg-blue-50 rounded-lg'>
                                            <div className='text-2xl font-bold text-blue-600'>
                                                {(
                                                    data?.overview
                                                        ?.totalOrders /
                                                        data?.overview
                                                            ?.totalCustomers ||
                                                    0
                                                ).toFixed(2)}
                                            </div>
                                            <div className='text-sm text-blue-700'>
                                                Orders per Customer
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <Link href='/agency/stores/create'>
                                    <Button className='w-full justify-start'>
                                        <Plus className='w-4 h-4 mr-2' />
                                        Create New Store
                                    </Button>
                                </Link>
                                <Link href='/ai-assistant'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                    >
                                        <Bot className='w-4 h-4 mr-2' />
                                        AI Assistant
                                    </Button>
                                </Link>
                                <Link href='/inventory'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                    >
                                        <Package className='w-4 h-4 mr-2' />
                                        Inventory Management
                                    </Button>
                                </Link>
                                <Link href='/marketing/campaigns'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                    >
                                        <Target className='w-4 h-4 mr-2' />
                                        Marketing Campaigns
                                    </Button>
                                </Link>
                                <Link href='/customers/journey'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                    >
                                        <Users className='w-4 h-4 mr-2' />
                                        Customer Journey
                                    </Button>
                                </Link>
                                <Link href='/integrations'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                    >
                                        <Globe className='w-4 h-4 mr-2' />
                                        Integrations Hub
                                    </Button>
                                </Link>
                                <Link href='/agency/analytics'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                    >
                                        <BarChart3 className='w-4 h-4 mr-2' />
                                        View Analytics
                                    </Button>
                                </Link>
                                <Link href='/agency/settings'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                    >
                                        <Settings className='w-4 h-4 mr-2' />
                                        Agency Settings
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
