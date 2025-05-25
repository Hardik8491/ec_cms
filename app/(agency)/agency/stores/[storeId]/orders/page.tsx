import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Search, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const prisma = new PrismaClient()

interface OrdersPageProps {
  params: {
    storeId: string
  }
  searchParams: {
    q?: string
    status?: string
    page?: string
  }
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const { storeId } = params
  const session = await getServerSession(authOptions)
  const search = searchParams.q || ""
  const statusFilter = searchParams.status || ""
  const currentPage = Number(searchParams.page) || 1
  const pageSize = 10

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

  // Build where clause for search and filters
  const where = {
    storeId,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  }

  // Fetch orders with pagination
  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  })

  // Get total count for pagination
  const totalOrders = await prisma.order.count({ where })
  const totalPages = Math.ceil(totalOrders / pageSize)

  // Get order status counts for filters
  const statusCounts = await prisma.$queryRaw`
    SELECT status, COUNT(*) as count
    FROM "Order"
    WHERE "storeId" = ${storeId}
    GROUP BY status
  `

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Orders</h1>
          <Button asChild>
            <Link href={`/agency/stores/${storeId}/orders/create`}>Create Order</Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Link href={`/agency/stores/${storeId}/orders`}>
              <Badge variant={!statusFilter ? "default" : "outline"} className="cursor-pointer">
                All
              </Badge>
            </Link>
            {Array.isArray(statusCounts) &&
              statusCounts.map((statusItem: any) => (
                <Link key={statusItem.status} href={`/agency/stores/${storeId}/orders?status=${statusItem.status}`}>
                  <Badge
                    variant={statusFilter === statusItem.status ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {statusItem.status.charAt(0).toUpperCase() + statusItem.status.slice(1)} ({statusItem.count})
                  </Badge>
                </Link>
              ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <form>
              <Input placeholder="Search orders..." className="pl-8" name="q" defaultValue={search} />
              {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            </form>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {search
                    ? `No orders match "${search}"`
                    : statusFilter
                      ? `No ${statusFilter} orders found`
                      : "This store hasn't received any orders yet."}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">#{order.orderNumber}</div>
                        </TableCell>
                        <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {order.customer ? (
                            <div>
                              <div className="font-medium">{order.customer.name}</div>
                              <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Guest</span>
                          )}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/agency/stores/${storeId}/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                      {currentPage > 1 && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/agency/stores/${storeId}/orders?page=${currentPage - 1}${
                              search ? `&q=${search}` : ""
                            }${statusFilter ? `&status=${statusFilter}` : ""}`}
                          >
                            Previous
                          </Link>
                        </Button>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" asChild>
                          <Link
                            href={`/agency/stores/${storeId}/orders?page=${page}${
                              search ? `&q=${search}` : ""
                            }${statusFilter ? `&status=${statusFilter}` : ""}`}
                          >
                            {page}
                          </Link>
                        </Button>
                      ))}
                      {currentPage < totalPages && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/agency/stores/${storeId}/orders?page=${currentPage + 1}${
                              search ? `&q=${search}` : ""
                            }${statusFilter ? `&status=${statusFilter}` : ""}`}
                          >
                            Next
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
