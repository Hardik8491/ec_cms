"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  CreditCard,
  FileText,
  Globe,
  Key,
  Bell,
  Shield,
  Zap,
  TrendingUp,
  UserCheck,
  Database,
  Palette,
  Mail,
  Tag,
  Heart,
  MessageSquare,
  Receipt,
  PieChart,
  Activity,
  Target,
  Briefcase,
  Crown,
  UserCog,
  Bot,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
  roles?: string[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "dashboard",
    "stores",
  ]);

  const userRole = session?.user?.role?.toLowerCase() || "user";

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin", "agency", "user"],
    },
    {
      title: "AI Assistant",
      href: "/ai-assistant",
      icon: <Bot className="h-5 w-5" />,
      badge: "NEW",
      roles: ["admin", "agency", "user"],
    },
    {
      title: "Admin Panel",
      icon: <Crown className="h-5 w-5" />,
      roles: ["admin"],
      children: [
        {
          title: "Overview",
          href: "/admin",
          icon: <Home className="h-4 w-4" />,
        },
        {
          title: "Users",
          href: "/admin/users",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Agencies",
          href: "/admin/agencies",
          icon: <Building className="h-4 w-4" />,
        },
        {
          title: "All Stores",
          href: "/admin/stores",
          icon: <Store className="h-4 w-4" />,
        },
        {
          title: "Marketplace",
          href: "/admin/marketplace",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          title: "System Settings",
          href: "/admin/settings",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          title: "Analytics",
          href: "/admin/analytics",
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Agency Management",
      icon: <Briefcase className="h-5 w-5" />,
      roles: ["agency"],
      children: [
        {
          title: "Agency Dashboard",
          href: "/agency",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          title: "My Stores",
          href: "/agency/stores",
          icon: <Store className="h-4 w-4" />,
        },
        {
          title: "Team Management",
          href: "/agency/team",
          icon: <UserCog className="h-4 w-4" />,
        },
        {
          title: "Client Management",
          href: "/agency/clients",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Analytics",
          href: "/agency/analytics",
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          title: "Settings",
          href: "/agency/settings",
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Store Management",
      icon: <Store className="h-5 w-5" />,
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "My Stores",
          href: "/stores",
          icon: <Store className="h-4 w-4" />,
          roles: ["user"],
        },
        {
          title: "Products",
          href: "/products",
          icon: <Package className="h-4 w-4" />,
          roles: ["user"],
        },
        {
          title: "Categories",
          href: "/categories",
          icon: <Tag className="h-4 w-4" />,
          roles: ["user"],
        },
        {
          title: "Orders",
          href: "/orders",
          icon: <ShoppingCart className="h-4 w-4" />,
          roles: ["user"],
        },
        {
          title: "Customers",
          href: "/customers",
          icon: <Users className="h-4 w-4" />,
          roles: ["user"],
        },
        {
          title: "Reviews",
          href: "/reviews",
          icon: <MessageSquare className="h-4 w-4" />,
          roles: ["user"],
        },
      ],
    },
    {
      title: "Inventory & Warehouse",
      icon: <Database className="h-5 w-5" />,
      badge: "NEW",
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "Inventory Overview",
          href: "/inventory",
          icon: <Package className="h-4 w-4" />,
        },
        {
          title: "Warehouses",
          href: "/warehouses",
          icon: <Building className="h-4 w-4" />,
        },
        {
          title: "Stock Movements",
          href: "/inventory/movements",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: "Purchase Orders",
          href: "/inventory/purchase-orders",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Suppliers",
          href: "/inventory/suppliers",
          icon: <Truck className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Customer Management",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "Customer List",
          href: "/customers",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Customer Journey",
          href: "/customers/journey",
          icon: <Target className="h-4 w-4" />,
          badge: "NEW",
        },
        {
          title: "Segments",
          href: "/customers/segments",
          icon: <PieChart className="h-4 w-4" />,
        },
        {
          title: "Support Tickets",
          href: "/customers/support",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Analytics & Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "Overview",
          href: "/analytics",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: "Sales Analytics",
          href: "/analytics/sales",
          icon: <PieChart className="h-4 w-4" />,
        },
        {
          title: "Customer Analytics",
          href: "/analytics/customers",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Product Analytics",
          href: "/analytics/products",
          icon: <Package className="h-4 w-4" />,
        },
        {
          title: "Traffic Analytics",
          href: "/analytics/traffic",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Reports",
          href: "/analytics/reports",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Marketing",
      icon: <Target className="h-5 w-5" />,
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "Campaigns",
          href: "/marketing/campaigns",
          icon: <Zap className="h-4 w-4" />,
          badge: "NEW",
        },
        {
          title: "Email Marketing",
          href: "/marketing/email",
          icon: <Mail className="h-4 w-4" />,
        },
        {
          title: "Discounts & Coupons",
          href: "/marketing/discounts",
          icon: <Tag className="h-4 w-4" />,
        },
        {
          title: "Loyalty Program",
          href: "/marketing/loyalty",
          icon: <Heart className="h-4 w-4" />,
        },
        {
          title: "Automation",
          href: "/marketing/automation",
          icon: <Zap className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Marketplace",
      icon: <Globe className="h-5 w-5" />,
      badge: "NEW",
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "Browse Marketplace",
          href: "/marketplace",
          icon: <Store className="h-4 w-4" />,
        },
        {
          title: "Vendor Dashboard",
          href: "/vendor/dashboard",
          icon: <Briefcase className="h-4 w-4" />,
          roles: ["vendor"],
        },
        {
          title: "Vendor Onboarding",
          href: "/vendor/onboarding",
          icon: <UserCheck className="h-4 w-4" />,
          roles: ["vendor"],
        },
        {
          title: "Marketplace Analytics",
          href: "/marketplace/analytics",
          icon: <BarChart3 className="h-4 w-4" />,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Integrations",
      icon: <Globe className="h-5 w-5" />,
      badge: "NEW",
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "Integration Hub",
          href: "/integrations",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          title: "API Management",
          href: "/integrations/api",
          icon: <Key className="h-4 w-4" />,
        },
        {
          title: "Webhooks",
          href: "/integrations/webhooks",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          title: "Connected Apps",
          href: "/integrations/apps",
          icon: <Package className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Payments & Finance",
      icon: <CreditCard className="h-5 w-5" />,
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "Transactions",
          href: "/finance/transactions",
          icon: <Receipt className="h-4 w-4" />,
        },
        {
          title: "Payouts",
          href: "/finance/payouts",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: "Tax Settings",
          href: "/finance/tax",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Payment Methods",
          href: "/finance/payment-methods",
          icon: <CreditCard className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "agency", "user"],
      children: [
        {
          title: "General",
          href: "/settings",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          title: "Profile",
          href: "/settings/profile",
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          title: "Security",
          href: "/settings/security",
          icon: <Shield className="h-4 w-4" />,
        },
        {
          title: "Notifications",
          href: "/settings/notifications",
          icon: <Bell className="h-4 w-4" />,
        },
        {
          title: "API Keys",
          href: "/settings/api-keys",
          icon: <Key className="h-4 w-4" />,
        },
        {
          title: "Integrations",
          href: "/settings/integrations",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          title: "Appearance",
          href: "/settings/appearance",
          icon: <Palette className="h-4 w-4" />,
        },
      ],
    },
  ];

  const filterItemsByRole = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => ({
        ...item,
        children: item.children ? filterItemsByRole(item.children) : undefined,
      }));
  };

  const filteredNavigation = filterItemsByRole(navigationItems);

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? pathname === item.href : false;
    const isOpen = openSections.includes(
      item.title.toLowerCase().replace(/\s+/g, "-")
    );

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() =>
            toggleSection(item.title.toLowerCase().replace(/\s+/g, "-"))
          }
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-3 py-2 text-sm font-medium",
                level > 0 && "ml-4",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              {item.icon}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link key={item.title} href={item.href || "#"}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 px-3 py-2 text-sm font-medium",
            level > 0 && "ml-4",
            isActive && "bg-accent text-accent-foreground"
          )}
        >
          {item.icon}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          {!collapsed && <span className="text-lg font-semibold">EC-OS</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => renderNavItem(item))}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium">{session?.user?.name}</div>
              <div className="text-muted-foreground capitalize">{userRole}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
