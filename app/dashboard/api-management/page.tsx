import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeysList } from "@/components/dashboard/api-keys-list"
import { ApiEndpointsList } from "@/components/dashboard/api-endpoints-list"
import { ApiUsageMetrics } from "@/components/dashboard/api-usage-metrics"
import { ApiUsageChart } from "@/components/dashboard/api-usage-chart"
import { StoreSubdomainsList } from "@/components/dashboard/store-subdomains-list"

export default function ApiManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">API Management</h2>
        <div className="flex gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate API Key
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ApiUsageMetrics />
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="subdomains">Store Subdomains</TabsTrigger>
          <TabsTrigger value="usage">API Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available API Endpoints</CardTitle>
              <CardDescription>
                These endpoints are available for all your stores. Use them with your API keys to access store data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiEndpointsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for accessing your store data</CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeysList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subdomains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Subdomains</CardTitle>
              <CardDescription>Manage subdomains for your stores</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreSubdomainsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Analytics</CardTitle>
              <CardDescription>Monitor API usage across your stores</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ApiUsageChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
