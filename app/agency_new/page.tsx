import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Plus, Store } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const prisma = new PrismaClient()

export default async function AgencyPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "agency") {
    redirect("/dashboard")
  }

  // Fetch agency data
  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
    include: {
      stores: {
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
              customers: true,
            },
          },
        },
      },
      subscription: true,
    },
  })

  if (!agency) {
    // Create agency if it doesn't exist
    await prisma.agency.create({
      data: {
        name: `${session.user.name}'s Agency`,
        userId: session.user.id,
      },
    })

    redirect("/agency")
  }

  // Calculate total stats
  const totalProducts = agency.stores.reduce((sum, store) => sum + store._count.products, 0)
  const totalOrders = agency.stores.reduce((sum, store) => sum + store._count.orders, 0)
  const totalCustomers = agency.stores.reduce((sum, store) => sum + store._count.customers, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agency Dashboard</h1>
          <Button asChild>
            <Link href="/agency/settings">Agency Settings</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Agency Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-medium">{agency.name}</p>
              </div>
              {agency.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{agency.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                <p className="text-sm capitalize">{agency.subscription?.plan || "Free"}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/agency/edit">Edit Agency</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Stores</CardTitle>
              <CardDescription>Manage your client stores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{agency.stores.length}</div>
              <p className="text-sm text-muted-foreground">Total stores managed</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/agency/stores">
                  <Plus className="mr-2 h-4 w-4" /> Create Store
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performance</CardTitle>
              <CardDescription>Overall agency performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Products:</span>
                <span className="font-medium">{totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Orders:</span>
                <span className="font-medium">{totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Customers:</span>
                <span className="font-medium">{totalCustomers}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/agency/analytics">View Analytics</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="stores">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Managed Stores</h2>
              <Button asChild>
                <Link href="/agency/stores">
                  <Plus className="mr-2 h-4 w-4" /> Create Store
                </Link>
              </Button>
            </div>

            {agency.stores.length === 0 ? (
              <Card className="text-center p-10">
                <CardContent className="pt-10 pb-10">
                  <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No stores yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first store to start managing e-commerce for your clients.
                  </p>
                  <Button asChild>
                    <Link href="/agency/stores">
                      <Plus className="mr-2 h-4 w-4" /> Create Store
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agency.stores.map((store) => (
                  <Card key={store.id}>
                    <CardHeader>
                      <CardTitle>{store.name}</CardTitle>
                      <CardDescription>{store.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Products</p>
                          <p className="text-2xl font-bold">{store._count.products}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Orders</p>
                          <p className="text-2xl font-bold">{store._count.orders}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Customers</p>
                          <p className="text-2xl font-bold">{store._count.customers}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" asChild>
                        <Link href={`/agency/stores/${store.id}`}>Manage</Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/agency/stores/${store.id}/analytics`}>Analytics</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Agency Analytics</CardTitle>
                <CardDescription>Performance across all stores</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="flex items-center justify-center h-full">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground ml-4">Analytics data will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
