"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    total: 4000,
    subscription: 2400,
  },
  {
    name: "Feb",
    total: 3000,
    subscription: 1398,
  },
  {
    name: "Mar",
    total: 2000,
    subscription: 9800,
  },
  {
    name: "Apr",
    total: 2780,
    subscription: 3908,
  },
  {
    name: "May",
    total: 1890,
    subscription: 4800,
  },
  {
    name: "Jun",
    total: 2390,
    subscription: 3800,
  },
  {
    name: "Jul",
    total: 3490,
    subscription: 4300,
  },
  {
    name: "Aug",
    total: 4000,
    subscription: 2400,
  },
  {
    name: "Sep",
    total: 3000,
    subscription: 1398,
  },
  {
    name: "Oct",
    total: 2000,
    subscription: 9800,
  },
  {
    name: "Nov",
    total: 2780,
    subscription: 3908,
  },
  {
    name: "Dec",
    total: 1890,
    subscription: 4800,
  },
]

export function RevenueChart() {
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
        <Bar dataKey="total" name="Total Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="subscription" name="Subscription Revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
