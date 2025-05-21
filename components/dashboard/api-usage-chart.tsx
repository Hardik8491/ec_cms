"use client"

import { useTheme } from "next-themes"
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

const data = [
  { date: "2023-05-01", products: 4200, orders: 2400, customers: 1800 },
  { date: "2023-05-02", products: 3800, orders: 1398, customers: 2800 },
  { date: "2023-05-03", products: 5000, orders: 9800, customers: 2200 },
  { date: "2023-05-04", products: 2780, orders: 3908, customers: 1908 },
  { date: "2023-05-05", products: 1890, orders: 4800, customers: 2800 },
  { date: "2023-05-06", products: 2390, orders: 3800, customers: 2400 },
  { date: "2023-05-07", products: 3490, orders: 4300, customers: 2100 },
  { date: "2023-05-08", products: 3490, orders: 4300, customers: 2100 },
  { date: "2023-05-09", products: 2490, orders: 3300, customers: 1800 },
  { date: "2023-05-10", products: 2990, orders: 4100, customers: 2400 },
  { date: "2023-05-11", products: 3490, orders: 3800, customers: 2200 },
  { date: "2023-05-12", products: 4490, orders: 4100, customers: 2500 },
  { date: "2023-05-13", products: 5490, orders: 4500, customers: 2800 },
  { date: "2023-05-14", products: 4490, orders: 4100, customers: 2600 },
]

export function ApiUsageChart() {
  const { theme } = useTheme()

  const isDark = theme === "dark"
  const textColor = isDark ? "#f8fafc" : "#0f172a"
  const gridColor = isDark ? "#334155" : "#e2e8f0"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
        />
        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="products" name="Products API" stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="orders" name="Orders API" stroke="#4ade80" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="customers" name="Customers API" stroke="#f97316" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
