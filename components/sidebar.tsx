"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Building,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const isAdmin = session?.user?.role === "admin"
  const isAgency = session?.user?.role === "agency"

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Admin",
      href: "/admin",
      icon: <Building className="h-5 w-5" />,
      show: isAdmin,
    },
    {
      title: "Agency",
      href: "/agency",
      icon: <Building className="h-5 w-5" />,
      show: isAgency,
    },
    {
      title: "Stores",
      href: "/stores",
      icon: <Store className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Products",
      href: "/products",
      icon: <Package className="h-5 w-5" />,
      show: !isAdmin,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      show: !isAdmin,
    },
    {
      title: "Customers",
      href: "/customers",
      icon: <Users className="h-5 w-5" />,
      show: !isAdmin,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      show: true,
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 h-full transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center h-16 px-4 border-b dark:border-gray-800">
        <Link href="/" className="flex items-center">
          {!collapsed && <span className="text-xl font-bold">E-commerce CRM</span>}
          {collapsed && <Home className="h-6 w-6" />}
        </Link>
        <Button variant="ghost" size="icon" className={cn("ml-auto", collapsed ? "-mr-2" : "")} onClick={toggleSidebar}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === item.href ? "bg-gray-100 dark:bg-gray-800" : "transparent",
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
        </nav>
      </ScrollArea>
    </div>
  )
}
