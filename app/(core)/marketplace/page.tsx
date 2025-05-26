import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store, ShoppingBag, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const prisma = new PrismaClient()

interface MarketplacePageProps {
  searchParams: {
    q?: string
  }
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const session = await getServerSession(authOptions)
  const search = searchParams.q || ""

  // Build where clause for search
  const where: any = {
    isMarketplace: true,
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  // Fetch marketplace stores
  const stores = await prisma.store.findMany({
    where,
    include: {
      vendor: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: {
      store: {
        isMarketplace: true,
      },
      isFeatured: true,
    },
    take: 8,
    include: {
      store: true,
      vendor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Discover stores and products from our vendors</p>
        </div>
        <div className="w-full md:w-auto">
          <form className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stores and products..."
              className="pl-8 w-full md:w-[300px]"
              name="q"
              defaultValue={search}
            />
          </form>
        </div>
      </div>

      {featuredProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button variant="outline" asChild>
              <Link href="/marketplace/products">View All Products</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">{product.vendor?.name || product.store.name}</div>
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="font-bold mt-1">${product.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/marketplace/products/${product.id}`}>View Product</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Stores</h2>
          {session?.user.role === "vendor" && (
            <Button asChild>
              <Link href="/vendor/dashboard">Vendor Dashboard</Link>
            </Button>
          )}
        </div>

        {stores.length === 0 ? (
          <Card className="text-center p-10">
            <CardContent className="pt-10 pb-10">
              <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No stores found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? `No stores match "${search}"` : "There are no marketplace stores yet."}
              </p>
              {session?.user.role === "vendor" ? (
                <Button asChild>
                  <Link href="/vendor/dashboard">Create Your Store</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth/signup">Become a Vendor</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card key={store.id}>
                <div className="h-32 bg-gray-100 dark:bg-gray-800 relative">
                  {store.bannerImage ? (
                    <img
                      src={store.bannerImage || "/placeholder.svg"}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {store.logo && (
                    <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-full bg-white dark:bg-gray-950 p-1">
                      <img
                        src={store.logo || "/placeholder.svg"}
                        alt={store.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}
                </div>
                <CardHeader className={store.logo ? "pt-8" : ""}>
                  <CardTitle>{store.name}</CardTitle>
                  <CardDescription>{store.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Products</p>
                      <p className="text-2xl font-bold">{store._count.products}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Vendor</p>
                      <p className="font-medium">{store.vendor?.name || "Unknown"}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/marketplace/stores/${store.id}`}>View Store</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/marketplace/stores/${store.id}/products`}>Browse Products</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
