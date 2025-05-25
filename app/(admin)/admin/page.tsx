import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, Building, Plus, Store, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch admin statistics
  const userCount = await prisma.user.count();
  const agencyCount = await prisma.agency.count();
  const storeCount = await prisma.store.count();
  const orderCount = await prisma.order.count();

  // Fetch recent agencies
  const recentAgencies = await prisma.agency.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      _count: {
        select: {
          stores: true,
        },
      },
    },
  });

  // Fetch recent stores
  const recentStores = await prisma.store.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      agency: true,
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/admin/agencies/create">
                <Plus className="mr-2 h-4 w-4" /> Create Agency
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/users/create">Create User</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Agencies
              </CardTitle>
              <Building className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agencyCount}</div>
              <p className="text-xs text-muted-foreground">Active agencies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Stores
              </CardTitle>
              <Store className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeCount}</div>
              <p className="text-xs text-muted-foreground">Active stores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount}</div>
              <p className="text-xs text-muted-foreground">Across all stores</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agencies">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="agencies" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Agencies</h2>
              <Button asChild>
                <Link href="/admin/agencies">View All</Link>
              </Button>
            </div>

            {recentAgencies.length === 0 ? (
              <Card className="text-center p-10">
                <CardContent className="pt-10 pb-10">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No agencies yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first agency to start managing e-commerce
                    businesses.
                  </p>
                  <Button asChild>
                    <Link href="/admin/agencies/create">
                      <Plus className="mr-2 h-4 w-4" /> Create Agency
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentAgencies.map((agency) => (
                  <Card key={agency.id}>
                    <CardHeader>
                      <CardTitle>{agency.name}</CardTitle>
                      <CardDescription>
                        {agency.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Owner:
                          </span>
                          <span className="font-medium">
                            {agency.user.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Stores:
                          </span>
                          <span className="font-medium">
                            {agency._count.stores}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Created:
                          </span>
                          <span className="font-medium">
                            {new Date(agency.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/admin/agencies/${agency.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stores" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Stores</h2>
              <Button asChild>
                <Link href="/admin/stores">View All</Link>
              </Button>
            </div>

            {recentStores.length === 0 ? (
              <Card className="text-center p-10">
                <CardContent className="pt-10 pb-10">
                  <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No stores yet</h3>
                  <p className="text-muted-foreground mb-6">
                    No stores have been created yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentStores.map((store) => (
                  <Card key={store.id}>
                    <CardHeader>
                      <CardTitle>{store.name}</CardTitle>
                      <CardDescription>
                        {store.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Owner:
                          </span>
                          <span className="font-medium">{store.user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Agency:
                          </span>
                          <span className="font-medium">
                            {store.agency?.name || "None"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Products:
                          </span>
                          <span className="font-medium">
                            {store._count.products}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Orders:
                          </span>
                          <span className="font-medium">
                            {store._count.orders}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/admin/stores/${store.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Marketplace Overview</h2>
              <Button asChild>
                <Link href="/marketplace">View Marketplace</Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">
                    Active marketplace vendors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Marketplace Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$125,430</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commission Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,543</div>
                  <p className="text-xs text-muted-foreground">
                    Platform commission
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Inventory Overview</h2>
              <Button asChild>
                <Link href="/inventory">Manage Inventory</Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total SKUs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,345</div>
                  <p className="text-xs text-muted-foreground">
                    Across all stores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">23</div>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$456,789</div>
                  <p className="text-xs text-muted-foreground">
                    Total inventory value
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">AI Insights</h2>
              <Button asChild>
                <Link href="/ai-assistant">Open AI Assistant</Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">
                        Pricing Optimization
                      </p>
                      <p className="text-xs text-muted-foreground">
                        15 products could benefit from price adjustments
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium">Inventory Forecast</p>
                      <p className="text-xs text-muted-foreground">
                        Restock 8 items before next week
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium">
                        Marketing Opportunity
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Target 234 customers for re-engagement
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Usage Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Queries Today:</span>
                      <span className="font-medium">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Actions Taken:</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy Rate:</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Overall platform performance</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="flex items-center justify-center h-full">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground ml-4">
                    Analytics data will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
