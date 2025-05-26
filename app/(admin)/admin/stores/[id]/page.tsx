import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StoreService } from "@/services/store-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoreProfile } from "../store-profile";


export default async function StoreDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const store = await StoreService.getStoreById(params.id);

    if (!store) {
        notFound();
    }

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Store Profile</h1>
                    <Button asChild variant='outline'>
                        <Link href='/admin/stores'>Back to Stores</Link>
                    </Button>
                </div>
                <StoreProfile store={store} />
            </div>
        </DashboardLayout>
    );
}
