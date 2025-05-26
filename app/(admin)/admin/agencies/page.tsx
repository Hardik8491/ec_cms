import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AgencyService } from "@/services/agency-service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AgenciesTable } from "./agencies-table";

export const metadata: Metadata = {
    title: "Agency Management",
    description: "Manage all agencies in the platform",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AgenciesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const agencies = await AgencyService.getAllAgencies();

    return (
        <DashboardLayout>
            <div className='space-y-6 p-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-3xl font-bold'>Agency Management</h1>
                    <Button asChild>
                        <Link href='/admin/agencies/create'>
                            <Plus className='mr-2 h-4 w-4' /> Create Agency
                        </Link>
                    </Button>
                </div>
                <AgenciesTable agencies={agencies} />
            </div>
        </DashboardLayout>
    );
}
