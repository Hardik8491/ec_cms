"use client"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { Key } from "lucide-react"
import { format } from "date-fns"
import { CreateApiKeyForm } from "@/components/create-api-key-form"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const prisma = new PrismaClient()

interface ApiKeysPageProps {
  params: {
    storeId: string
  }
}

export default async function ApiKeysPage({ params }: ApiKeysPageProps) {
  const { storeId } = params
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

  // Fetch API keys
  const apiKeys = await prisma.apiKey.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })

  // Mask API keys for security
  const maskedApiKeys = apiKeys.map((key) => ({
    ...key,
    key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create API Key</CardTitle>
              <CardDescription>
                Generate a new API key for this store to integrate with external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateApiKeyForm storeId={storeId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Learn how to use the API to integrate with your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Base URL</h3>
                <p className="text-sm mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">https://yourdomain.com/api/v1</p>
              </div>

              <div>
                <h3 className="font-medium">Authentication</h3>
                <p className="text-sm mt-1">Include your API key in the request headers:</p>
                <p className="text-sm mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">x-api-key: your_api_key</p>
              </div>

              <div>
                <h3 className="font-medium">Available Endpoints</h3>
                <ul className="text-sm mt-1 space-y-2">
                  <li>
                    <Badge variant="outline">GET</Badge> <code>/stores/{storeId}/products</code> - List all products
                  </li>
                  <li>
                    <Badge variant="outline">POST</Badge> <code>/stores/{storeId}/products</code> - Create a product
                  </li>
                  <li>
                    <Badge variant="outline">GET</Badge> <code>/stores/{storeId}/orders</code> - List all orders
                  </li>
                  <li>
                    <Badge variant="outline">POST</Badge> <code>/stores/{storeId}/orders</code> - Create an order
                  </li>
                </ul>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="/docs/api" target="_blank" rel="noreferrer">
                  View Full Documentation
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Existing API Keys</CardTitle>
            <CardDescription>
              Manage your existing API keys. For security, full keys are only shown once when created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {maskedApiKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Key className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first API key to integrate with external services
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maskedApiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <div className="font-medium">{apiKey.name}</div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">{apiKey.key}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(apiKey.permissions as string[]).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {apiKey.lastUsed ? format(new Date(apiKey.lastUsed), "MMM d, yyyy") : "Never"}
                      </TableCell>
                      <TableCell>{format(new Date(apiKey.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm">
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
