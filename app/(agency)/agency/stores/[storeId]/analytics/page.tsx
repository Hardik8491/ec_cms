// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
// import { redirect } from "next/navigation"
// import { DashboardLayout } from "@/components/layouts/dashboard-layout"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { PrismaClient } from "@prisma/client"
// import { notFound } from "next/navigation"
// import { BarChart3, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

// const prisma = new PrismaClient()

// interface AnalyticsPageProps {
//   params: {
//     storeId: string
//   }
//   searchParams: {
//     period?: string
//   }
// }

// export default async function AnalyticsPage({ params, searchParams }: AnalyticsPageProps) {
//   const { storeId } = params
//   const period = searchParams.period || "week"
//   const session = await getServerSession(authOptions)

//   if (!session || session.user.role !== "agency") {
//     redirect("/dashboard")
//   }

//   // Fetch agency
//   const agency = await prisma.agency.findUnique({
//     where: { userId: session.user.id },
//   })

//   if (!agency) {
//     redirect("/agency")
//   }

//   // Fetch store
//   const store = await prisma.store.findUnique({
//     where: {
//       id: storeId,
//       agencyId: agency.id,
//     },
//   })

//   if (!store) {
//     notFound()
//   }

//   // Calculate date range based on period
//   const now = new Date()
//   let startDate: Date
//   let endDate = now
//   let dateFormat = "MMM d"

//   switch (period) {
//     case "week":
//       startDate = subDays(now, 7)
//       break
//     case "month":
//       startDate = startOfMonth(now)
//       endDate = endOfMonth(now)
//       break
//     case "year":
//       startDate = startOfYear(now)
//       endDate = endOfYear(now)
//       dateFormat = "MMM"
//       break
//     default:
//       startDate = subDays(now, 7)
//   }

//   // Fetch analytics data
//   const analyticsData = await prisma.analytics.findMany({
//     where: {
//       storeId,
//       date: {
//         gte: startDate,
//         lte: endDate,
//       },
//     },
//     orderBy: {
//       date: "asc",
//     },
//   })

//   // Calculate summary
//   const totalRevenue = analyticsData.reduce((sum, item) => sum + item.revenue, 0)
//   const totalOrders = analyticsData.reduce((sum, item) => sum + item.orders, 0)
//   const totalCustomers = analyticsData.reduce((sum, item) => sum + item.customers, 0)
//   const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

//   // Get top products
//   const topProducts = await prisma.orderItem.groupBy({
//     by: ["productId"],
//     where: {
//       order: {
//         storeId,
//         createdAt: {
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//     },
//     _sum: {
//       quantity: true,
//       total: true,
//     },
//     orderBy: {
//       _sum: {
//         total: "desc",
//       },
//     },
//     take: 5,
//   })

//   // Get product details
//   const productIds = topProducts.map((item) => item.productId)
//   const products = await prisma.product.findMany({
//     where: {
//       id: {
//         in: productIds,
//       },
//     },
//   })

//   // Combine product data
//   const topProductsWithDetails = topProducts.map((item) => {
//     const product = products.find((p) => p.id === item.productId)
//     return {
//       id: item.productId,
//       name: product?.name || "Unknown Product",
//       quantity: item._sum.quantity || 0,
//       revenue: item._sum.total || 0,
//     }
//   })

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-3xl font-bold">Analytics</h1>
//           <Tabs defaultValue={period} className="w-[400px]">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="week" asChild>
//                 <a href={`/agency/stores/${storeId}/analytics?period=week`}>Week</a>
//               </TabsTrigger>
//               <TabsTrigger value="month" asChild>
//                 <a href={`/agency/stores/${storeId}/analytics?period=month`}>Month</a>
//               </TabsTrigger>
//               <TabsTrigger value="year" asChild>
//                 <a href={`/agency/stores/${storeId}/analytics?period=year`}>Year</a>
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//               <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//               <DollarSign className="w-4 h-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
//               <p className="text-xs text-muted-foreground">
//                 For {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//               <CardTitle className="text-sm font-medium">Orders</CardTitle>
//               <ShoppingCart className="w-4 h-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{totalOrders}</div>
//               <p className="text-xs text-muted-foreground">Avg. value: ${averageOrderValue.toFixed(2)}</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//               <CardTitle className="text-sm font-medium">Customers</CardTitle>
//               <Users className="w-4 h-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{totalCustomers}</div>
//               <p className="text-xs text-muted-foreground">New customers in this period</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//               <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
//               <BarChart3 className="w-4 h-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {analyticsData.length > 0
//                   ? (
//                       (analyticsData.reduce((sum, item) => sum + item.conversion, 0) / analyticsData.length) *
//                       100
//                     ).toFixed(2)
//                   : "0.00"}
//                 %
//               </div>
//               <p className="text-xs text-muted-foreground">Average for this period</p>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Revenue Over Time</CardTitle>
//               <CardDescription>
//                 Daily revenue for {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="h-80">
//               {analyticsData.length === 0 ? (
//                 <div className="flex items-center justify-center h-full">
//                   <p className="text-muted-foreground">No data available for this period</p>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-full">
//                   <BarChart3 className="h-16 w-16 text-muted-foreground" />
//                   <p className="text-muted-foreground ml-4">Chart visualization will appear here</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Top Products</CardTitle>
//               <CardDescription>Best selling products by revenue</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {topProductsWithDetails.length === 0 ? (
//                 <div className="flex items-center justify-center h-64 text-center">
//                   <Package className="h-12 w-12 text-muted-foreground mb-4" />
//                   <p className="text-muted-foreground">No sales data available for this period</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {topProductsWithDetails.map((product) => (
//                     <div key={product.id} className="flex items-center justify-between">
//                       <div className="flex items-center space-x-3">
//                         <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
//                           <Package className="h-5 w-5 text-muted-foreground" />
//                         </div>
//                         <div>
//                           <p className="font-medium">{product.name}</p>
//                           <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-medium">${product.revenue.toFixed(2)}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {((product.revenue / totalRevenue) * 100).toFixed(1)}% of revenue
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </DashboardLayout>
//   )
// }

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { BarChart3, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

const prisma = new PrismaClient()

interface AnalyticsPageProps {
  params: {
    storeId: string
  }
  searchParams: {
    period?: string
  }
}

export default async function AnalyticsPage({ params, searchParams }: AnalyticsPageProps) {
  const { storeId } = params
  const period = searchParams.period || "week"
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

  // Calculate date range based on period
  const now = new Date()
  let startDate: Date
  let endDate = now
  let dateFormat = "MMM d"

  switch (period) {
    case "week":
      startDate = subDays(now, 7)
      break
    case "month":
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break
    case "year":
      startDate = startOfYear(now)
      endDate = endOfYear(now)
      dateFormat = "MMM"
      break
    default:
      startDate = subDays(now, 7)
  }

  // Fetch analytics data
  const analyticsData = await prisma.analytics.findMany({
    where: {
      storeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  })

  // Calculate summary
  const totalRevenue = analyticsData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = analyticsData.reduce((sum, item) => sum + item.orders, 0)
  const totalCustomers = analyticsData.reduce((sum, item) => sum + item.customers, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Get top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    _sum: {
      quantity: true,
      total: true,
    },
    orderBy: {
      _sum: {
        total: "desc",
      },
    },
    take: 5,
  })

  // Get product details
  const productIds = topProducts.map((item) => item.productId)
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  })

  // Combine product data
  const topProductsWithDetails = topProducts.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    return {
      id: item.productId,
      name: product?.name || "Unknown Product",
      quantity: item._sum.quantity || 0,
      revenue: item._sum.total || 0,
    }
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <Tabs defaultValue={period} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week" asChild>
                <a href={`/agency/stores/${storeId}/analytics?period=week`}>Week</a>
              </TabsTrigger>
              <TabsTrigger value="month" asChild>
                <a href={`/agency/stores/${storeId}/analytics?period=month`}>Month</a>
              </TabsTrigger>
              <TabsTrigger value="year" asChild>
                <a href={`/agency/stores/${storeId}/analytics?period=year`}>Year</a>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                For {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Avg. value: ${averageOrderValue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">New customers in this period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.length > 0
                  ? (
                      (analyticsData.reduce((sum, item) => sum + item.conversion, 0) / analyticsData.length) *
                      100
                    ).toFixed(2)
                  : "0.00"}
                %
              </div>
              <p className="text-xs text-muted-foreground">Average for this period</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Daily revenue for {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available for this period</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground ml-4">Chart visualization will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {topProductsWithDetails.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sales data available for this period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProductsWithDetails.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((product.revenue / totalRevenue) * 100).toFixed(1)}% of revenue
                        </p>
                      </div>
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
