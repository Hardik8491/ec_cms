import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminService } from "@/services/admin-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { UserProfile } from "../../user-profile";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function UserDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const user = await AdminService.getUserById(params.id);

    if (!user) {
        notFound();
    }

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>User Profile</h1>
                    <Button asChild variant='outline'>
                        <Link href='/admin/users'>Back to Users</Link>
                    </Button>
                </div>

                <UserProfile user={user} />
            </div>
        </DashboardLayout>
    );
}
