"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ApiDocsPage() {
  const [apiDocs, setApiDocs] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch("/api/docs")
        if (!response.ok) {
          throw new Error("Failed to fetch API documentation")
        }
        const data = await response.json()
        setApiDocs(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-lg">Loading API documentation...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    )
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "PUT":
      case "PATCH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return ""
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{apiDocs.title}</h1>
          <p className="text-muted-foreground">Version {apiDocs.version}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>How to authenticate with the API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Authentication Type: <Badge>{apiDocs.authentication.type}</Badge>
            </p>
            <div>
              <p className="font-medium">Header</p>
              <div className="flex items-center mt-1">
                <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded flex-1 font-mono">
                  {apiDocs.authentication.header}: YOUR_API_KEY
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(`${apiDocs.authentication.header}: YOUR_API_KEY`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p>{apiDocs.authentication.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
            <CardDescription>The base URL for all API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded flex-1 font-mono">{apiDocs.baseUrl}</code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiDocs.baseUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={apiDocs.endpoints[0].group.toLowerCase()}>
          <TabsList className="mb-4">
            {apiDocs.endpoints.map((group: any) => (
              <TabsTrigger key={group.group} value={group.group.toLowerCase()}>
                {group.group}
              </TabsTrigger>
            ))}
          </TabsList>

          {apiDocs.endpoints.map((group: any) => (
            <TabsContent key={group.group} value={group.group.toLowerCase()}>
              <Card>
                <CardHeader>
                  <CardTitle>{group.group} Endpoints</CardTitle>
                  <CardDescription>API endpoints for {group.group.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {group.endpoints.map((endpoint: any, index: number) => (
                      <AccordionItem key={index} value={`${group.group}-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center space-x-2 text-left">
                            <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                            <code className="font-mono">{endpoint.path}</code>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div>
                              <p className="font-medium">Description</p>
                              <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                            </div>

                            <div>
                              <p className="font-medium">Authentication</p>
                              <p className="text-sm text-muted-foreground">{endpoint.auth}</p>
                            </div>

                            {endpoint.parameters.length > 0 && (
                              <div>
                                <p className="font-medium mb-2">Parameters</p>
                                <div className="border rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                      <tr>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">In</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Required</th>
                                        <th className="px-4 py-2 text-left">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {endpoint.parameters.map((param: any, paramIndex: number) => (
                                        <tr key={paramIndex} className="border-t">
                                          <td className="px-4 py-2 font-mono">{param.name}</td>
                                          <td className="px-4 py-2">{param.in}</td>
                                          <td className="px-4 py-2">{param.type || (param.schema ? "object" : "")}</td>
                                          <td className="px-4 py-2">{param.required ? "Yes" : "No"}</td>
                                          <td className="px-4 py-2">{param.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="font-medium mb-2">Responses</p>
                              <div className="space-y-2">
                                {Object.entries(endpoint.responses).map(([code, response]: [string, any]) => (
                                  <div key={code} className="border rounded-md p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Badge
                                          className={
                                            code.startsWith("2")
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }
                                        >
                                          {code}
                                        </Badge>
                                        <p className="font-medium">{response.description}</p>
                                      </div>
                                      {response.schema && (
                                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                          <span>Schema</span>
                                          <ChevronRight className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="font-medium mb-2">Example Request</p>
                              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                  <code className="font-mono text-sm">
                                    {endpoint.method} {apiDocs.baseUrl}
                                    {endpoint.path.replace(/:([^/]+)/g, "{$1}")}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      copyToClipboard(
                                        `${endpoint.method} ${apiDocs.baseUrl}${endpoint.path.replace(/:([^/]+)/g, "{$1}")}`,
                                      )
                                    }
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="text-sm font-mono">
                                  <div>{`${apiDocs.authentication.header}: YOUR_API_KEY`}</div>
                                  <div>Content-Type: application/json</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
