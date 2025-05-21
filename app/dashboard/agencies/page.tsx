"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CreateAgencyDialog } from "@/components/dashboard/create-agency-dialog";

interface Agency {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    users: {
        id: string;
        name: string;
        email: string;
        role: string;
    }[];
    stores: {
        id: string;
        name: string;
        slug: string;
    }[];
    subscription?: {
        status: string;
        plan: string;
    };
}

export default function AgenciesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        if (session?.user?.role !== "SUPER_ADMIN") {
            router.push("/dashboard");
            return;
        }

        fetchAgencies();
    }, [session, router]);

    async function fetchAgencies() {
        try {
            const response = await fetch("/api/agencies");
            if (!response.ok) {
                throw new Error("Failed to fetch agencies");
            }
            const data = await response.json();
            setAgencies(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch agencies",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (session?.user?.role !== "SUPER_ADMIN") {
        return null;
    }

    return (
        <div className='container mx-auto py-6'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-3xl font-bold'>Agencies</h1>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Create Agency
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Agency List</CardTitle>
                    <CardDescription>
                        Manage your agencies and their subscriptions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Stores</TableHead>
                                    <TableHead>Subscription</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agencies.map((agency) => (
                                    <TableRow key={agency.id}>
                                        <TableCell className='font-medium'>
                                            {agency.name}
                                        </TableCell>
                                        <TableCell>{agency.slug}</TableCell>
                                        <TableCell>
                                            {agency.users.length}
                                        </TableCell>
                                        <TableCell>
                                            {agency.stores.length}
                                        </TableCell>
                                        <TableCell>
                                            {agency.subscription ? (
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        agency.subscription
                                                            .status === "ACTIVE"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {agency.subscription.plan}
                                                </span>
                                            ) : (
                                                <span className='text-muted-foreground'>
                                                    No subscription
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant='ghost'
                                                onClick={() =>
                                                    router.push(
                                                        `/dashboard/agencies/${agency.id}`
                                                    )
                                                }
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreateAgencyDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchAgencies}
            />
        </div>
    );
}
