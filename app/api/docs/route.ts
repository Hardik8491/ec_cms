import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // API documentation structure
  const apiDocs = {
    title: "E-commerce CRM API Documentation",
    version: "1.0.0",
    baseUrl: "/api/v1",
    authentication: {
      type: "API Key",
      header: "x-api-key",
      description: "Include your API key in the request headers for authentication",
    },
    endpoints: [
      {
        group: "Stores",
        endpoints: [
          {
            method: "GET",
            path: "/stores",
            description: "Get all stores",
            auth: "Required",
            parameters: [],
            responses: {
              "200": {
                description: "List of stores",
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                      // Other store properties
                    },
                  },
                },
              },
              "401": {
                description: "Unauthorized",
              },
            },
          },
          {
            method: "GET",
            path: "/stores/:storeId",
            description: "Get store by ID",
            auth: "Required",
            parameters: [
              {
                name: "storeId",
                in: "path",
                required: true,
                type: "string",
                description: "Store ID",
              },
            ],
            responses: {
              "200": {
                description: "Store details",
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    // Other store properties
                  },
                },
              },
              "401": {
                description: "Unauthorized",
              },
              "404": {
                description: "Store not found",
              },
            },
          },
        ],
      },
      {
        group: "Products",
        endpoints: [
          {
            method: "GET",
            path: "/stores/:storeId/products",
            description: "Get all products for a store",
            auth: "Required",
            parameters: [
              {
                name: "storeId",
                in: "path",
                required: true,
                type: "string",
                description: "Store ID",
              },
              {
                name: "limit",
                in: "query",
                required: false,
                type: "number",
                description: "Number of products to return (default: 50)",
              },
              {
                name: "page",
                in: "query",
                required: false,
                type: "number",
                description: "Page number (default: 1)",
              },
              {
                name: "category",
                in: "query",
                required: false,
                type: "string",
                description: "Filter by category ID",
              },
              {
                name: "search",
                in: "query",
                required: false,
                type: "string",
                description: "Search term for product name or description",
              },
              {
                name: "sort",
                in: "query",
                required: false,
                type: "string",
                description: "Sort field (default: createdAt)",
              },
              {
                name: "order",
                in: "query",
                required: false,
                type: "string",
                description: "Sort order: asc or desc (default: desc)",
              },
            ],
            responses: {
              "200": {
                description: "List of products with pagination",
                schema: {
                  type: "object",
                  properties: {
                    products: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          price: { type: "number" },
                          // Other product properties
                        },
                      },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        page: { type: "number" },
                        limit: { type: "number" },
                        pages: { type: "number" },
                      },
                    },
                  },
                },
              },
              "401": {
                description: "Unauthorized",
              },
              "403": {
                description: "Forbidden",
              },
            },
          },
          {
            method: "POST",
            path: "/stores/:storeId/products",
            description: "Create a new product",
            auth: "Required (with write permission)",
            parameters: [
              {
                name: "storeId",
                in: "path",
                required: true,
                type: "string",
                description: "Store ID",
              },
              {
                name: "body",
                in: "body",
                required: true,
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", required: true },
                    description: { type: "string" },
                    price: { type: "number", required: true },
                    comparePrice: { type: "number" },
                    cost: { type: "number" },
                    sku: { type: "string" },
                    barcode: { type: "string" },
                    images: { type: "array", items: { type: "string" } },
                    categories: { type: "array", items: { type: "string" } },
                    variants: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          options: { type: "object" },
                          price: { type: "number" },
                          quantity: { type: "number" },
                          sku: { type: "string" },
                        },
                      },
                    },
                    quantity: { type: "number" },
                  },
                },
              },
            ],
            responses: {
              "201": {
                description: "Created product",
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    // Other product properties
                  },
                },
              },
              "400": {
                description: "Bad request",
              },
              "401": {
                description: "Unauthorized",
              },
              "403": {
                description: "Forbidden",
              },
            },
          },
        ],
      },
      {
        group: "Orders",
        endpoints: [
          {
            method: "GET",
            path: "/stores/:storeId/orders",
            description: "Get all orders for a store",
            auth: "Required",
            parameters: [
              {
                name: "storeId",
                in: "path",
                required: true,
                type: "string",
                description: "Store ID",
              },
              {
                name: "limit",
                in: "query",
                required: false,
                type: "number",
                description: "Number of orders to return (default: 50)",
              },
              {
                name: "page",
                in: "query",
                required: false,
                type: "number",
                description: "Page number (default: 1)",
              },
              {
                name: "status",
                in: "query",
                required: false,
                type: "string",
                description: "Filter by order status",
              },
              {
                name: "search",
                in: "query",
                required: false,
                type: "string",
                description: "Search term for order number or customer",
              },
              {
                name: "sort",
                in: "query",
                required: false,
                type: "string",
                description: "Sort field (default: createdAt)",
              },
              {
                name: "order",
                in: "query",
                required: false,
                type: "string",
                description: "Sort order: asc or desc (default: desc)",
              },
            ],
            responses: {
              "200": {
                description: "List of orders with pagination",
                schema: {
                  type: "object",
                  properties: {
                    orders: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          orderNumber: { type: "string" },
                          status: { type: "string" },
                          total: { type: "number" },
                          // Other order properties
                        },
                      },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        page: { type: "number" },
                        limit: { type: "number" },
                        pages: { type: "number" },
                      },
                    },
                  },
                },
              },
              "401": {
                description: "Unauthorized",
              },
              "403": {
                description: "Forbidden",
              },
            },
          },
          {
            method: "POST",
            path: "/stores/:storeId/orders",
            description: "Create a new order",
            auth: "Required (with write permission)",
            parameters: [
              {
                name: "storeId",
                in: "path",
                required: true,
                type: "string",
                description: "Store ID",
              },
              {
                name: "body",
                in: "body",
                required: true,
                schema: {
                  type: "object",
                  properties: {
                    customer: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        name: { type: "string" },
                        phone: { type: "string" },
                        address: { type: "string" },
                        city: { type: "string" },
                        state: { type: "string" },
                        postalCode: { type: "string" },
                        country: { type: "string" },
                      },
                    },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          productId: { type: "string", required: true },
                          quantity: { type: "number", required: true },
                          price: { type: "number" },
                          options: { type: "object" },
                        },
                      },
                      required: true,
                    },
                    status: { type: "string" },
                    paymentStatus: { type: "string" },
                    paymentMethod: { type: "string" },
                    shippingAddress: { type: "object" },
                    billingAddress: { type: "object" },
                    notes: { type: "string" },
                    tax: { type: "number" },
                    shipping: { type: "number" },
                    discount: { type: "number" },
                  },
                },
              },
            ],
            responses: {
              "201": {
                description: "Created order",
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    orderNumber: { type: "string" },
                    status: { type: "string" },
                    total: { type: "number" },
                    // Other order properties
                  },
                },
              },
              "400": {
                description: "Bad request",
              },
              "401": {
                description: "Unauthorized",
              },
              "403": {
                description: "Forbidden",
              },
            },
          },
        ],
      },
      {
        group: "Analytics",
        endpoints: [
          {
            method: "GET",
            path: "/stores/:storeId/analytics",
            description: "Get analytics for a store",
            auth: "Required",
            parameters: [
              {
                name: "storeId",
                in: "path",
                required: true,
                type: "string",
                description: "Store ID",
              },
              {
                name: "period",
                in: "query",
                required: false,
                type: "string",
                description: "Time period: day, week, month, year (default: month)",
              },
              {
                name: "startDate",
                in: "query",
                required: false,
                type: "string",
                description: "Start date (ISO format)",
              },
              {
                name: "endDate",
                in: "query",
                required: false,
                type: "string",
                description: "End date (ISO format)",
              },
            ],
            responses: {
              "200": {
                description: "Analytics data",
                schema: {
                  type: "object",
                  properties: {
                    period: {
                      type: "object",
                      properties: {
                        start: { type: "string" },
                        end: { type: "string" },
                      },
                    },
                    summary: {
                      type: "object",
                      properties: {
                        revenue: { type: "number" },
                        orders: { type: "number" },
                        customers: { type: "number" },
                        averageOrderValue: { type: "number" },
                      },
                    },
                    timeSeries: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string" },
                          revenue: { type: "number" },
                          orders: { type: "number" },
                          customers: { type: "number" },
                          pageViews: { type: "number" },
                          conversion: { type: "number" },
                        },
                      },
                    },
                    topProducts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          quantity: { type: "number" },
                          revenue: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
              "401": {
                description: "Unauthorized",
              },
              "403": {
                description: "Forbidden",
              },
            },
          },
        ],
      },
    ],
  }

  return NextResponse.json(apiDocs)
}
