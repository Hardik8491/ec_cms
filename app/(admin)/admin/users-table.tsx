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

export function UsersTable({ users }: { users: any[] }) {
    return (
        <div className='rounded-md border'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className='font-medium'>
                                <div className='flex items-center gap-2'>
                                    {user.image && (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            className='h-8 w-8 rounded-full'
                                        />
                                    )}
                                    {user.name}
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        user.role === "admin"
                                            ? "destructive"
                                            : "outline"
                                    }
                                >
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>{user.agency?.name || "-"}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        user.emailVerified
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {user.emailVerified
                                        ? "Verified"
                                        : "Pending"}
                                </Badge>
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
                                                href={`/admin/users/${user.id}`}
                                                className='flex items-center'
                                            >
                                                <Pencil className='mr-2 h-4 w-4' />
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className='text-red-600'>
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
