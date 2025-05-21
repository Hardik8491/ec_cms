"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Store,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Package,
    ShoppingCart,
    Mail,
    Phone,
    Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { AgencyHeader } from "@/components/dashboard/agency-header";

interface Agency {
    id: string;
    name: string;
    email: string;
    phone?: string;
    website?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [agency, setAgency] = useState<Agency | null>(null);

    useEffect(() => {
        const fetchAgencyDetails = async () => {
            if (session?.user?.agencyId) {
                try {
                    const response = await fetch(
                        `/api/agencies/${session.user.agencyId}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setAgency(data.agency);
                    }
                } catch (error) {
                    console.error("Error fetching agency details:", error);
                }
            }
        };

        fetchAgencyDetails();
    }, [session?.user?.agencyId]);

    const navigationItems = {
        SUPER_ADMIN: [
            {
                title: "Dashboard",
                href: "/dashboard/admin",
                icon: BarChart3,
            },
            {
                title: "Agencies",
                href: "/dashboard/agencies",
                icon: Building2,
            },
            {
                title: "Stores",
                href: "/dashboard/stores",
                icon: Store,
            },
            {
                title: "Settings",
                href: "/dashboard/settings",
                icon: Settings,
            },
        ],
        AGENCY_ADMIN: [
            {
                title: "Dashboard",
                href: "/dashboard/agency",
                icon: BarChart3,
            },
            {
                title: "Stores",
                href: "/dashboard/stores",
                icon: Store,
            },
            {
                title: "Users",
                href: "/dashboard/agency/users",
                icon: Users,
            },
            {
                title: "Subscriptions",
                href: "/dashboard/agency/subscriptions",
                icon: CreditCard,
            },
            {
                title: "Settings",
                href: "/dashboard/agency/settings",
                icon: Settings,
            },
        ],
        AGENCY_USER: [
            {
                title: "Dashboard",
                href: "/dashboard/store",
                icon: BarChart3,
            },
            {
                title: "Products",
                href: "/dashboard/products",
                icon: Package,
            },
            {
                title: "Orders",
                href: "/dashboard/orders",
                icon: ShoppingCart,
            },
            {
                title: "Customers",
                href: "/dashboard/customers",
                icon: Users,
            },
            {
                title: "Settings",
                href: "/dashboard/settings",
                icon: Settings,
            },
        ],
    };

    const userRole = session?.user?.role || "AGENCY_USER";
    const filteredNavigationItems =
        navigationItems[userRole as keyof typeof navigationItems] || [];

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: "/auth/agency/login" });
    };

    return (
        <div className='flex h-screen'>
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-gray-900 text-white transition-all duration-300 flex flex-col",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <div className='flex h-16 items-center justify-between px-4 border-b border-gray-800'>
                    {!isCollapsed && (
                        <span className='text-lg font-semibold'>
                            {userRole === "SUPER_ADMIN"
                                ? "Admin Dashboard"
                                : userRole === "AGENCY_ADMIN"
                                ? "Agency Dashboard"
                                : "User Dashboard"}
                        </span>
                    )}
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-white hover:bg-gray-800'
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                    </Button>
                </div>

                {/* Agency Details */}
                {agency && !isCollapsed && (
                    <div className='p-4 border-b border-gray-800'>
                        <div className='space-y-3'>
                            <div>
                                <h3 className='text-sm font-medium text-gray-400'>
                                    Agency
                                </h3>
                                <p className='text-sm font-semibold'>
                                    {agency.name}
                                </p>
                            </div>
                            {agency.email && (
                                <div className='flex items-center text-sm text-gray-400'>
                                    <Mail className='h-4 w-4 mr-2' />
                                    <span>{agency.email}</span>
                                </div>
                            )}
                            {agency.phone && (
                                <div className='flex items-center text-sm text-gray-400'>
                                    <Phone className='h-4 w-4 mr-2' />
                                    <span>{agency.phone}</span>
                                </div>
                            )}
                            {agency.website && (
                                <div className='flex items-center text-sm text-gray-400'>
                                    <Globe className='h-4 w-4 mr-2' />
                                    <span>{agency.website}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className='flex-1 space-y-1 px-2 py-4 overflow-y-auto'>
                    {filteredNavigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium",
                                    pathname === item.href
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                )}
                            >
                                <Icon className='h-5 w-5' />
                                {!isCollapsed && (
                                    <span className='ml-3'>{item.title}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out Button */}
                <div className='p-4 border-t border-gray-800'>
                    <Button
                        variant='ghost'
                        className='w-full justify-start text-white hover:bg-gray-800'
                        onClick={handleSignOut}
                    >
                        <LogOut className='h-5 w-5' />
                        {!isCollapsed && <span className='ml-3'>Sign Out</span>}
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <div className='flex-1 flex flex-col overflow-hidden'>
                {/* Agency Header */}
                {(userRole === "AGENCY_ADMIN" ||
                    userRole === "AGENCY_USER") && <AgencyHeader />}

                {/* Main content area */}
                <main className='flex-1 overflow-auto bg-gray-100'>
                    <div className='container mx-auto p-6'>{children}</div>
                </main>
            </div>
        </div>
    );
}
