import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminService } from "@/services/admin-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { UsersTable } from "../users-table";

export const metadata: Metadata = {
    title: "User Management",
    description: "Manage all platform users",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const users = await AdminService.getAllUsers();

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>User Management</h1>
                    <Button asChild>
                        <Link href='/admin/users/create'>
                            <Plus className='mr-2 h-4 w-4' /> Create User
                        </Link>
                    </Button>
                </div>

                <UsersTable users={users} />
            </div>
        </DashboardLayout>
    );
}
