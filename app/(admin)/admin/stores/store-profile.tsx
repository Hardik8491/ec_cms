"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { StoreWithDetails } from "@/types/store";
import { BarChart } from "@/components/charts/bar-chart";

export function StoreProfile({ store }: { store: StoreWithDetails }) {
    const analyticsData = store.analytics.map((a) => ({
        date: a.date.toLocaleDateString(),
        visitors: a.visitors,
        sales: a.sales,
    }));

    return (
        <div className='grid gap-6 md:grid-cols-2'>
            <Card>
                <CardHeader className='flex flex-row justify-between items-center'>
                    <CardTitle>Store Information</CardTitle>
                    <Button size='sm' variant='outline' asChild>
                        <Link href={`/admin/stores/${store.id}/edit`}>
                            <Pencil className='mr-2 h-4 w-4' />
                            Edit
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center gap-4'>
                        {store.logo && (
                            <img
                                src={store.logo}
                                alt={store.name}
                                className='h-16 w-16 rounded-full'
                            />
                        )}
                        <div>
                            <h2 className='text-xl font-semibold'>
                                {store.name}
                            </h2>
                            <div className='flex gap-2 mt-1'>
                                <Badge
                                    variant={
                                        store.isMarketplace
                                            ? "default"
                                            : "outline"
                                    }
                                >
                                    {store.isMarketplace
                                        ? "Marketplace"
                                        : "Standard"}
                                </Badge>
                                <Badge
                                    variant={
                                        store.aiEnabled
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    AI{" "}
                                    {store.aiEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Subdomain
                            </p>
                            <p>{store.subdomain || "-"}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Currency
                            </p>
                            <p>{store.currency}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Commission
                            </p>
                            <p>{store.commissionRate}%</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Created
                            </p>
                            <p>{formatDate(store.createdAt)}</p>
                        </div>
                    </div>

                    <div>
                        <p className='text-sm text-muted-foreground'>
                            Description
                        </p>
                        <p className='mt-1'>
                            {store.description || "No description"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className='space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Owner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center gap-3'>
                            <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center'>
                                {store.user.name?.charAt(0) ||
                                    store.user.email?.charAt(0)}
                            </div>
                            <div>
                                <p className='font-medium'>
                                    {store.user.name || store.user.email}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    {store.user.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {store.agency && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Agency</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex items-center gap-3'>
                                <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center'>
                                    {store.agency.name.charAt(0)}
                                </div>
                                <div>
                                    <p className='font-medium'>
                                        {store.agency.name}
                                    </p>
                                    <p className='text-sm text-muted-foreground'>
                                        {store.agency.subdomain}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card className='md:col-span-2'>
                <CardHeader>
                    <CardTitle>Analytics (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    {store.analytics.length > 0 ? (
                        <BarChart
                            data={analyticsData}
                            index='date'
                            categories={["visitors", "sales"]}
                            colors={["#8884d8", "#82ca9d"]}
                            height={300}
                        />
                    ) : (
                        <p className='text-muted-foreground'>
                            No analytics data yet
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className='md:col-span-2'>
                <CardHeader>
                    <CardTitle>
                        Recent Products ({store.products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {store.products.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {store.products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/admin/products/${product.id}`}
                                    className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                                >
                                    <div className='font-medium'>
                                        {product.name}
                                    </div>
                                    <div className='text-sm text-muted-foreground mt-1'>
                                        ${product.price} • {product.inventory}{" "}
                                        in stock
                                    </div>
                                    {product.variants.length > 0 && (
                                        <div className='text-xs text-muted-foreground mt-2'>
                                            {product.variants.length} variants
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className='text-muted-foreground'>No products yet</p>
                    )}
                </CardContent>
            </Card>

            <Card className='md:col-span-2'>
                <CardHeader>
                    <CardTitle>API Keys ({store.apiKeys.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {store.apiKeys.length > 0 ? (
                        <div className='space-y-4'>
                            {store.apiKeys.map((key) => (
                                <div
                                    key={key.id}
                                    className='border rounded-lg p-4'
                                >
                                    <div className='flex justify-between'>
                                        <div className='font-medium'>
                                            {key.name}
                                        </div>
                                        <Badge variant='outline'>
                                            {key.lastUsed
                                                ? formatDate(key.lastUsed)
                                                : "Never used"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-muted-foreground'>No API keys yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
