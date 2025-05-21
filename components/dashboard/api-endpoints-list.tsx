"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const apiEndpoints = [
  {
    category: "Products",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/products",
        description: "Get all products for a store",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "page", type: "query", required: false, description: "Page number for pagination" },
          { name: "limit", type: "query", required: false, description: "Number of items per page" },
          { name: "search", type: "query", required: false, description: "Search term for filtering products" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/products/{productId}",
        description: "Get a specific product",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "productId", type: "path", required: true, description: "The ID of the product" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/stores/{storeId}/products",
        description: "Create a new product",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "name", type: "body", required: true, description: "Product name" },
          { name: "description", type: "body", required: false, description: "Product description" },
          { name: "price", type: "body", required: true, description: "Product price" },
          { name: "categoryId", type: "body", required: true, description: "Category ID" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/stores/{storeId}/products/{productId}",
        description: "Update a product",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "productId", type: "path", required: true, description: "The ID of the product" },
          { name: "name", type: "body", required: false, description: "Product name" },
          { name: "description", type: "body", required: false, description: "Product description" },
          { name: "price", type: "body", required: false, description: "Product price" },
          { name: "categoryId", type: "body", required: false, description: "Category ID" },
        ],
      },
      {
        method: "DELETE",
        path: "/api/v1/stores/{storeId}/products/{productId}",
        description: "Delete a product",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "productId", type: "path", required: true, description: "The ID of the product" },
        ],
      },
    ],
  },
  {
    category: "Orders",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/orders",
        description: "Get all orders for a store",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "page", type: "query", required: false, description: "Page number for pagination" },
          { name: "limit", type: "query", required: false, description: "Number of items per page" },
          { name: "status", type: "query", required: false, description: "Filter by order status" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/orders/{orderId}",
        description: "Get a specific order",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "orderId", type: "path", required: true, description: "The ID of the order" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/stores/{storeId}/orders",
        description: "Create a new order",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "customerId", type: "body", required: true, description: "Customer ID" },
          { name: "items", type: "body", required: true, description: "Array of order items" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/stores/{storeId}/orders/{orderId}/status",
        description: "Update order status",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "orderId", type: "path", required: true, description: "The ID of the order" },
          { name: "status", type: "body", required: true, description: "New order status" },
        ],
      },
    ],
  },
  {
    category: "Customers",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/customers",
        description: "Get all customers for a store",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "page", type: "query", required: false, description: "Page number for pagination" },
          { name: "limit", type: "query", required: false, description: "Number of items per page" },
          { name: "search", type: "query", required: false, description: "Search term for filtering customers" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/customers/{customerId}",
        description: "Get a specific customer",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "customerId", type: "path", required: true, description: "The ID of the customer" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/stores/{storeId}/customers",
        description: "Create a new customer",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "name", type: "body", required: true, description: "Customer name" },
          { name: "email", type: "body", required: true, description: "Customer email" },
          { name: "phone", type: "body", required: false, description: "Customer phone" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/stores/{storeId}/customers/{customerId}",
        description: "Update a customer",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "customerId", type: "path", required: true, description: "The ID of the customer" },
          { name: "name", type: "body", required: false, description: "Customer name" },
          { name: "email", type: "body", required: false, description: "Customer email" },
          { name: "phone", type: "body", required: false, description: "Customer phone" },
        ],
      },
      {
        method: "DELETE",
        path: "/api/v1/stores/{storeId}/customers/{customerId}",
        description: "Delete a customer",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "customerId", type: "path", required: true, description: "The ID of the customer" },
        ],
      },
    ],
  },
  {
    category: "Analytics",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/analytics/overview",
        description: "Get store overview analytics",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "period", type: "query", required: false, description: "Time period (day, week, month, year)" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/analytics/sales",
        description: "Get store sales analytics",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "period", type: "query", required: false, description: "Time period (day, week, month, year)" },
          { name: "groupBy", type: "query", required: false, description: "Group by (day, week, month)" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/analytics/products",
        description: "Get product performance analytics",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "period", type: "query", required: false, description: "Time period (day, week, month, year)" },
          { name: "limit", type: "query", required: false, description: "Number of top products to return" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/stores/{storeId}/analytics/customers",
        description: "Get customer analytics",
        parameters: [
          { name: "storeId", type: "path", required: true, description: "The ID of the store" },
          { name: "period", type: "query", required: false, description: "Time period (day, week, month, year)" },
        ],
      },
    ],
  },
]

export function ApiEndpointsList() {
  const { toast } = useToast()
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopiedPath(path)
    toast({
      title: "Copied to clipboard",
      description: "API endpoint path copied to clipboard",
    })
    setTimeout(() => setCopiedPath(null), 2000)
  }

  return (
    <Tabs defaultValue={apiEndpoints[0].category.toLowerCase()} className="w-full">
      <TabsList className="mb-4 flex flex-wrap">
        {apiEndpoints.map((category) => (
          <TabsTrigger key={category.category} value={category.category.toLowerCase()}>
            {category.category}
          </TabsTrigger>
        ))}
      </TabsList>

      {apiEndpoints.map((category) => (
        <TabsContent key={category.category} value={category.category.toLowerCase()} className="space-y-6">
          {category.endpoints.map((endpoint, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      endpoint.method === "GET"
                        ? "default"
                        : endpoint.method === "POST"
                          ? "secondary"
                          : endpoint.method === "PUT"
                            ? "outline"
                            : "destructive"
                    }
                    className="font-mono"
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {endpoint.path}
                  </code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyPath(endpoint.path)}>
                    {copiedPath === endpoint.path ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <ExternalLink className="h-3 w-3" />
                  Test
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{endpoint.description}</p>

              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Parameters</h4>
                <div className="space-y-2">
                  {endpoint.parameters.map((param, paramIndex) => (
                    <div key={paramIndex} className="flex items-start text-sm">
                      <div className="w-1/4 font-medium">{param.name}</div>
                      <div className="w-1/4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {param.type}
                        </Badge>
                        {param.required && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            required
                          </Badge>
                        )}
                      </div>
                      <div className="w-2/4 text-muted-foreground">{param.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
