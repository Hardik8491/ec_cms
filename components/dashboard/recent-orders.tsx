import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const orders = [
  {
    id: "ORD-001",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder-user.jpg",
      initials: "JD",
    },
    store: "Acme Store",
    amount: "$129.99",
    status: "completed",
    date: "2 hours ago",
  },
  {
    id: "ORD-002",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder-user.jpg",
      initials: "JS",
    },
    store: "Widget Co",
    amount: "$79.99",
    status: "processing",
    date: "5 hours ago",
  },
  {
    id: "ORD-003",
    customer: {
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/placeholder-user.jpg",
      initials: "MJ",
    },
    store: "Tech Haven",
    amount: "$249.99",
    status: "completed",
    date: "1 day ago",
  },
  {
    id: "ORD-004",
    customer: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      avatar: "/placeholder-user.jpg",
      initials: "SW",
    },
    store: "Fashion Forward",
    amount: "$89.99",
    status: "pending",
    date: "1 day ago",
  },
  {
    id: "ORD-005",
    customer: {
      name: "David Brown",
      email: "david@example.com",
      avatar: "/placeholder-user.jpg",
      initials: "DB",
    },
    store: "Home Essentials",
    amount: "$159.99",
    status: "completed",
    date: "2 days ago",
  },
]

export function RecentOrders() {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={order.customer.avatar || "/placeholder.svg"} alt={order.customer.name} />
              <AvatarFallback>{order.customer.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{order.customer.name}</p>
              <p className="text-sm text-muted-foreground">{order.store}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{order.amount}</p>
            <Badge
              variant={
                order.status === "completed" ? "default" : order.status === "processing" ? "secondary" : "outline"
              }
              className="text-xs"
            >
              {order.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
