"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Brain, TrendingUp, Target, Lightbulb, AlertTriangle, CheckCircle, Zap, MessageSquare } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"

interface AIInsight {
  id: string
  type: "opportunity" | "warning" | "recommendation" | "prediction"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  confidence: number
  actionable: boolean
  category: string
  data?: any
  timestamp: string
}

interface AIAnalyticsData {
  overview: {
    totalInsights: number
    highImpactInsights: number
    automatedActions: number
    aiAccuracy: number
  }
  insights: AIInsight[]
  predictions: {
    revenue: Array<{ date: string; actual: number; predicted: number; confidence: number }>
    customerChurn: Array<{ segment: string; current: number; predicted: number; risk: string }>
    productDemand: Array<{ product: string; currentSales: number; predictedSales: number; trend: string }>
  }
  recommendations: Array<{
    id: string
    type: string
    title: string
    description: string
    expectedImpact: string
    effort: string
    priority: number
  }>
  aiUsage: {
    totalQueries: number
    successRate: number
    avgResponseTime: number
    topFeatures: Array<{ feature: string; usage: number }>
  }
}

export default function AIAnalytics() {
  const [data, setData] = useState<AIAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState("")
  const [queryLoading, setQueryLoading] = useState(false)

  useEffect(() => {
    fetchAIAnalytics()
  }, [])

  const fetchAIAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics/ai")
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error("Error fetching AI analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIQuery = async () => {
    if (!query.trim()) return

    setQueryLoading(true)
    try {
      const response = await fetch("/api/ai/analytics/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const result = await response.json()
      setQueryResult(result.response)
    } catch (error) {
      console.error("Error querying AI:", error)
    } finally {
      setQueryLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4 text-blue-600" />
      case "prediction":
        return <Brain className="h-4 w-4 text-purple-600" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
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

  if (!data) return <div>Error loading AI analytics data</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Analytics Dashboard
          </h1>
          <p className="text-gray-600">AI-powered insights and predictions for your business</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Bot className="w-4 h-4 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalInsights}</div>
            <p className="text-xs text-muted-foreground">{data.overview.highImpactInsights} high impact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automated Actions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.automatedActions}</div>
            <p className="text-xs text-muted-foreground">Actions taken by AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.overview.aiAccuracy * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Prediction accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.aiUsage.successRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Query success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask AI About Your Data
          </CardTitle>
          <CardDescription>Ask questions about your business data and get AI-powered insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="aiQuery">Your Question</Label>
              <Input
                id="aiQuery"
                placeholder="e.g., What are my top performing products this month?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAIQuery()}
              />
            </div>
            <Button onClick={handleAIQuery} disabled={queryLoading} className="mt-6">
              {queryLoading ? "Analyzing..." : "Ask AI"}
            </Button>
          </div>
          {queryResult && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">AI Response:</h4>
              <p className="text-blue-800">{queryResult}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="usage">AI Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      {insight.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="secondary">{(insight.confidence * 100).toFixed(0)}% confidence</Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>{insight.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  {insight.actionable && (
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Predictions</CardTitle>
                <CardDescription>AI-predicted revenue vs actual performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    actual: { label: "Actual", color: "hsl(var(--chart-1))" },
                    predicted: { label: "Predicted", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.predictions.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--color-predicted)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Customer Churn Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Churn Risk</CardTitle>
                <CardDescription>AI-predicted churn risk by customer segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.predictions.customerChurn.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{segment.segment}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {segment.current}% → Predicted: {segment.predicted}%
                        </p>
                      </div>
                      <Badge
                        variant={
                          segment.risk === "high" ? "destructive" : segment.risk === "medium" ? "secondary" : "default"
                        }
                      >
                        {segment.risk} risk
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Demand Predictions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Demand Forecast</CardTitle>
                <CardDescription>AI predictions for product sales trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    currentSales: { label: "Current Sales", color: "hsl(var(--chart-1))" },
                    predictedSales: { label: "Predicted Sales", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.predictions.productDemand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="currentSales" fill="var(--color-currentSales)" />
                      <Bar dataKey="predictedSales" fill="var(--color-predictedSales)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {rec.title}
                    <Badge variant="outline">Priority {rec.priority}</Badge>
                  </CardTitle>
                  <CardDescription>{rec.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Expected Impact</Label>
                      <p className="text-green-600">{rec.expectedImpact}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Effort Required</Label>
                      <p className="text-blue-600">{rec.effort}</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    Implement Recommendation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Usage Statistics</CardTitle>
                <CardDescription>How your team is using AI features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.aiUsage.totalQueries}</div>
                    <div className="text-sm text-blue-700">Total Queries</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.aiUsage.avgResponseTime}ms</div>
                    <div className="text-sm text-green-700">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top AI Features</CardTitle>
                <CardDescription>Most used AI capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.aiUsage.topFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(feature.usage / Math.max(...data.aiUsage.topFeatures.map((f) => f.usage))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{feature.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
