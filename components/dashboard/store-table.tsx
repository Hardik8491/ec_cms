import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const stores = [
  {
    id: "store-001",
    name: "Acme Store",
    owner: "John Doe",
    revenue: "$12,234.56",
    status: "active",
    products: 234,
    orders: 1245,
  },
  {
    id: "store-002",
    name: "Widget Co",
    owner: "Jane Smith",
    revenue: "$9,876.54",
    status: "active",
    products: 187,
    orders: 876,
  },
  {
    id: "store-003",
    name: "Tech Haven",
    owner: "Mike Johnson",
    revenue: "$8,765.43",
    status: "active",
    products: 156,
    orders: 765,
  },
  {
    id: "store-004",
    name: "Fashion Forward",
    owner: "Sarah Williams",
    revenue: "$7,654.32",
    status: "active",
    products: 321,
    orders: 543,
  },
  {
    id: "store-005",
    name: "Home Essentials",
    owner: "David Brown",
    revenue: "$6,543.21",
    status: "inactive",
    products: 98,
    orders: 432,
  },
]

export function StoreTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Store</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stores.map((store) => (
          <TableRow key={store.id}>
            <TableCell className="font-medium">{store.name}</TableCell>
            <TableCell>{store.owner}</TableCell>
            <TableCell>
              <Badge variant={store.status === "active" ? "default" : "secondary"}>{store.status}</Badge>
            </TableCell>
            <TableCell className="text-right">{store.revenue}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
