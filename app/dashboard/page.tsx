import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";
import Agency from "../(agency)/agency/page";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Admin from "../(admin)/admin/page";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    // If not authenticated, redirect to signin
    if (!session?.user) {
        redirect("/auth/signin");
    }

    return (
        <div>
            {/* Show role-specific dashboard content */}
            {session.user.role === "agency" && <Agency />}
            {session.user.role === "admin" && <Admin />}
            {/* {session.user.role === "user" && <UserDashboard />} */}
        </div>
    );
}
