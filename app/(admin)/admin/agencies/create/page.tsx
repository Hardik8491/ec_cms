import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { Button } from "@/components/ui/button";
import { CreateAgencyForm } from "../ceate-agency-form";
import Link from "next/link";
import { AdminService } from "@/services/admin-service";
import { UserService } from "@/services/user-service";

export default async function CreateAgencyPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const users = await UserService.getUsersForAgencyAssignment();

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Create New Agency</h1>
                    <Button asChild variant='outline'>
                        <Link href='/admin/agencies'>Back to Agencies</Link>
                    </Button>
                </div>
                <CreateAgencyForm users={users} />
            </div>
        </DashboardLayout>
    );
}
