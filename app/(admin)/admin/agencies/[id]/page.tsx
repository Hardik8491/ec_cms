// "use client";

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
import { BasicAgency } from "@/types/agency";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export function AgenciesTable({ agencies }: { agencies: BasicAgency[] }) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/agencies/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete agency");
            }

            toast({
                title: "Success",
                description: "Agency deleted successfully",
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
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Subdomain</TableHead>
                        <TableHead>AI Status</TableHead>
                        <TableHead>Stores</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {agencies.map((agency) => (
                        <TableRow key={agency.id}>
                            <TableCell className='font-medium'>
                                <div className='flex items-center gap-2'>
                                    {agency.logo && (
                                        <img
                                            src={agency.logo}
                                            alt={agency.name}
                                            className='h-8 w-8 rounded-full'
                                        />
                                    )}
                                    {agency.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                {agency.user.name || agency.user.email}
                            </TableCell>
                            <TableCell>
                                {agency.subdomain ? (
                                    <Badge variant='outline'>
                                        {agency.subdomain}
                                    </Badge>
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        agency.aiEnabled
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {agency.aiEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </TableCell>
                            <TableCell>{agency._count?.stores || 0}</TableCell>
                            <TableCell>
                                {formatDate(agency.createdAt)}
                            </TableCell>
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
                                                href={`/admin/agencies/${agency.id}`}
                                                className='flex items-center'
                                            >
                                                <Pencil className='mr-2 h-4 w-4' />
                                                View/Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='text-red-600'
                                            onClick={() =>
                                                handleDelete(agency.id)
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
