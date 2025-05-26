"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { BasicStore } from "@/types/store";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export function StoresTable({ stores }: { stores: BasicStore[] }) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/stores/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete store");
            }

            toast({
                title: "Success",
                description: "Store deleted successfully",
            });

            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    return (
        <div className='rounded-md border'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Store</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>AI</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stores.map((store) => (
                        <TableRow key={store.id}>
                            <TableCell className='font-medium'>
                                <div className='flex items-center gap-2'>
                                    {store.logo && (
                                        <img
                                            src={store.logo}
                                            alt={store.name}
                                            className='h-8 w-8 rounded-full'
                                        />
                                    )}
                                    {store.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                {store.user.name || store.user.email}
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>{store._count?.products || 0}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        store.aiEnabled
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {store.aiEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </TableCell>
                            <TableCell>{formatDate(store.createdAt)}</TableCell>
                            <TableCell className='text-right'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' size='sm'>
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={`/admin/stores/${store.id}`}
                                                className='flex items-center'
                                            >
                                                <Pencil className='mr-2 h-4 w-4' />
                                                View/Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='text-red-600'
                                            onClick={() =>
                                                handleDelete(store.id)
                                            }
                                        >
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
