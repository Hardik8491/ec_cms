"use client"

import { useState } from "react"
import { Copy, EyeOff, MoreHorizontal, Plus, RefreshCw, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

const apiKeys = [
  {
    id: "key_001",
    name: "Production API Key",
    key: "sk_prod_2Rg4ZkzNXfH7mJNG9V6L8W5T",
    store: "Tech Haven",
    createdAt: "2023-04-15",
    lastUsed: "2023-05-19",
    status: "active",
  },
  {
    id: "key_002",
    name: "Development API Key",
    key: "sk_dev_7Jh8KlmPQrS3tUvW4xYz2A1B",
    store: "Tech Haven",
    createdAt: "2023-04-16",
    lastUsed: "2023-05-18",
    status: "active",
  },
  {
    id: "key_003",
    name: "Analytics API Key",
    key: "sk_analytics_9C3dEfG4hIjK5lMnO6pQ7r",
    store: "Fashion Forward",
    createdAt: "2023-04-20",
    lastUsed: "2023-05-17",
    status: "active",
  },
  {
    id: "key_004",
    name: "Mobile App API Key",
    key: "sk_mobile_8S2tUvW4xYz1A3bC5dEfG6h",
    store: "Home Essentials",
    createdAt: "2023-04-25",
    lastUsed: "2023-05-19",
    status: "active",
  },
  {
    id: "key_005",
    name: "Test API Key",
    key: "sk_test_1A2b3C4d5E6f7G8h9I0jK1l",
    store: "Fashion Forward",
    createdAt: "2023-05-01",
    lastUsed: "2023-05-15",
    status: "inactive",
  },
]

export function ApiKeysList() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast({
      title: "Copied to clipboard",
      description: "API key copied to clipboard",
    })
  }

  const handleCreateKey = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setNewKey("sk_new_" + Math.random().toString(36).substring(2, 15))
      setIsLoading(false)
    }, 1000)
  }

  const maskApiKey = (key: string) => {
    return key.substring(0, 7) + "..." + key.substring(key.length - 4)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Loading API keys...
              </TableCell>
            </TableRow>
          ) : apiKeys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No API keys found.
              </TableCell>
            </TableRow>
          ) : (
            apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell className="font-medium">{apiKey.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">
                      {maskApiKey(apiKey.key)}
                    </code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyKey(apiKey.key)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{apiKey.store}</TableCell>
                <TableCell>{apiKey.createdAt}</TableCell>
                <TableCell>{apiKey.lastUsed}</TableCell>
                <TableCell>
                  <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>{apiKey.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleCopyKey(apiKey.key)}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Regenerate</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Revoke</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center p-4">
        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Create New API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to access your store data. Keep this key secure.
              </DialogDescription>
            </DialogHeader>

            {newKey ? (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Your API Key</Label>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyKey(newKey)}>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <code className="break-all rounded bg-background p-2 font-mono text-sm">{newKey}</code>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <EyeOff className="mr-1 inline-block h-3 w-3" />
                    This key will only be shown once. Store it securely.
                  </p>
                </div>

                <DialogFooter>
                  <Button onClick={() => setShowNewKeyDialog(false)}>Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input id="key-name" placeholder="e.g., Production API Key" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store">Store</Label>
                  <Select>
                    <SelectTrigger id="store">
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech-haven">Tech Haven</SelectItem>
                      <SelectItem value="fashion-forward">Fashion Forward</SelectItem>
                      <SelectItem value="home-essentials">Home Essentials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permissions">Permissions</Label>
                  <Select>
                    <SelectTrigger id="permissions">
                      <SelectValue placeholder="Select permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read-only">Read Only</SelectItem>
                      <SelectItem value="read-write">Read & Write</SelectItem>
                      <SelectItem value="full-access">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create API Key"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
