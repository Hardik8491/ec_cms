import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CreateStoreForm } from "@/components/admin/stores/create-store-form";
import { UserService } from "@/services/user-service";
import { StoreService } from "@/services/store-service";

export default async function CreateStorePage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const [users, agencies, vendors] = await Promise.all([
        UserService.getUsersForStoreAssignment(),
        StoreService.getAgenciesForSelect(),
        StoreService.getVendorsForSelect(),
    ]);

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Create New Store</h1>
                    <Button asChild variant='outline'>
                        <Link href='/admin/stores'>Back to Stores</Link>
                    </Button>
                </div>
                <CreateStoreForm
                    users={users}
                    agencies={agencies}
                    vendors={vendors}
                />
            </div>
        </DashboardLayout>
    );
}
