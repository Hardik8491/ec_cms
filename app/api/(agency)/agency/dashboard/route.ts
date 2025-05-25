// import { type NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/db";
// import { subDays, subYears } from "date-fns";

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     // const session ={
//     //     "user": {
//     //         "name": "Klein Group Solutions",
//     //         "email": "tyree7@hotmail.com",
//     //         "id": "cmb0ilytr00148z480xh6frbj",
//     //         "role": "agency"
//     //     },
//     //     "expires": "2025-06-23T03:35:12.144Z"
//     // }

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     console.log(session);
//     // Check if user has agency access
//     if (
//       session.user.role !== "AGENCY_OWNER" &&
//       session.user.role !== "AGENCY_ADMIN" &&
//       session.user.role !== "admin" &&
//       session.user.role !== "agency" &&
//       session.user.role !== "SUPER_ADMIN"
//     ) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const { searchParams } = new URL(request.url);
//     const range = searchParams.get("range") || "30d";

//     // Calculate date range
//     const now = new Date();
//     let startDate: Date;
//     let previousStartDate: Date;

//     switch (range) {
//       case "7d":
//         startDate = subDays(now, 7);
//         previousStartDate = subDays(now, 14);
//         break;
//       case "30d":
//         startDate = subDays(now, 30);
//         previousStartDate = subDays(now, 60);
//         break;
//       case "90d":
//         startDate = subDays(now, 90);
//         previousStartDate = subDays(now, 180);
//         break;
//       case "1y":
//         startDate = subYears(now, 1);
//         previousStartDate = subYears(now, 2);
//         break;
//       default:
//         startDate = subDays(now, 30);
//         previousStartDate = subDays(now, 60);
//     }

//     // Get agency ID based on user
//     let agencyId: string | null = null;
//     if (
//       session.user.role === "AGENCY_OWNER" ||
//       session.user.role === "AGENCY_ADMIN" ||
//       session.user.role === "agency" ||
//       session.user.role === "admin"
//     ) {
//       const agency = await prisma.agency.findFirst({
//         where: {
//           OR: [{ userId: session.user.id }],
//         },
//       });
//       agencyId = agency?.id || null;
//     }

//     // Build where clause for stores
//     const storeWhereClause = agencyId ? { agencyId } : {};

//     // Get total stores count
//     const totalStores = await prisma.store.count({
//       where: storeWhereClause,
//     });

//     const store = await prisma.store.findMany({
//       where: storeWhereClause,
//     });

//     // Get active stores (stores with orders in the last 30 days)
//     const activeStores = await prisma.store.count({
//       where: {
//         ...storeWhereClause,
//         orders: {
//           some: {
//             createdAt: {
//               gte: subDays(now, 30),
//             },
//           },
//         },
//       },
//     });

//     // Get revenue metrics
//     const currentRevenue = await prisma.order.aggregate({
//       where: {
//         store: storeWhereClause,
//         status: "COMPLETED",
//         createdAt: {
//           gte: startDate,
//           lte: now,
//         },
//       },
//       _sum: {
//         total: true,
//       },
//     });

//     const previousRevenue = await prisma.order.aggregate({
//       where: {
//         store: storeWhereClause,
//         status: "COMPLETED",
//         createdAt: {
//           gte: previousStartDate,
//           lt: startDate,
//         },
//       },
//       _sum: {
//         total: true,
//       },
//     });

//     // Calculate revenue growth
//     const currentRevenueAmount = currentRevenue._sum.total || 0;
//     const previousRevenueAmount = previousRevenue._sum.total || 0;
//     const revenueGrowth =
//       previousRevenueAmount > 0
//         ? ((currentRevenueAmount - previousRevenueAmount) /
//             previousRevenueAmount) *
//           100
//         : 0;

//     // Get orders metrics
//     const currentOrders = await prisma.order.count({
//       where: {
//         store: storeWhereClause,
//         createdAt: {
//           gte: startDate,
//           lte: now,
//         },
//       },
//     });

//     const previousOrders = await prisma.order.count({
//       where: {
//         store: storeWhereClause,
//         createdAt: {
//           gte: previousStartDate,
//           lt: startDate,
//         },
//       },
//     });

//     const ordersGrowth =
//       previousOrders > 0
//         ? ((currentOrders - previousOrders) / previousOrders) * 100
//         : 0;

//     // Get customers metrics
//     const currentCustomers = await prisma.customer.count({
//       where: {
//         store: storeWhereClause,
//         createdAt: {
//           gte: startDate,
//           lte: now,
//         },
//       },
//     });

//     const previousCustomers = await prisma.customer.count({
//       where: {
//         store: storeWhereClause,
//         createdAt: {
//           gte: previousStartDate,
//           lt: startDate,
//         },
//       },
//     });

//     const customersGrowth =
//       previousCustomers > 0
//         ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
//         : 0;

//     // Get products metrics
//     const totalProducts = await prisma.product.count({
//       where: {
//         store: storeWhereClause,
//       },
//     });

//     const activeProducts = await prisma?.product.count({
//       where: {
//         store: storeWhereClause,
//         // status: "ACTIVE",
//       },
//     });

//     // Get average order value
//     const avgOrderValue =
//       currentOrders > 0 ? currentRevenueAmount / currentOrders : 0;

//     const params: any[] = [startDate, now];

//     let query = `
//       SELECT
//         DATE(o.created_at) AS date,
//         SUM(o.total) AS revenue,
//         COUNT(*) AS orders
//       FROM orders o
//       INNER JOIN stores s ON o.store_id = s.id
//       WHERE o.status = 'COMPLETED'
//         AND o.created_at >= $1
//         AND o.created_at <= $2
//     `;

//     if (agencyId) {
//       query += ` AND s.agency_id = $3`;
//       params.push(agencyId);
//     }

//     query += `
//       GROUP BY DATE(o.created_at)
//       ORDER BY date ASC
//     `;

//     // const dailyRevenue = await prisma.$queryRawUnsafe<Array<{
//     //   date: Date;
//     //   revenue: number;
//     //   orders: number;
//     // }>>(query, ...params);

//     // TODO: Fix the query to get daily revenue with relations order and store

//     // Get top performing stores
//     const topStores = await prisma.store.findMany({
//       where: storeWhereClause,
//       include: {
//         orders: {
//           where: {
//             status: "COMPLETED",
//             createdAt: {
//               gte: startDate,
//               lte: now,
//             },
//           },
//         },
//         _count: {
//           select: {
//             products: true,
//             customers: true,
//           },
//         },
//       },
//       take: 5,
//     });

//     const topStoresWithMetrics = topStores
//       .map((store) => {
//         const revenue = store.orders.reduce(
//           (sum, order) => sum + order.total,
//           0
//         );
//         const orders = store.orders.length;
//         return {
//           id: store.id,
//           name: store.name,
//           //   domain: store.domain,
//           revenue,
//           orders,
//           products: store._count.products,
//           customers: store._count.customers,
//         };
//       })
//       .sort((a, b) => b.revenue - a.revenue);

//     // Get recent activities
//     const recentActivities = await prisma.order.findMany({
//       where: {
//         store: storeWhereClause,
//         createdAt: {
//           gte: subDays(now, 7),
//         },
//       },
//       include: {
//         store: {
//           select: {
//             name: true,
//             // domain: true,
//           },
//         },
//         customer: {
//           select: {
//             firstName: true,
//             lastName: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: 10,
//     });

//     // Get conversion metrics
//     const totalVisitors = await prisma.analytics.aggregate({
//       where: {
//         store: storeWhereClause,
//         createdAt: {
//           gte: startDate,
//           lte: now,
//         },
//       },
//       _sum: {
//         visitors: true,
//       },
//     });

//     const conversionRate =
//       totalVisitors._sum.visitors && totalVisitors._sum.visitors > 0
//         ? (currentOrders / totalVisitors._sum.visitors) * 100
//         : 0;

//     // Get category performance
//     // const categoryPerformance = (await prisma.$queryRaw`
//     //   SELECT
//     //     c.name as category,
//     //     SUM(oi.quantity * oi.price) as revenue,
//     //     SUM(oi.quantity) as units_sold
//     //   FROM order_items oi
//     //   INNER JOIN products p ON oi.product_id = p.id
//     //   INNER JOIN categories c ON p.category_id = c.id
//     //   INNER JOIN orders o ON oi.order_id = o.id
//     //   INNER JOIN stores s ON o.store_id = s.id
//     //   WHERE o.status = 'COMPLETED'
//     //     AND o.created_at >= ${startDate}
//     //     AND o.created_at <= ${now}
//     //     ${agencyId ? `AND s.agency_id = '${agencyId}'` : ""}
//     //   GROUP BY c.id, c.name
//     //   ORDER BY revenue DESC
//     //   LIMIT 10
//     // `) as Array<{ category: string; revenue: number; units_sold: number }>

//     // Get payment methods breakdown
//     const paymentMethods = await prisma.order.groupBy({
//       by: ["paymentMethod"],
//       where: {
//         store: storeWhereClause,
//         status: "COMPLETED",
//         createdAt: {
//           gte: startDate,
//           lte: now,
//         },
//       },
//       _sum: {
//         total: true,
//       },
//       _count: true,
//     });

//     // Get order status breakdown
//     const orderStatuses = await prisma.order.groupBy({
//       by: ["status"],
//       where: {
//         store: storeWhereClause,
//         createdAt: {
//           gte: startDate,
//           lte: now,
//         },
//       },
//       _count: true,
//     });

//     const totalRevenue = currentRevenueAmount + previousRevenueAmount;
//     const totalOrders = currentOrders + previousOrders;
//     const totalCustomers=currentCustomers + previousCustomers;
//     return NextResponse.json({
//       success: true,
//       data: {
//         overview: {
//           totalStores,
//           totalRevenue,
//           totalOrders,
//           activeStores,
//           totalProducts,
//           activeProducts,
//           totalCustomers,
//           revenue: {
//             current: currentRevenueAmount,
//             previous: previousRevenueAmount,
//             growth: revenueGrowth,
//           },
//           orders: {
//             current: currentOrders,
//             previous: previousOrders,
//             growth: ordersGrowth,
//           },
//           customers: {
//             current: currentCustomers,
//             previous: previousCustomers,
//             growth: customersGrowth,
//           },
//           avgOrderValue,
//           conversionRate,
//         },
//         charts: {
//           // dailyRevenue: 0 | dailyRevenue.map((item) => ({
//           //   date: item.date.toISOString().split("T")[0],
//           //   revenue: Number(item.revenue),
//           //   orders: Number(item.orders),
//           // })),
//           // categoryPerformance: categoryPerformance.map((item) => ({
//           //   category: item.category,
//           //   revenue: Number(item.revenue),
//           //   unitsSold: Number(item.units_sold),
//           // })),
//           paymentMethods: paymentMethods.map((item) => ({
//             method: item.paymentMethod,
//             revenue: Number(item._sum.total || 0),
//             count: item._count,
//           })),
//           orderStatuses: orderStatuses.map((item) => ({
//             status: item.status,
//             count: item._count,
//           })),
//         },
//         topStores: topStoresWithMetrics,
//         recentActivities: recentActivities.map((activity) => ({
//           id: activity.id,
//           type: "order",
//           title: `New order #${activity.orderNumber}`,
//           description: `${activity.customer?.firstName} ${activity.customer?.lastName} placed an order`,
//           amount: activity.total,
//           store: activity.store.name,
//           timestamp: activity.createdAt,
//           status: activity.status,
//         })),
//         stores: store,
//         timeRange: range,
//         generatedAt: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Agency dashboard API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { subDays, subYears } from "date-fns";
import { redis } from "@/lib/redis";

// Helper function to generate cache key
const getCacheKey = (userId: string, range: string) => `agency-dashboard:${userId}:${range}`;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has agency access
    const allowedRoles = [
      "AGENCY_OWNER",
      "AGENCY_ADMIN",
      "admin",
      "agency",
      "SUPER_ADMIN",
    ];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

      // Check cache first
      const cacheKey = getCacheKey(session.user.id, range);
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
          cached: true
        });
      }
  

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (range) {
      case "7d":
        startDate = subDays(now, 7);
        previousStartDate = subDays(now, 14);
        break;
      case "30d":
        startDate = subDays(now, 30);
        previousStartDate = subDays(now, 60);
        break;
      case "90d":
        startDate = subDays(now, 90);
        previousStartDate = subDays(now, 180);
        break;
      case "1y":
        startDate = subYears(now, 1);
        previousStartDate = subYears(now, 2);
        break;
      default:
        startDate = subDays(now, 30);
        previousStartDate = subDays(now, 60);
    }

    // Get agency ID
    let agencyId: string | null = null;
    if (
      ["AGENCY_OWNER", "AGENCY_ADMIN", "agency", "admin"].includes(
        session.user.role
      )
    ) {
      const agency = await prisma.agency.findFirst({
        where: { userId: session.user.id },
      });
      agencyId = agency?.id || null;
    }

    // Build where clause
    const storeWhereClause = agencyId ? { agencyId } : {};

    // Execute parallel queries
    const [
      totalStores,
      stores,
      activeStores,
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      totalProducts,
      activeProducts,
      topStores,
      recentActivities,
      totalVisitors,
      paymentMethods,
      orderStatuses,
    ] = await Promise.all([
      prisma.store.count({ where: storeWhereClause }),
      prisma.store.findMany({ where: storeWhereClause }),
      prisma.store.count({
        where: {
          ...storeWhereClause,
          orders: { some: { createdAt: { gte: subDays(now, 30) } } },
        },
      }),
      prisma.order.aggregate({
        where: {
          store: storeWhereClause,
          status: "COMPLETED",
          createdAt: { gte: startDate, lte: now },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          store: storeWhereClause,
          status: "COMPLETED",
          createdAt: { gte: previousStartDate, lt: startDate },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          store: storeWhereClause,
          createdAt: { gte: startDate, lte: now },
        },
      }),
      prisma.order.count({
        where: {
          store: storeWhereClause,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      prisma.customer.count({
        where: {
          store: storeWhereClause,
          createdAt: { gte: startDate, lte: now },
        },
      }),
      prisma.customer.count({
        where: {
          store: storeWhereClause,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      prisma.product.count({
        where: {
          store: storeWhereClause,
        },
      }),
      prisma.product.count({ where: { store: storeWhereClause } }),
      prisma.store.findMany({
        where: storeWhereClause,
        include: {
          orders: {
            where: {
              status: "COMPLETED",
              createdAt: { gte: startDate, lte: now },
            },
          },
          _count: { select: { products: true, customers: true } },
        },
        take: 5,
      }),
      prisma.order.findMany({
        where: {
          store: storeWhereClause,
          createdAt: { gte: subDays(now, 7) },
        },
        include: {
          store: { select: { name: true } },
          customer: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.analytics.aggregate({
        where: {
          store: storeWhereClause,
          createdAt: { gte: startDate, lte: now },
        },
        _sum: { visitors: true },
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: {
          store: storeWhereClause,
          status: "COMPLETED",
          createdAt: { gte: startDate, lte: now },
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: {
          store: storeWhereClause,
          createdAt: { gte: startDate, lte: now },
        },
        _count: true,
      }),
    ]);

    // Calculate metrics
    const currentRevenueAmount = currentRevenue._sum.total || 0;
    const previousRevenueAmount = previousRevenue._sum.total || 0;
    const revenueGrowth =
      previousRevenueAmount > 0
        ? ((currentRevenueAmount - previousRevenueAmount) /
            previousRevenueAmount) *
          100
        : 0;

    const ordersGrowth =
      previousOrders > 0
        ? ((currentOrders - previousOrders) / previousOrders) * 100
        : 0;

    const customersGrowth =
      previousCustomers > 0
        ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
        : 0;

    const avgOrderValue =
      currentOrders > 0 ? currentRevenueAmount / currentOrders : 0;
    const conversionRate =
      totalVisitors._sum.visitors && totalVisitors._sum.visitors > 0
        ? (currentOrders / totalVisitors._sum.visitors) * 100
        : 0;

        const responseData={
          
            overview: {
              totalStores,
              totalRevenue: currentRevenueAmount + previousRevenueAmount,
              totalOrders: currentOrders + previousOrders,
              activeStores,
              totalProducts,
              activeProducts,
              totalCustomers: currentCustomers + previousCustomers,
              revenue: {
                current: currentRevenueAmount,
                previous: previousRevenueAmount,
                growth: revenueGrowth,
              },
              orders: {
                current: currentOrders,
                previous: previousOrders,
                growth: ordersGrowth,
              },
              customers: {
                current: currentCustomers,
                previous: previousCustomers,
                growth: customersGrowth,
              },
              avgOrderValue,
              conversionRate,
            },
            charts: {
              paymentMethods: paymentMethods.map((item) => ({
                method: item.paymentMethod,
                revenue: Number(item._sum.total || 0),
                count: item._count,
              })),
              orderStatuses: orderStatuses.map((item) => ({
                status: item.status,
                count: item._count,
              })),
            },
            topStores: topStores
              .map((store) => ({
                id: store.id,
                name: store.name,
                revenue: store.orders.reduce((sum, order) => sum + order.total, 0),
                orders: store.orders.length,
                products: store._count.products,
                customers: store._count.customers,
              }))
              .sort((a, b) => b.revenue - a.revenue),
            recentActivities: recentActivities.map((activity) => ({
              id: activity.id,
              type: "order",
              title: `New order #${activity.orderNumber}`,
              description: `${activity.customer?.firstName} ${activity.customer?.lastName} placed an order`,
              amount: activity.total,
              store: activity.store.name,
              timestamp: activity.createdAt,
              status: activity.status,
            })),
            stores,
            timeRange: range,
            generatedAt: new Date().toISOString(),
          
        }
        await redis.setex(cacheKey, 300, responseData);
    // Format response
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Agency dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
