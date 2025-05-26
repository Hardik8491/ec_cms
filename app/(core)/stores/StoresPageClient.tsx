"use client";

import { Store, Plus } from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StoreType {
    id: string;
    name: string;
    description?: string | null;
    user?: {
        name: string | null;
    };
    _count: {
        products: number;
    };
}

interface StoresPageClientProps {
    stores: StoreType[];
    userRole: "admin" | "agency" | string;
}

export default function StoresPageClient({
    stores,
    userRole,
}: StoresPageClientProps) {
    return (
        <div className='container mx-auto py-10'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold'>Stores</h1>
                <Button asChild>
                    <Link href='/stores/create'>
                        <Plus className='mr-2 h-4 w-4' /> Create Store
                    </Link>
                </Button>
            </div>

            {stores.length === 0 ? (
                <Card className='text-center p-10'>
                    <CardContent className='pt-10 pb-10'>
                        <Store className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                        <h3 className='text-lg font-medium mb-2'>
                            No stores found
                        </h3>
                        <p className='text-muted-foreground mb-6'>
                            You haven't created any stores yet. Create your
                            first store to get started.
                        </p>
                        <Button asChild>
                            <Link href='/stores/create'>
                                <Plus className='mr-2 h-4 w-4' /> Create Store
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {stores.map((store) => (
                        <Card key={store.id}>
                            <CardHeader>
                                <CardTitle>{store.name}</CardTitle>
                                <CardDescription>
                                    {store.description || "No description"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm text-muted-foreground'>
                                            Products
                                        </p>
                                        <p className='text-2xl font-bold'>
                                            {store._count.products}
                                        </p>
                                    </div>
                                    {userRole === "admin" && (
                                        <div className='text-right'>
                                            <p className='text-sm text-muted-foreground'>
                                                Owner
                                            </p>
                                            <p className='text-sm font-medium'>
                                                {store.user?.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button variant='outline' asChild>
                                    <Link href={`/stores/${store.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href={`/stores/${store.id}/products`}>
                                        Manage Products
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
