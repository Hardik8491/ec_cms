import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building, LayoutDashboard, ShoppingCart } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                EC_CMS: Multi-Tenant eCommerce Platform
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                A powerful CMS for agencies to create and manage their own eCommerce stores under unique subdomains.
              </p>
            </div>
            <div className="space-x-4">
              {session ? (
                <Button asChild size="lg">
                  <Link href={getDashboardLink(session)}>
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/login">
                      Login <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Admin Dashboard</h3>
                <p className="text-muted-foreground">
                  Super admin can manage all agencies, assign subdomains, and view global insights.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Agency Stores</h3>
                <p className="text-muted-foreground">
                  Agencies can create and manage their own stores with products, categories, and customers.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Customer Experience</h3>
                <p className="text-muted-foreground">
                  Customers can browse, order, and track products within their preferred agency store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to get started?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join our platform today and start managing your eCommerce business with ease.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/register">Register Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-background border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold">EC_CMS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} EC_CMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function getDashboardLink(session: any) {
  const role = session?.user?.role || "user"

  switch (role) {
    case "admin":
      return "/admin"
    case "agency":
      return "/agency"
    default:
      return "/user"
  }
}
