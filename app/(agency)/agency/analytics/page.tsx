"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, DollarSign, ShoppingCart, Users, Bot, Download } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
} from "recharts"

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    totalStores: number
    revenueGrowth: number
    ordersGrowth: number
    customersGrowth: number
    avgOrderValue: number
    conversionRate: number
  }
  charts: {
    revenueChart: Array<{ date: string; revenue: number; orders: number }>
    storePerformance: Array<{ store: string; revenue: number; orders: number; customers: number }>
    categoryBreakdown: Array<{ category: string; revenue: number; percentage: number }>
    customerSegments: Array<{ segment: string; count: number; value: number }>
    aiInsights: Array<{ metric: string; current: number; predicted: number; confidence: number }>
  }
  topStores: Array<{
    id: string
    name: string
    revenue: number
    orders: number
    growth: number
    status: string
  }>
  aiRecommendations: Array<{
    type: string
    title: string
    description: string
    impact: string
    confidence: number
  }>
}

export default function AgencyAnalytics() {
  const { data: session } = useSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/agency/dashboard/analytics?range=${timeRange}&metric=${selectedMetric}`)
      const result = await response.json()

      // Mock comprehensive analytics data
      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 485000,
          totalOrders: 2847,
          totalCustomers: 1923,
          totalStores: 12,
          revenueGrowth: 23.5,
          ordersGrowth: 18.2,
          customersGrowth: 15.7,
          avgOrderValue: 170.35,
          conversionRate: 3.8,
        },
        charts: {
          revenueChart: [
            { date: "2024-01-01", revenue: 45000, orders: 280 },
            { date: "2024-01-02", revenue: 52000, orders: 320 },
            { date: "2024-01-03", revenue: 48000, orders: 295 },
            { date: "2024-01-04", revenue: 58000, orders: 340 },
            { date: "2024-01-05", revenue: 61000, orders: 358 },
            { date: "2024-01-06", revenue: 55000, orders: 325 },
            { date: "2024-01-07", revenue: 63000, orders: 370 },
          ],
          storePerformance: [
            { store: "TechHub Store", revenue: 125000, orders: 750, customers: 520 },
            { store: "Fashion Forward", revenue: 98000, orders: 580, customers: 420 },
            { store: "Home Essentials", revenue: 87000, orders: 490, customers: 380 },
            { store: "Sports Central", revenue: 76000, orders: 420, customers: 310 },
            { store: "Beauty Boutique", revenue: 65000, orders: 380, customers: 290 },
          ],
          categoryBreakdown: [
            { category: "Electronics", revenue: 180000, percentage: 37 },
            { category: "Fashion", revenue: 145000, percentage: 30 },
            { category: "Home & Garden", revenue: 95000, percentage: 20 },
            { category: "Sports", revenue: 65000, percentage: 13 },
          ],
          customerSegments: [
            { segment: "VIP Customers", count: 245, value: 185000 },
            { segment: "Regular Customers", count: 890, value: 220000 },
            { segment: "New Customers", count: 788, value: 80000 },
          ],
          aiInsights: [
            { metric: "Revenue", current: 485000, predicted: 520000, confidence: 0.87 },
            { metric: "Orders", current: 2847, predicted: 3100, confidence: 0.82 },
            { metric: "Customers", current: 1923, predicted: 2150, confidence: 0.79 },
          ],
        },
        topStores: [
          { id: "1", name: "TechHub Store", revenue: 125000, orders: 750, growth: 28.5, status: "active" },
          { id: "2", name: "Fashion Forward", revenue: 98000, orders: 580, growth: 22.1, status: "active" },
          { id: "3", name: "Home Essentials", revenue: 87000, orders: 490, growth: 18.7, status: "active" },
          { id: "4", name: "Sports Central", revenue: 76000, orders: 420, growth: 15.3, status: "active" },
          { id: "5", name: "Beauty Boutique", revenue: 65000, orders: 380, growth: 12.8, status: "active" },
        ],
        aiRecommendations: [
          {
            type: "Revenue Optimization",
            title: "Expand Electronics Category",
            description: "Electronics shows highest conversion rates. Consider expanding inventory by 25%.",
            impact: "+$45k monthly revenue",
            confidence: 0.89,
          },
          {
            type: "Customer Retention",
            title: "VIP Customer Program",
            description: "Implement tiered loyalty program for high-value customers.",
            impact: "+15% customer retention",
            confidence: 0.84,
          },
          {
            type: "Marketing",
            title: "Seasonal Campaign",
            description: "Launch targeted campaigns for underperforming stores.",
            impact: "+20% store performance",
            confidence: 0.76,
          },
        ],
      }

      setData(mockData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div>Error loading analytics data</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agency Analytics</h1>
          <p className="text-gray-600">Comprehensive insights across all your stores</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${data.overview.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {data.overview.revenueGrowth >= 0 ? "+" : ""}
                {data.overview.revenueGrowth.toFixed(1)}%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${data.overview.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {data.overview.ordersGrowth >= 0 ? "+" : ""}
                {data.overview.ordersGrowth.toFixed(1)}%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${data.overview.customersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {data.overview.customersGrowth >= 0 ? "+" : ""}
                {data.overview.customersGrowth.toFixed(1)}%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Conversion Rate: {data.overview.conversionRate.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Machine learning predictions and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Performance Predictions</h4>
              {data.charts.aiInsights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{insight.metric}</p>
                    <p className="text-sm text-gray-600">
                      Current: {insight.current.toLocaleString()} → Predicted: {insight.predicted.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={insight.confidence > 0.8 ? "default" : "secondary"}>
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">AI Recommendations</h4>
              {data.aiRecommendations.map((rec, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{rec.type}</Badge>
                    <span className="text-sm text-gray-600">{(rec.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <h5 className="font-medium">{rec.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <p className="text-sm font-medium text-green-600">Expected Impact: {rec.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="stores">Store Performance</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="customers">Customer Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend Analysis</CardTitle>
              <CardDescription>Revenue and orders over time with AI predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--color-orders)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Performance Comparison</CardTitle>
              <CardDescription>Revenue, orders, and customer metrics by store</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.storePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="store" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    <Bar dataKey="orders" fill="var(--color-orders)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Revenue Breakdown</CardTitle>
              <CardDescription>Revenue distribution across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {data.charts.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segment Analysis</CardTitle>
              <CardDescription>Customer distribution and value by segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.charts.customerSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{segment.segment}</h4>
                      <p className="text-sm text-gray-600">{segment.count.toLocaleString()} customers</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${segment.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Value</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Stores Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Stores</CardTitle>
          <CardDescription>Your best performing stores this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topStores.map((store, index) => (
              <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{store.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${store.revenue.toLocaleString()} revenue • {store.orders} orders
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={store.growth >= 0 ? "default" : "destructive"}>
                    {store.growth >= 0 ? "+" : ""}
                    {store.growth.toFixed(1)}%
                  </Badge>
                  <Badge variant={store.status === "active" ? "default" : "secondary"}>{store.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
