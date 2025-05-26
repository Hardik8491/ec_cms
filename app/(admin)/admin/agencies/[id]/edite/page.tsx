import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AgencyService } from "@/services/agency-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { AdminService } from "@/services/admin-service";
import { EditAgencyForm } from "../../edit-agency-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserService } from "@/services/user-service";

export default async function EditAgencyPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const [agency, users] = await Promise.all([
        AgencyService.getAgencyById(params.id),
        UserService.getUsersForAgencyAssignment(),
    ]);

    if (!agency) {
        notFound();
    }

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Edit Agency</h1>
                    <Button asChild variant='outline'>
                        <Link href={`/admin/agencies/${params.id}`}>
                            Back to Profile
                        </Link>
                    </Button>
                </div>
                <EditAgencyForm agency={agency} users={users} />
            </div>
        </DashboardLayout>
    );
}
