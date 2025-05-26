import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Package, Plus, Settings, ShoppingCart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

interface StorePageProps {
  params: {
    storeId: string
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeId } = params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "agency") {
    redirect("/dashboard")
  }

  // Fetch agency
  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
  })

  if (!agency) {
    redirect("/agency")
  }

  // Fetch store
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
      agencyId: agency.id,
    },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          customers: true,
        },
      },
    },
  })

  if (!store) {
    notFound()
  }

  // Fetch recent products
  const recentProducts = await prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Fetch recent orders
  const recentOrders = await prisma.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      customer: true,
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{store.name}</h1>
            {store.description && <p className="text-muted-foreground">{store.description}</p>}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/agency/stores/${storeId}/edit`}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/agency/stores/${storeId}/api-keys`}>API Keys</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{store._count.products}</div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/agency/stores/${storeId}/products`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{store._count.orders}</div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/agency/stores/${storeId}/orders`}>View Orders</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{store._count.customers}</div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/agency/stores/${storeId}/customers`}>View Customers</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Products</CardTitle>
                  <CardDescription>Latest products added to the store</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Package className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No products yet</p>
                      <Button asChild className="mt-4">
                        <Link href={`/agency/stores/${storeId}/products/create`}>
                          <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${product.price.toFixed(2)} · {product.quantity} in stock
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agency/stores/${storeId}/products/${product.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/agency/stores/${storeId}/products`}>View All Products</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">Order #{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                ${order.total.toFixed(2)} · {order.status}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agency/stores/${storeId}/orders/${order.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/agency/stores/${storeId}/orders`}>View All Orders</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your store products</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/agency/stores/${storeId}/products/create`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {store._count.products === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Package className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No products yet</p>
                    <Button asChild className="mt-4">
                      <Link href={`/agency/stores/${storeId}/products/create`}>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">View all products</p>
                    <Button asChild className="mt-4">
                      <Link href={`/agency/stores/${storeId}/products`}>View Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>Manage your store orders</CardDescription>
              </CardHeader>
              <CardContent>
                {store._count.orders === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">View all orders</p>
                    <Button asChild className="mt-4">
                      <Link href={`/agency/stores/${storeId}/orders`}>View Orders</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Store Analytics</CardTitle>
                <CardDescription>Performance metrics for your store</CardDescription>
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
