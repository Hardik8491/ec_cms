"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  Heart,
  Mail,
  MessageSquare,
  Target,
  Clock,
  Star,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ResponsiveContainer, Funnel, FunnelChart, Cell } from "recharts";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  segment: string;
  stage: string;
  ltv: number;
  totalOrders: number;
  lastActivity: string;
  churnRisk: number;
  healthScore: number;
  tags: string[];
}

interface JourneyStage {
  name: string;
  customers: number;
  conversionRate: number;
  avgTimeSpent: number;
}

export default function CustomerJourneyPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");

  const journeyStages: JourneyStage[] = [
    {
      name: "Awareness",
      customers: 1250,
      conversionRate: 45,
      avgTimeSpent: 2.5,
    },
    { name: "Interest", customers: 562, conversionRate: 65, avgTimeSpent: 4.2 },
    {
      name: "Consideration",
      customers: 365,
      conversionRate: 78,
      avgTimeSpent: 6.8,
    },
    { name: "Purchase", customers: 285, conversionRate: 85, avgTimeSpent: 3.1 },
    {
      name: "Retention",
      customers: 242,
      conversionRate: 92,
      avgTimeSpent: 12.5,
    },
    {
      name: "Advocacy",
      customers: 123,
      conversionRate: 95,
      avgTimeSpent: 18.2,
    },
  ];

  const funnelData = journeyStages.map((stage, index) => ({
    name: stage.name,
    value: stage.customers,
    fill: `hsl(${220 + index * 30}, 70%, ${60 + index * 5}%)`,
  }));

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await fetch("/api/customers/journey");
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "vip":
        return "default";
      case "loyal":
        return "secondary";
      case "at_risk":
        return "destructive";
      case "new":
        return "outline";
      default:
        return "default";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "awareness":
        return "outline";
      case "interest":
        return "secondary";
      case "consideration":
        return "default";
      case "purchase":
        return "default";
      case "retention":
        return "secondary";
      case "advocacy":
        return "default";
      default:
        return "outline";
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSegment =
      selectedSegment === "all" || customer.segment === selectedSegment;
    const matchesStage =
      selectedStage === "all" || customer.stage === selectedStage;
    return matchesSegment && matchesStage;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Customer Journey
              </h1>
              <p className="text-gray-600">
                Track and optimize your customer lifecycle
              </p>
            </div>
          </div>
          <Button>
            <Target className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Journey Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Journey Funnel</CardTitle>
            <CardDescription>
              Track customers through each stage of their journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ChartContainer
                  config={{
                    value: {
                      label: "Customers",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Funnel
                        dataKey="value"
                        data={funnelData}
                        isAnimationActive
                      >
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Funnel>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </FunnelChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="space-y-4">
                {journeyStages.map((stage, index) => (
                  <div
                    key={stage.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: funnelData[index].fill }}
                      ></div>
                      <div>
                        <h4 className="font-medium">{stage.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stage.customers} customers • {stage.conversionRate}%
                          conversion
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {stage.avgTimeSpent} days
                      </p>
                      <p className="text-xs text-muted-foreground">avg. time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Management */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Select
                    value={selectedSegment}
                    onValueChange={setSelectedSegment}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Segments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="loyal">Loyal</SelectItem>
                      <SelectItem value="at_risk">At Risk</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedStage}
                    onValueChange={setSelectedStage}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="interest">Interest</SelectItem>
                      <SelectItem value="consideration">
                        Consideration
                      </SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="advocacy">Advocacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Table */}
            <Card>
              <CardHeader>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>
                  Manage your customers and their journey stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>LTV</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Health Score</TableHead>
                      <TableHead>Churn Risk</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.slice(0, 10).map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSegmentColor(customer.segment)}>
                            {customer.segment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStageColor(customer.stage)}>
                            {customer.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>${customer.ltv.toFixed(2)}</TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{customer.healthScore}/100</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              customer.churnRisk > 70
                                ? "destructive"
                                : customer.churnRisk > 40
                                ? "secondary"
                                : "default"
                            }
                          >
                            {customer.churnRisk}%
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.lastActivity}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    VIP Customers
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    High-value customers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Loyal Customers
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">423</div>
                  <p className="text-xs text-muted-foreground">
                    Repeat purchasers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">89</div>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">234</div>
                  <p className="text-xs text-muted-foreground">
                    Recent signups
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Journey Automation</CardTitle>
                <CardDescription>
                  Set up automated workflows for different customer stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Automated Workflows
                  </h3>
                  <p className="text-muted-foreground">
                    Create automated email sequences and actions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Journey Analytics</CardTitle>
                <CardDescription>
                  Deep insights into customer behavior and journey performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    Detailed customer journey analytics and insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
