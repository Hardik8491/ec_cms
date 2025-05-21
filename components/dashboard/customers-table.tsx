"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, Trash } from "lucide-react"
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

const customers = [
  {
    id: "cust-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    orders: 5,
    totalSpent: "$649.95",
    store: "Tech Haven",
  },
  {
    id: "cust-002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 234-5678",
    orders: 3,
    totalSpent: "$239.97",
    store: "Fashion Forward",
  },
  {
    id: "cust-003",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1 (555) 345-6789",
    orders: 8,
    totalSpent: "$1,999.92",
    store: "Home Essentials",
  },
  {
    id: "cust-004",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+1 (555) 456-7890",
    orders: 2,
    totalSpent: "$179.98",
    store: "Tech Haven",
  },
  {
    id: "cust-005",
    name: "David Brown",
    email: "david@example.com",
    phone: "+1 (555) 567-8901",
    orders: 6,
    totalSpent: "$959.94",
    store: "Fashion Forward",
  },
  {
    id: "cust-006",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 (555) 678-9012",
    orders: 4,
    totalSpent: "$799.96",
    store: "Home Essentials",
  },
  {
    id: "cust-007",
    name: "Michael Wilson",
    email: "michael@example.com",
    phone: "+1 (555) 789-0123",
    orders: 7,
    totalSpent: "$2,099.93",
    store: "Tech Haven",
  },
  {
    id: "cust-008",
    name: "Jessica Taylor",
    email: "jessica@example.com",
    phone: "+1 (555) 890-1234",
    orders: 1,
    totalSpent: "$59.99",
    store: "Fashion Forward",
  },
]

export function CustomersTable() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Store</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Loading customers...
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell>{customer.totalSpent}</TableCell>
                <TableCell>{customer.store}</TableCell>
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
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
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
