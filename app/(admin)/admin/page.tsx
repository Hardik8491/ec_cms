import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminDashboard } from "./admin-dashboard";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminService } from "@/services/admin-service";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard",
    description: "Administrator control panel for managing the platform",
    keywords: ["admin", "dashboard", "management", "platform"],
    robots: {
        index: false, // Prevent search engine indexing for admin pages
        follow: false,
    },
    openGraph: {
        title: "Admin Dashboard",
        description: "Administrator control panel for managing the platform",
        // You might want to exclude admin pages from social sharing
        // so these URLs might not be necessary
        // url: "",
        // images: [],
    },
};

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const [stats, recentAgencies, recentStores] = await Promise.all([
        AdminService.getAdminStatistics(),
        AdminService.getRecentAgencies(),
        AdminService.getRecentStores(),
    ]);

    return (
        <DashboardLayout>
            <AdminDashboard
                stats={stats}
                recentAgencies={recentAgencies}
                recentStores={recentStores}
            />
        </DashboardLayout>
    );
}
