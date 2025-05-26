"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";

export function UserProfile({ user }: { user: any }) {
    return (
        <div className='grid gap-6 md:grid-cols-2'>
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center gap-4'>
                        {user.image && (
                            <img
                                src={user.image}
                                alt={user.name}
                                className='h-16 w-16 rounded-full'
                            />
                        )}
                        <div>
                            <h2 className='text-xl font-semibold'>
                                {user.name}
                            </h2>
                            <Badge
                                variant={
                                    user.role === "admin"
                                        ? "destructive"
                                        : "outline"
                                }
                            >
                                {user.role}
                            </Badge>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Email
                            </p>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Status
                            </p>
                            <Badge
                                variant={
                                    user.emailVerified ? "default" : "secondary"
                                }
                            >
                                {user.emailVerified ? "Verified" : "Pending"}
                            </Badge>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Joined
                            </p>
                            <p>{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                Last Updated
                            </p>
                            <p>{formatDate(user.updatedAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='flex flex-row justify-between items-center'>
                    <CardTitle>Associations</CardTitle>
                    <Button size='sm' variant='outline' asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                            <Pencil className='mr-2 h-4 w-4' />
                            Edit
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {user.agency && (
                        <div>
                            <h3 className='font-medium mb-2'>Agency</h3>
                            <div className='p-4 border rounded-lg'>
                                <p className='font-medium'>
                                    {user.agency.name}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    {user.agency.description ||
                                        "No description"}
                                </p>
                            </div>
                        </div>
                    )}

                    {user.stores && user.stores.length > 0 && (
                        <div>
                            <h3 className='font-medium mb-2'>
                                Stores ({user.stores.length})
                            </h3>
                            <div className='space-y-2'>
                                {user.stores.map((store: any) => (
                                    <div
                                        key={store.id}
                                        className='p-3 border rounded-lg'
                                    >
                                        <p className='font-medium'>
                                            {store.name}
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            {store.products?.length || 0}{" "}
                                            products
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
