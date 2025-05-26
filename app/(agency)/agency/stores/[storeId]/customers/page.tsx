import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Plus, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { notFound } from "next/navigation"
import { format } from "date-fns"

const prisma = new PrismaClient()

interface CustomersPageProps {
  params: {
    storeId: string
  }
  searchParams: {
    q?: string
    page?: string
  }
}

export default async function CustomersPage({ params, searchParams }: CustomersPageProps) {
  const { storeId } = params
  const session = await getServerSession(authOptions)
  const search = searchParams.q || ""
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

  // Build where clause for search
  const where = {
    storeId,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  }

  // Fetch customers with pagination
  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
  })

  // Get total count for pagination
  const totalCustomers = await prisma.customer.count({ where })
  const totalPages = Math.ceil(totalCustomers / pageSize)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customers</h1>
          <Button asChild>
            <Link href={`/agency/stores/${storeId}/customers/create`}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>All Customers</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <form>
                  <Input placeholder="Search customers..." className="pl-8" name="q" defaultValue={search} />
                </form>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No customers found</h3>
                <p className="text-muted-foreground mb-6">
                  {search ? `No customers match "${search}"` : "This store doesn't have any customers yet."}
                </p>
                <Button asChild>
                  <Link href={`/agency/stores/${storeId}/customers/create`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.name || "No Name"}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                            {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.city && customer.country ? (
                            <div>
                              <p>{customer.city}</p>
                              <p className="text-sm text-muted-foreground">{customer.country}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{customer._count.orders}</div>
                        </TableCell>
                        <TableCell>{format(new Date(customer.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/agency/stores/${storeId}/customers/${customer.id}`}>
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
                            href={`/agency/stores/${storeId}/customers?page=${currentPage - 1}${
                              search ? `&q=${search}` : ""
                            }`}
                          >
                            Previous
                          </Link>
                        </Button>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" asChild>
                          <Link
                            href={`/agency/stores/${storeId}/customers?page=${page}${search ? `&q=${search}` : ""}`}
                          >
                            {page}
                          </Link>
                        </Button>
                      ))}
                      {currentPage < totalPages && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/agency/stores/${storeId}/customers?page=${currentPage + 1}${
                              search ? `&q=${search}` : ""
                            }`}
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
