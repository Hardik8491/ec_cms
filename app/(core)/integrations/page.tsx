"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Globe,
  Search,
  Plus,
  Settings,
  Check,
  X,
  Zap,
  ShoppingCart,
  Mail,
  MessageSquare,
  CreditCard,
  Truck,
  BarChart3,
  Users,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  status: "connected" | "available" | "coming_soon";
  isPopular: boolean;
  features: string[];
  pricing: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "All Integrations", count: 0 },
    { id: "ecommerce", name: "E-commerce", count: 0 },
    { id: "payment", name: "Payments", count: 0 },
    { id: "shipping", name: "Shipping", count: 0 },
    { id: "marketing", name: "Marketing", count: 0 },
    { id: "analytics", name: "Analytics", count: 0 },
    { id: "communication", name: "Communication", count: 0 },
  ];

  const mockIntegrations: Integration[] = [
    {
      id: "shopify",
      name: "Shopify",
      description:
        "Sync products, orders, and customers with your Shopify store",
      category: "ecommerce",
      icon: <ShoppingCart className="h-6 w-6" />,
      status: "connected",
      isPopular: true,
      features: [
        "Product sync",
        "Order management",
        "Customer data",
        "Inventory tracking",
      ],
      pricing: "Free",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Accept payments securely with Stripe's payment processing",
      category: "payment",
      icon: <CreditCard className="h-6 w-6" />,
      status: "connected",
      isPopular: true,
      features: [
        "Payment processing",
        "Subscription billing",
        "Fraud protection",
        "Global payments",
      ],
      pricing: "2.9% + 30¢",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Email marketing and automation platform",
      category: "marketing",
      icon: <Mail className="h-6 w-6" />,
      status: "available",
      isPopular: true,
      features: [
        "Email campaigns",
        "Automation",
        "Audience segmentation",
        "Analytics",
      ],
      pricing: "Free - $299/mo",
    },
    {
      id: "fedex",
      name: "FedEx",
      description: "Shipping and logistics integration",
      category: "shipping",
      icon: <Truck className="h-6 w-6" />,
      status: "available",
      isPopular: false,
      features: [
        "Shipping rates",
        "Label printing",
        "Tracking",
        "International shipping",
      ],
      pricing: "Pay per shipment",
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Track website traffic and user behavior",
      category: "analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      status: "available",
      isPopular: true,
      features: [
        "Traffic analytics",
        "Conversion tracking",
        "Audience insights",
        "Custom reports",
      ],
      pricing: "Free",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Customer communication via WhatsApp",
      category: "communication",
      icon: <MessageSquare className="h-6 w-6" />,
      status: "connected",
      isPopular: false,
      features: [
        "Customer chat",
        "Order notifications",
        "Support tickets",
        "Broadcast messages",
      ],
      pricing: "Free - $0.005/msg",
    },
    {
      id: "klaviyo",
      name: "Klaviyo",
      description: "Advanced email and SMS marketing platform",
      category: "marketing",
      icon: <Mail className="h-6 w-6" />,
      status: "coming_soon",
      isPopular: false,
      features: [
        "Email marketing",
        "SMS campaigns",
        "Personalization",
        "Advanced analytics",
      ],
      pricing: "$20 - $1700/mo",
    },
    {
      id: "zendesk",
      name: "Zendesk",
      description: "Customer support and helpdesk solution",
      category: "communication",
      icon: <Users className="h-6 w-6" />,
      status: "available",
      isPopular: false,
      features: [
        "Ticket management",
        "Live chat",
        "Knowledge base",
        "Customer portal",
      ],
      pricing: "$19 - $199/agent/mo",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIntegrations(mockIntegrations);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "default";
      case "available":
        return "secondary";
      case "coming_soon":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Check className="h-4 w-4" />;
      case "available":
        return <Plus className="h-4 w-4" />;
      case "coming_soon":
        return <X className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Integrations Hub
              </h1>
              <p className="text-gray-600">
                Connect your store with powerful third-party services
              </p>
            </div>
          </div>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Request Integration
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="connected">
              Connected (
              {integrations.filter((i) => i.status === "connected").length})
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Popular Integrations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Popular Integrations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations
                  .filter((integration) => integration.isPopular)
                  .map((integration) => (
                    <Card
                      key={integration.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {integration.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {integration.name}
                              </CardTitle>
                              <Badge
                                variant={getStatusColor(integration.status)}
                                className="mt-1"
                              >
                                {getStatusIcon(integration.status)}
                                <span className="ml-1 capitalize">
                                  {integration.status.replace("_", " ")}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {integration.description}
                        </CardDescription>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-2">
                              Key Features:
                            </h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {integration.features
                                .slice(0, 3)
                                .map((feature, index) => (
                                  <li key={index} className="flex items-center">
                                    <Check className="h-3 w-3 text-green-500 mr-2" />
                                    {feature}
                                  </li>
                                ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm font-medium">
                              {integration.pricing}
                            </span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  {integration.status === "connected" ? (
                                    <>
                                      <Settings className="h-3 w-3 mr-1" />
                                      Configure
                                    </>
                                  ) : integration.status === "available" ? (
                                    <>
                                      <Plus className="h-3 w-3 mr-1" />
                                      Connect
                                    </>
                                  ) : (
                                    "Coming Soon"
                                  )}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {integration.name} Integration
                                  </DialogTitle>
                                  <DialogDescription>
                                    {integration.status === "connected"
                                      ? "Manage your integration settings"
                                      : "Connect your account to get started"}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      All Features:
                                    </h4>
                                    <ul className="space-y-1">
                                      {integration.features.map(
                                        (feature, index) => (
                                          <li
                                            key={index}
                                            className="flex items-center text-sm"
                                          >
                                            <Check className="h-3 w-3 text-green-500 mr-2" />
                                            {feature}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                  <div className="flex justify-end space-x-3">
                                    <Button variant="outline">
                                      Learn More
                                    </Button>
                                    <Button>
                                      {integration.status === "connected"
                                        ? "Configure"
                                        : "Connect"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* All Integrations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">All Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((integration) => (
                  <Card
                    key={integration.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {integration.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {integration.name}
                            </CardTitle>
                            <Badge
                              variant={getStatusColor(integration.status)}
                              className="mt-1"
                            >
                              {getStatusIcon(integration.status)}
                              <span className="ml-1 capitalize">
                                {integration.status.replace("_", " ")}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {integration.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {integration.pricing}
                        </span>
                        <Button variant="outline" size="sm">
                          {integration.status === "connected"
                            ? "Configure"
                            : integration.status === "available"
                            ? "Connect"
                            : "Coming Soon"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connected" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations
                .filter((integration) => integration.status === "connected")
                .map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {integration.name}
                          </CardTitle>
                          <Badge variant="default">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {integration.description}
                      </CardDescription>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(1).map((category) => {
                const categoryIntegrations = integrations.filter(
                  (i) => i.category === category.id
                );
                return (
                  <Card
                    key={category.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <Badge variant="secondary">
                          {categoryIntegrations.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {
                          categoryIntegrations.filter(
                            (i) => i.status === "connected"
                          ).length
                        }{" "}
                        connected
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryIntegrations.slice(0, 3).map((integration) => (
                          <div
                            key={integration.id}
                            className="flex items-center space-x-2"
                          >
                            <div className="p-1 bg-muted rounded">
                              {integration.icon}
                            </div>
                            <span className="text-sm">{integration.name}</span>
                            <Badge
                              variant={getStatusColor(integration.status)}
                              className="ml-auto"
                            >
                              {integration.status === "connected"
                                ? "Connected"
                                : "Available"}
                            </Badge>
                          </div>
                        ))}
                        {categoryIntegrations.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{categoryIntegrations.length - 3} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
