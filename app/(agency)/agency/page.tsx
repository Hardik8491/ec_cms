import DashboardClient from "@/app/(core)/dashboard/components/dashboard-client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function Agency() {
    return (
        <>
            <DashboardLayout>
                <DashboardClient />
            </DashboardLayout>
        </>
    );
}
