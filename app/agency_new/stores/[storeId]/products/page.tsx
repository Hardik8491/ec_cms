import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Package, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

interface ProductsPageProps {
  params: {
    storeId: string
  }
  searchParams: {
    q?: string
    page?: string
  }
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
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
            { description: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  // Fetch products with pagination
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  })

  // Get total count for pagination
  const totalProducts = await prisma.product.count({ where })
  const totalPages = Math.ceil(totalProducts / pageSize)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <Button asChild>
            <Link href={`/agency/stores/${storeId}/products/create`}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>All Products</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <form>
                  <Input placeholder="Search products..." className="pl-8" name="q" defaultValue={search} />
                </form>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  {search ? `No products match "${search}"` : "You haven't added any products to this store yet."}
                </p>
                <Button asChild>
                  <Link href={`/agency/stores/${storeId}/products/create`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
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
                              <p className="text-xs text-muted-foreground">{product.sku || "No SKU"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${product.price.toFixed(2)}
                          {product.comparePrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              ${product.comparePrice.toFixed(2)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.quantity > 10
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : product.quantity > 0
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {product.quantity > 0 ? product.quantity : "Out of stock"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/agency/stores/${storeId}/products/${product.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/agency/stores/${storeId}/products/${product.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
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
                            href={`/agency/stores/${storeId}/products?page=${currentPage - 1}${
                              search ? `&q=${search}` : ""
                            }`}
                          >
                            Previous
                          </Link>
                        </Button>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" asChild>
                          <Link href={`/agency/stores/${storeId}/products?page=${page}${search ? `&q=${search}` : ""}`}>
                            {page}
                          </Link>
                        </Button>
                      ))}
                      {currentPage < totalPages && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/agency/stores/${storeId}/products?page=${currentPage + 1}${
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
