import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StoreService } from "@/services/store-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { StoresTable } from "./stores-table";

export const metadata: Metadata = {
    title: "Store Management",
    description: "Manage all stores in the platform",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function StoresPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const stores = await StoreService.getAllStores();

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Store Management</h1>
                    <Button asChild>
                        <Link href='/admin/stores/create'>
                            <Plus className='mr-2 h-4 w-4' /> Create Store
                        </Link>
                    </Button>
                </div>
                <StoresTable stores={stores} />
            </div>
        </DashboardLayout>
    );
}
