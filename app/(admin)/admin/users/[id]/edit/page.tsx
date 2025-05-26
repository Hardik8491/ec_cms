import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminService } from "@/services/admin-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditUserForm } from "../../../edit-user-form";

export default async function EditUserPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const [user, agencies] = await Promise.all([
        AdminService.getUserById(params.id),
        AdminService.getAgenciesForSelect(),
    ]);

    if (!user) {
        notFound();
    }

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Edit User</h1>
                    <Button asChild variant='outline'>
                        <Link href={`/admin/users/${params.id}`}>
                            Back to Profile
                        </Link>
                    </Button>
                </div>

                <EditUserForm user={user} agencies={agencies} />
            </div>
        </DashboardLayout>
    );
}
