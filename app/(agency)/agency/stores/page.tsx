import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Store } from "lucide-react"

const prisma = new PrismaClient()

export default async function AgencyStoresPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "agency") {
    redirect("/dashboard")
  }

  // Fetch agency
  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
    include: {
      stores: {
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      },
    },
  })

  console.log(agency)
  if (!agency) {
    redirect("/agency")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Stores</h1>
          <Button asChild>
            <Link href="/agency/stores/create">
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
                <Link href="/agency/stores/create">
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
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Products</p>
                      <p className="text-2xl font-bold">{store._count.products}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="text-2xl font-bold">{store._count.orders}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/agency/stores/${store.id}`}>Manage</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/agency/stores/${store.id}/edit`}>Edit</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
