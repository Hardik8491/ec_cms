"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy } from "lucide-react"

interface CreateApiKeyFormProps {
  storeId: string
}

export function CreateApiKeyForm({ storeId }: CreateApiKeyFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [permissions, setPermissions] = useState<string[]>(["read"])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [newApiKey, setNewApiKey] = useState("")

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setPermissions([...permissions, permission])
    } else {
      setPermissions(permissions.filter((p) => p !== permission))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/agency/stores/${storeId}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          permissions,
        }),
      })

     
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create API key")
      }

      const apiKey = await response.json()
      setNewApiKey(apiKey.key)
      setShowDialog(true)
      setName("")
      setPermissions(["read"])
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(newApiKey)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">API Key Name</Label>
          <Input
            id="name"
            placeholder="e.g. Website Integration"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Permissions</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="read"
                checked={permissions.includes("read")}
                onCheckedChange={(checked) => handlePermissionChange("read", checked as boolean)}
              />
              <Label htmlFor="read" className="font-normal">
                Read (View products, orders, customers)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="write"
                checked={permissions.includes("write")}
                onCheckedChange={(checked) => handlePermissionChange("write", checked as boolean)}
              />
              <Label htmlFor="write" className="font-normal">
                Write (Create and update products, orders)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin"
                checked={permissions.includes("admin")}
                onCheckedChange={(checked) => handlePermissionChange("admin", checked as boolean)}
              />
              <Label htmlFor="admin" className="font-normal">
                Admin (Full access, including settings)
              </Label>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating API Key
            </>
          ) : (
            "Generate API Key"
          )}
        </Button>
      </form>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. For security reasons, it will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input value={newApiKey} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Alert className="mt-4 bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800">
            <AlertDescription>
              Make sure to store this API key securely. It will not be displayed again.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button onClick={handleCloseDialog}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
