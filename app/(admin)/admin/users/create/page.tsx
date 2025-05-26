// import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminService } from "@/services/admin-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { CreateUserForm } from "../../create-user-form";

export default async function CreateUserPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const agencies = await AdminService.getAgenciesForSelect();

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Create New User</h1>
                    <Button asChild variant='outline'>
                        <Link href='/admin/users'>Back to Users</Link>
                    </Button>
                </div>

                <CreateUserForm agencies={agencies} />
            </div>
        </DashboardLayout>
    );
}
