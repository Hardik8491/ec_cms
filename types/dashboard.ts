// export interface DashboardData {
//   overview: {
//     totalStores: number;
//     totalRevenue: number;
//     totalOrders: number;
//     totalCustomers: number;
//     revenueGrowth: number;
//     ordersGrowth: number;
//     // Add other overview fields as needed
//   };
//   stores: Array<{
//     id: string;
//     name: string;
//     revenue: number;
//     orders: number;
//     status: string;
//     lastActivity: string;
//   }>;
//   recentActivity: Array<{
//     id: string;
//     type: string;
//     message: string;
//     timestamp: string;
//     storeId: string;
//     storeName: string;
//   }>;
//   revenueChart: Array<{
//     date: string;
//     revenue: number;
//     orders: number;
//   }>;
//   // Add other sections as needed
// }

export interface DashboardData {
  overview: {
    totalStores: number
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    revenueGrowth: number
    ordersGrowth: number
  }
  stores: Array<{
    id: string
    name: string
    revenue: number
    orders: number
    status: string
    lastActivity: string
  }>
  recentActivity: Array<{
    id: string
    type: string
    message: string
    timestamp: string
    storeId: string
    storeName: string
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    orders: number
  }>
}