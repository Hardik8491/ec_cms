"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink, Globe, MoreHorizontal, Plus } from "lucide-react"
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

const storeSubdomains = [
  {
    id: "sub_001",
    subdomain: "techhaven",
    fullDomain: "techhaven.hdkcm.com",
    store: "Tech Haven",
    createdAt: "2023-04-15",
    status: "active",
    customDomain: "store.techhaven.com",
  },
  {
    id: "sub_002",
    subdomain: "fashionforward",
    fullDomain: "fashionforward.hdkcm.com",
    store: "Fashion Forward",
    createdAt: "2023-04-16",
    status: "active",
    customDomain: null,
  },
  {
    id: "sub_003",
    subdomain: "homeessentials",
    fullDomain: "homeessentials.hdkcm.com",
    store: "Home Essentials",
    createdAt: "2023-04-20",
    status: "active",
    customDomain: "shop.homeessentials.com",
  },
  {
    id: "sub_004",
    subdomain: "activelife",
    fullDomain: "activelife.hdkcm.com",
    store: "Active Life",
    createdAt: "2023-04-25",
    status: "inactive",
    customDomain: null,
  },
]

export function StoreSubdomainsList() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showNewSubdomainDialog, setShowNewSubdomainDialog] = useState(false)
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null)

  const handleCopyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain)
    setCopiedDomain(domain)
    toast({
      title: "Copied to clipboard",
      description: "Domain copied to clipboard",
    })
    setTimeout(() => setCopiedDomain(null), 2000)
  }

  const handleCreateSubdomain = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowNewSubdomainDialog(false)
      toast({
        title: "Subdomain created",
        description: "Your new subdomain has been created successfully",
      })
    }, 1000)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subdomain</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Custom Domain</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Loading subdomains...
              </TableCell>
            </TableRow>
          ) : storeSubdomains.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No subdomains found.
              </TableCell>
            </TableRow>
          ) : (
            storeSubdomains.map((subdomain) => (
              <TableRow key={subdomain.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">{subdomain.fullDomain}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopyDomain(subdomain.fullDomain)}
                    >
                      {copiedDomain === subdomain.fullDomain ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{subdomain.store}</TableCell>
                <TableCell>
                  {subdomain.customDomain ? (
                    <div className="flex items-center gap-2">
                      <span>{subdomain.customDomain}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyDomain(subdomain.customDomain!)}
                      >
                        {copiedDomain === subdomain.customDomain ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>{subdomain.createdAt}</TableCell>
                <TableCell>
                  <Badge variant={subdomain.status === "active" ? "default" : "secondary"}>{subdomain.status}</Badge>
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
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Visit Store</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Globe className="mr-2 h-4 w-4" />
                        <span>Add Custom Domain</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <span>Edit Subdomain</span>
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
        <Dialog open={showNewSubdomainDialog} onOpenChange={setShowNewSubdomainDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Create New Subdomain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subdomain</DialogTitle>
              <DialogDescription>
                Create a new subdomain for your store. This will be used to access your store's API and storefront.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
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
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center">
                  <Input id="subdomain" placeholder="yourstore" className="rounded-r-none" />
                  <div className="flex h-10 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                    .hdkcm.com
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens are allowed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                <Input id="custom-domain" placeholder="store.yourdomain.com" />
                <p className="text-xs text-muted-foreground">
                  You'll need to configure DNS settings to point to our servers.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewSubdomainDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubdomain} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Subdomain"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
