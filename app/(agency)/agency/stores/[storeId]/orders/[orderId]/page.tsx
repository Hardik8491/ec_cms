import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { OrderStatusActions } from "@/components/order-status-actions"

const prisma = new PrismaClient()

interface OrderPageProps {
  params: {
    storeId: string
    orderId: string
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { storeId, orderId } = params
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
  })

  if (!store) {
    notFound()
  }

  // Fetch order with all details
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      storeId,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      tracking: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/agency/stores/${storeId}/orders`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
              <span className="sr-only">Print</span>
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Order Details</CardTitle>
                  <Badge
                    className={
                      order.status === "completed"
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200"
                            : undefined
                    }
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>
                  Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0] || "/placeholder.svg"}
                                alt={item.name}
                                className="h-16 w-16 object-cover rounded"
                              />
                            ) : (
                              <div className="text-2xl font-bold text-gray-400">{item.name.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                            {item.options && Object.keys(item.options).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Object.entries(item.options as Record<string, string>).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-medium">${item.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {order.shipping > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${order.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <OrderStatusActions orderId={order.id} storeId={storeId} currentStatus={order.status} />
              </CardFooter>
            </Card>

            {order.tracking.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.tracking.map((track) => (
                      <div key={track.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{track.status}</p>
                            {track.carrier && track.trackingNumber && (
                              <p className="text-sm">
                                {track.carrier}: {track.trackingNumber}
                              </p>
                            )}
                            {track.notes && <p className="text-sm text-muted-foreground">{track.notes}</p>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(track.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {order.customer ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm">{order.customer.email}</p>
                      {order.customer.phone && <p className="text-sm">{order.customer.phone}</p>}
                    </div>
                    {order.customer.address && (
                      <div>
                        <p className="text-sm font-medium">Default Address</p>
                        <p className="text-sm">{order.customer.address}</p>
                        <p className="text-sm">
                          {order.customer.city}, {order.customer.state} {order.customer.postalCode}
                        </p>
                        <p className="text-sm">{order.customer.country}</p>
                      </div>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/agency/stores/${storeId}/customers/${order.customer.id}`}>View Customer</Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Guest checkout</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 ? (
                  <div>
                    <p className="font-medium">{(order.shippingAddress as any).name || order.customer?.name || ""}</p>
                    <p className="text-sm">{(order.shippingAddress as any).address}</p>
                    <p className="text-sm">
                      {(order.shippingAddress as any).city}, {(order.shippingAddress as any).state}{" "}
                      {(order.shippingAddress as any).postalCode}
                    </p>
                    <p className="text-sm">{(order.shippingAddress as any).country}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No shipping address provided</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge
                      variant="outline"
                      className={
                        order.paymentStatus === "paid"
                          ? "border-green-500 text-green-600 dark:border-green-500 dark:text-green-400"
                          : order.paymentStatus === "failed"
                            ? "border-red-500 text-red-600 dark:border-red-500 dark:text-red-400"
                            : undefined
                      }
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Method</span>
                    <span>{order.paymentMethod || "Not specified"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
