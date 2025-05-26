import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StoreService } from "@/services/store-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { EditStoreForm } from "@/components/admin/stores/edit-store-form";
import { UserService } from "@/services/user-service";

export default async function EditStorePage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const [store, users, agencies, vendors] = await Promise.all([
        StoreService.getStoreById(params.id),
        UserService.getUsersForStoreAssignment(),
        StoreService.getAgenciesForSelect(),
        StoreService.getVendorsForSelect(),
    ]);

    if (!store) {
        notFound();
    }

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Edit Store</h1>
                    <Button asChild variant='outline'>
                        <Link href={`/admin/stores/${params.id}`}>
                            Back to Profile
                        </Link>
                    </Button>
                </div>
                <EditStoreForm
                    store={store}
                    users={users}
                    agencies={agencies}
                    vendors={vendors}
                />
            </div>
        </DashboardLayout>
    );
}
