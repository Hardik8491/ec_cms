"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, { message: "Store name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  description: z.string().optional(),
  currency: z.string().default("USD"),
  subdomain: z
    .string()
    .min(2, { message: "Subdomain must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Subdomain can only contain lowercase letters, numbers, and hyphens" }),
  customDomain: z.string().optional(),
})

export default function AddStorePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      currency: "USD",
      subdomain: "",
      customDomain: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Create store
      const storeResponse = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          slug: values.slug,
          description: values.description,
          currency: values.currency,
        }),
      })

      if (!storeResponse.ok) {
        const error = await storeResponse.json()
        throw new Error(error.error || "Failed to create store")
      }

      const { store } = await storeResponse.json()

      // Create subdomain
      const subdomainResponse = await fetch("/api/subdomains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subdomain: values.subdomain,
          customDomain: values.customDomain,
          storeId: store.id,
        }),
      })

      if (!subdomainResponse.ok) {
        const error = await subdomainResponse.json()
        throw new Error(error.error || "Failed to create subdomain")
      }

      // Create initial API key
      const apiKeyResponse = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Default API Key",
          permission: "read",
          storeId: store.id,
        }),
      })

      if (!apiKeyResponse.ok) {
        const error = await apiKeyResponse.json()
        throw new Error(error.error || "Failed to create API key")
      }

      const { apiKey } = await apiKeyResponse.json()

      toast({
        title: "Store created successfully",
        description: "Your store has been created with a subdomain and API key",
      })

      // Show API key in a modal or redirect to API key page
      router.push(`/dashboard/api-management?newApiKey=${apiKey.key}`)
    } catch (error: any) {
      toast({
        title: "Error creating store",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add New Store</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>Create a new store and configure its API access</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Store" {...field} />
                      </FormControl>
                      <FormDescription>The name of your store as shown to customers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="my-awesome-store" {...field} />
                      </FormControl>
                      <FormDescription>Used in URLs and API endpoints</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your store..." {...field} />
                    </FormControl>
                    <FormDescription>A brief description of your store</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The primary currency for your store</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <div className="flex items-center">
                        <FormControl>
                          <Input placeholder="mystore" {...field} className="rounded-r-none" />
                        </FormControl>
                        <div className="flex h-10 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                          .hdkcm.com
                        </div>
                      </div>
                      <FormDescription>Your store's subdomain for API access</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Domain (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="store.yourdomain.com" {...field} />
                      </FormControl>
                      <FormDescription>Your own domain for the store</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="flex justify-end px-0">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Store..." : "Create Store"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
