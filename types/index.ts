import { Store, Product, Order, Customer } from "@prisma/client"

export type StoreWithStats = Store & {
  _count: {
    products: number
    orders: number
    customers: number
  }
}

export type OrderWithCustomer = Order & {
  customer: Customer
}