import Link from "next/link"
import { Plus } from "lucide-react"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/agency/products-table"

export const metadata = {
  title: "Products | Agency Dashboard",
  description: "Manage your products",
}

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.agencyId) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Products</h1>
        <p>You need to be part of an agency to view products.</p>
      </div>
    )
  }

  const products = await db.product.findMany({
    where: {
      agencyId: session.user.agencyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/agency/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>
      <ProductsTable products={products} />
    </div>
  )
}
