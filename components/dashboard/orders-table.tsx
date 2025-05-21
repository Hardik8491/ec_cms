"use client"

import { useState } from "react"
import { Eye, MoreHorizontal } from "lucide-react"
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

const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    store: "Tech Haven",
    date: "2023-05-15",
    total: "$129.99",
    status: "COMPLETED",
    items: 2,
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    store: "Fashion Forward",
    date: "2023-05-16",
    total: "$79.99",
    status: "PROCESSING",
    items: 1,
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    store: "Home Essentials",
    date: "2023-05-16",
    total: "$249.99",
    status: "PENDING",
    items: 3,
  },
  {
    id: "ORD-004",
    customer: "Sarah Williams",
    store: "Tech Haven",
    date: "2023-05-17",
    total: "$89.99",
    status: "COMPLETED",
    items: 1,
  },
  {
    id: "ORD-005",
    customer: "David Brown",
    store: "Fashion Forward",
    date: "2023-05-17",
    total: "$159.99",
    status: "CANCELLED",
    items: 2,
  },
  {
    id: "ORD-006",
    customer: "Emily Davis",
    store: "Home Essentials",
    date: "2023-05-18",
    total: "$199.99",
    status: "PROCESSING",
    items: 4,
  },
  {
    id: "ORD-007",
    customer: "Michael Wilson",
    store: "Tech Haven",
    date: "2023-05-18",
    total: "$299.99",
    status: "COMPLETED",
    items: 2,
  },
  {
    id: "ORD-008",
    customer: "Jessica Taylor",
    store: "Fashion Forward",
    date: "2023-05-19",
    total: "$59.99",
    status: "PENDING",
    items: 1,
  },
]

interface OrdersTableProps {
  status?: string
}

export function OrdersTable({ status }: OrdersTableProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Filter orders by status if provided
  const filteredOrders = status ? orders.filter((order) => order.status === status) : orders

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Loading orders...
              </TableCell>
            </TableRow>
          ) : filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "COMPLETED"
                        ? "default"
                        : order.status === "PROCESSING"
                          ? "secondary"
                          : order.status === "PENDING"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {order.status.toLowerCase()}
                  </Badge>
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
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
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
