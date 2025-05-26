"use client"

import { useEffect, useState } from "react"
import { ApiClient } from "adminjs"
import { Box, H2, H4, Text, Card, Illustration } from "@adminjs/design-system"
import { Chart } from "react-google-charts"

const api = new ApiClient()

const Dashboard = () => {
  const [data, setData] = useState({
    users: 0,
    stores: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    recentOrders: [],
    salesData: [],
  })

  useEffect(() => {
    api.getDashboard().then((response) => {
      setData(response.data)
    })
  }, [])

  return (
    <Box>
      <Box position="relative" overflow="hidden">
        <Box bg="white" p="x3" mb="x3">
          <H2>Dashboard</H2>
          <Text>Welcome to the E-commerce CRM Admin Panel</Text>
        </Box>
      </Box>

      <Box display="flex" flexDirection={["column", "row"]} flexWrap="wrap">
        <Card width={[1, 1 / 2, 1 / 4]} m="x2">
          <Text textAlign="center">
            <Illustration variant="Planet" width={100} height={100} />
            <H4>Users</H4>
            <Text fontSize="xxl" fontWeight="bold">
              {data.users}
            </Text>
          </Text>
        </Card>
        <Card width={[1, 1 / 2, 1 / 4]} m="x2">
          <Text textAlign="center">
            <Illustration variant="DocumentCheck" width={100} height={100} />
            <H4>Stores</H4>
            <Text fontSize="xxl" fontWeight="bold">
              {data.stores}
            </Text>
          </Text>
        </Card>
        <Card width={[1, 1 / 2, 1 / 4]} m="x2">
          <Text textAlign="center">
            <Illustration variant="DocumentSearch" width={100} height={100} />
            <H4>Products</H4>
            <Text fontSize="xxl" fontWeight="bold">
              {data.products}
            </Text>
          </Text>
        </Card>
        <Card width={[1, 1 / 2, 1 / 4]} m="x2">
          <Text textAlign="center">
            <Illustration variant="Folders" width={100} height={100} />
            <H4>Orders</H4>
            <Text fontSize="xxl" fontWeight="bold">
              {data.orders}
            </Text>
          </Text>
        </Card>
      </Box>

      <Box display="flex" flexDirection={["column", "row"]} flexWrap="wrap">
        <Card width={[1, 1 / 2]} m="x2">
          <Box p="x2">
            <H4>Revenue Overview</H4>
            {data.salesData.length > 0 ? (
              <Chart
                width={"100%"}
                height={"300px"}
                chartType="LineChart"
                loader={<div>Loading Chart</div>}
                data={data.salesData}
                options={{
                  hAxis: {
                    title: "Date",
                  },
                  vAxis: {
                    title: "Revenue",
                  },
                  series: {
                    0: { curveType: "function" },
                  },
                }}
              />
            ) : (
              <Box textAlign="center" p="x3">
                <Illustration variant="DocumentSearch" width={100} height={100} />
                <Text>No revenue data available</Text>
              </Box>
            )}
          </Box>
        </Card>
        <Card width={[1, 1 / 2]} m="x2">
          <Box p="x2">
            <H4>Recent Orders</H4>
            {data.recentOrders.length > 0 ? (
              <Box>
                {data.recentOrders.map((order: any) => (
                  <Box key={order.id} p="x2" mb="x2" border="default">
                    <Text fontWeight="bold">#{order.orderNumber}</Text>
                    <Text>{order.customer?.name || "Guest"}</Text>
                    <Text>
                      ${order.total.toFixed(2)} - {order.status}
                    </Text>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" p="x3">
                <Illustration variant="DocumentSearch" width={100} height={100} />
                <Text>No recent orders</Text>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  )
}

export default Dashboard
