import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import { BarChart3, Package, ShoppingCart, Store, Users } from "lucide-react";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch data based on user role
  let storeCount = 0;
  let productCount = 0;
  let orderCount = 0;
  let customerCount = 0;
  const recentOrders = [];

  if (session.user.role === "admin") {
    // Admin sees global stats
    storeCount = await prisma.store.count();
    productCount = await prisma.product.count();
    orderCount = await prisma.order.count();
    customerCount = await prisma.customer.count();
  } else if (session.user.role === "agency") {
    // Agency sees stats for all their stores
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    });

    if (agency) {
      storeCount = await prisma.store.count({
        where: { agencyId: agency.id },
      });

      const storeIds = (
        await prisma.store.findMany({
          where: { agencyId: agency.id },
          select: { id: true },
        })
      ).map((store) => store.id);

      productCount = await prisma.product.count({
        where: { storeId: { in: storeIds } },
      });

      orderCount = await prisma.order.count({
        where: { storeId: { in: storeIds } },
      });

      customerCount = await prisma.customer.count({
        where: { storeId: { in: storeIds } },
      });
    }
  } else {
    // Regular user sees stats for their stores
    storeCount = await prisma.store.count({
      where: { userId: session.user.id },
    });

    const storeIds = (
      await prisma.store.findMany({
        where: { userId: session.user.id },
        select: { id: true },
      })
    ).map((store) => store.id);

    productCount = await prisma.product.count({
      where: { storeId: { in: storeIds } },
    });

    orderCount = await prisma.order.count({
      where: { storeId: { in: storeIds } },
    });

    customerCount = await prisma.customer.count({
      where: { storeId: { in: storeIds } },
    });
  }

  return (
  
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Stores
              </CardTitle>
              <Store className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeCount}</div>
              <p className="text-xs text-muted-foreground">
                {session.user.role === "admin"
                  ? "Across all users"
                  : session.user.role === "agency"
                  ? "Managed by your agency"
                  : "Owned by you"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productCount}</div>
              <p className="text-xs text-muted-foreground">
                {session.user.role === "admin"
                  ? "Across all stores"
                  : "In your stores"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount}</div>
              <p className="text-xs text-muted-foreground">
                {session.user.role === "admin"
                  ? "Across all stores"
                  : "In your stores"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerCount}</div>
              <p className="text-xs text-muted-foreground">
                {session.user.role === "admin"
                  ? "Across all stores"
                  : "In your stores"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for your stores</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex items-center justify-center h-full">
                <BarChart3 className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Revenue data will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest orders across your stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders will appear here once created
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Order data will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
   
  );
}
