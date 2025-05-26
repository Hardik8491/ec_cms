"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { AgencyWithDetails } from "@/types/agency";

export function AgencyProfile({ agency }: { agency: AgencyWithDetails }) {
    return (
        <div className='grid gap-6 md:grid-cols-2'>
            <Card>
                <CardHeader className='flex flex-row justify-between items-center'>
                    <CardTitle>Basic Information</CardTitle>
                    <Button size='sm' variant='outline' asChild>
                        <Link href={`/admin/agencies/${agency.id}/edit`}>
                            <Pencil className='mr-2 h-4 w-4' />
                            Edit
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center gap-4'>
                        {agency.logo && (
                            <img
                                src={agency.logo}
                                alt={agency.name}
                                className='h-16 w-16 rounded-full'
                            />
                        )}
                        <div>
                            <h2 className='text-xl font-semibold'>
                                {agency.name}
                            </h2>
                            <div className='flex gap-2 mt-1'>
                                <Badge
                                    variant={
                                        agency.aiEnabled
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    AI{" "}
                                    {agency.aiEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                                <Badge variant='outline'>
                                    {agency.aiCredits} AI Credits
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Website
                            </p>
                            <p>{agency.website || "-"}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Subdomain
                            </p>
                            <p>{agency.subdomain || "-"}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Created
                            </p>
                            <p>{formatDate(agency.createdAt)}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Last Updated
                            </p>
                            <p>{formatDate(agency.updatedAt)}</p>
                        </div>
                    </div>

                    <div>
                        <p className='text-sm text-muted-foreground'>
                            Description
                        </p>
                        <p className='mt-1'>
                            {agency.description || "No description"}
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
                                {agency.user.name?.charAt(0) ||
                                    agency.user.email?.charAt(0)}
                            </div>
                            <div>
                                <p className='font-medium'>
                                    {agency.user.name || agency.user.email}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    {agency.user.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Subscription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {agency.subscription ? (
                            <div className='space-y-2'>
                                <div className='flex justify-between'>
                                    <span>Plan:</span>
                                    <span className='font-medium'>
                                        {agency.subscription.plan}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span>Status:</span>
                                    <Badge variant='default'>
                                        {agency.subscription.status}
                                    </Badge>
                                </div>
                                {agency.subscription.endsAt && (
                                    <div className='flex justify-between'>
                                        <span>Renews:</span>
                                        <span>
                                            {formatDate(
                                                agency.subscription.endsAt
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className='text-muted-foreground'>
                                No active subscription
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className='md:col-span-2'>
                <CardHeader>
                    <CardTitle>Stores ({agency.stores.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {agency.stores.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {agency.stores.map((store) => (
                                <Link
                                    key={store.id}
                                    href={`/admin/stores/${store.id}`}
                                    className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                                >
                                    <div className='font-medium'>
                                        {store.name}
                                    </div>
                                    <div className='text-sm text-muted-foreground mt-1'>
                                        {store._count.products} products
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className='text-muted-foreground'>No stores yet</p>
                    )}
                </CardContent>
            </Card>

            <Card className='md:col-span-2'>
                <CardHeader>
                    <CardTitle>
                        Marketing Campaigns ({agency.campaigns.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {agency.campaigns.length > 0 ? (
                        <div className='space-y-4'>
                            {agency.campaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className='border rounded-lg p-4'
                                >
                                    <div className='flex justify-between'>
                                        <div className='font-medium'>
                                            {campaign.name}
                                        </div>
                                        <Badge variant='outline'>
                                            {campaign.status}
                                        </Badge>
                                    </div>
                                    <div className='text-sm text-muted-foreground mt-1'>
                                        Budget: ${campaign.budget}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-muted-foreground'>
                            No campaigns yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
