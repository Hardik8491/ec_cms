"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Agency name must be at least 2 characters.",
  }),
  subdomain: z
    .string()
    .min(3, {
      message: "Subdomain must be at least 3 characters.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "Subdomain can only contain lowercase letters, numbers, and hyphens.",
    }),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  isApproved: z.boolean().default(false),
})

type AgencyFormValues = z.infer<typeof formSchema>

interface AgencyFormProps {
  agency?: any
}

export function AgencyForm({ agency }: AgencyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues: Partial<AgencyFormValues> = {
    name: agency?.name || "",
    subdomain: agency?.subdomain || "",
    description: agency?.description || "",
    logo: agency?.logo || "",
    isApproved: agency?.isApproved || false,
  }

  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(data: AgencyFormValues) {
    setIsLoading(true)
    try {
      if (agency) {
        // Update existing agency
        const response = await fetch(`/api/admin/agencies/${agency.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update agency")
        }

        toast({
          title: "Agency updated",
          description: "The agency has been updated successfully.",
        })
      } else {
        // Create new agency
        const response = await fetch("/api/admin/agencies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create agency")
        }

        toast({
          title: "Agency created",
          description: "The agency has been created successfully.",
        })
      }

      router.push("/admin/agencies")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{agency ? "Edit Agency" : "Create Agency"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormDescription>The name of the agency as it will appear to users.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain</FormLabel>
                  <FormControl>
                    <Input placeholder="acme" {...field} />
                  </FormControl>
                  <FormDescription>The subdomain for the agency (e.g., acme.ec-cms.com).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of the agency..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>URL to the agency's logo image.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isApproved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Approved</FormLabel>
                    <FormDescription>Approve this agency to allow them to access their dashboard.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <CardFooter className="px-0">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : agency ? "Update Agency" : "Create Agency"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
