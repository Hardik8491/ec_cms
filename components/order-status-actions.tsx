"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderStatusActionsProps {
  orderId: string
  storeId: string
  currentStatus: string
}

export function OrderStatusActions({ orderId, storeId, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const updateOrderStatus = async (status: string) => {
    if (status === currentStatus) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/agency/stores/${storeId}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ]

  const currentStatusLabel = statusOptions.find((option) => option.value === currentStatus)?.label || "Update Status"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating
            </>
          ) : (
            <>
              {currentStatusLabel} <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => updateOrderStatus(option.value)}
            disabled={option.value === currentStatus}
            className={option.value === currentStatus ? "bg-muted" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
