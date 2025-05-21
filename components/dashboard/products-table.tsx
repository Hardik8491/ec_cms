"use client"

import { useState } from "react"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const products = [
  {
    id: "prod-001",
    name: "Premium Headphones",
    price: "$129.99",
    category: "Electronics",
    inventory: 45,
    store: "Tech Haven",
  },
  {
    id: "prod-002",
    name: "Organic Cotton T-Shirt",
    price: "$24.99",
    category: "Apparel",
    inventory: 120,
    store: "Fashion Forward",
  },
  {
    id: "prod-003",
    name: "Stainless Steel Water Bottle",
    price: "$19.99",
    category: "Home Goods",
    inventory: 78,
    store: "Home Essentials",
  },
  {
    id: "prod-004",
    name: "Wireless Charging Pad",
    price: "$34.99",
    category: "Electronics",
    inventory: 32,
    store: "Tech Haven",
  },
  {
    id: "prod-005",
    name: "Leather Wallet",
    price: "$49.99",
    category: "Accessories",
    inventory: 65,
    store: "Fashion Forward",
  },
  {
    id: "prod-006",
    name: "Smart LED Bulb",
    price: "$15.99",
    category: "Home Goods",
    inventory: 0,
    store: "Home Essentials",
  },
  {
    id: "prod-007",
    name: "Bluetooth Speaker",
    price: "$79.99",
    category: "Electronics",
    inventory: 23,
    store: "Tech Haven",
  },
  {
    id: "prod-008",
    name: "Yoga Mat",
    price: "$29.99",
    category: "Fitness",
    inventory: 42,
    store: "Active Life",
  },
]

export function ProductsTable() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Store</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Loading products...
              </TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  {product.inventory === 0 ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : product.inventory < 30 ? (
                    <Badge variant="secondary">Low Stock: {product.inventory}</Badge>
                  ) : (
                    product.inventory
                  )}
                </TableCell>
                <TableCell>{product.store}</TableCell>
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
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
