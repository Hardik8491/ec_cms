"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    sales: 4000,
    orders: 240,
  },
  {
    name: "Feb",
    sales: 3000,
    orders: 198,
  },
  {
    name: "Mar",
    sales: 2000,
    orders: 980,
  },
  {
    name: "Apr",
    sales: 2780,
    orders: 308,
  },
  {
    name: "May",
    sales: 1890,
    orders: 480,
  },
  {
    name: "Jun",
    sales: 2390,
    orders: 380,
  },
  {
    name: "Jul",
    sales: 3490,
    orders: 430,
  },
  {
    name: "Aug",
    sales: 4000,
    orders: 240,
  },
  {
    name: "Sep",
    sales: 3000,
    orders: 198,
  },
  {
    name: "Oct",
    sales: 2000,
    orders: 980,
  },
  {
    name: "Nov",
    sales: 2780,
    orders: 308,
  },
  {
    name: "Dec",
    sales: 1890,
    orders: 480,
  },
]

export function AnalyticsChart() {
  const { theme } = useTheme()

  const isDark = theme === "dark"
  const textColor = isDark ? "#f8fafc" : "#0f172a"
  const gridColor = isDark ? "#334155" : "#e2e8f0"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="sales" name="Sales ($)" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="orders" name="Orders" fill="#4ade80" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
