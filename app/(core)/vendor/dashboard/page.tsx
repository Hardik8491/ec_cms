import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { BarChart3, DollarSign, Package, ShoppingCart, Store } from "lucide-react"
import { getVendorByUserId, getVendorStats } from "@/lib/vendor"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (session.user.role !== "vendor") {
    redirect("/dashboard")
  }

  // Get vendor data
  const vendor = await getVendorByUserId(session.user.id)

  if (!vendor) {
    redirect("/vendor/onboarding")
  }

  // Get vendor stats
  const stats = await getVendorStats(vendor.id)

  // Get recent products
  const recentProducts = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      store: true,
    },
  })

  // Get recent orders
  const orderItems = await prisma.orderItem.findMany({
    where: {
      product: {
        vendorId: vendor.id,
      },
    },
    take: 10,
    orderBy: {
      order: {
        createdAt: "desc",
      },
    },
    include: {
      product: true,
      order: {
        include: {
          customer: true,
        },
      },
    },
  })

  // Deduplicate orders
  const orderMap = new Map()
  orderItems.forEach((item) => {
    if (!orderMap.has(item.orderId)) {
      orderMap.set(item.orderId, item.order)
    }
  })
  const recentOrders = Array.from(orderMap.values()).slice(0, 5)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {vendor.name}</p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/vendor/products/create">Add Product</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendor/settings">Settings</Link>
            </Button>
          </div>
        </div>

        {vendor.status !== "active" && (
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-yellow-200 dark:bg-yellow-800 p-2">
                  <Store className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Your vendor account is {vendor.status}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {vendor.status === "pending"
                      ? "Your account is pending approval. You can add products, but they won't be visible to customers until your account is approved."
                      : "Your account has been suspended. Please contact support for more information."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
              <p className="text-xs text-muted-foreground">Total products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders}</div>
              <p className="text-xs text-muted-foreground">Total orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.balance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available for payout</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Your recently added products</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No products yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/vendor/products/create">Add Product</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${product.price.toFixed(2)} · {product.store.name}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/vendor/products/${product.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your recent product orders</CardDescription>
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
                            {order.customer?.name || "Guest"} · {order.status}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/vendor/orders/${order.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
