import AdminJS from "adminjs"
import { Database, Resource } from "@adminjs/prisma"
import { PrismaClient } from "@prisma/client"
import type { DMMFClass } from "@prisma/client/runtime"
import { componentLoader } from "./components"

// Register Prisma adapter
AdminJS.registerAdapter({
  Resource,
  Database,
})

const prisma = new PrismaClient()
const dmmf = (prisma as any)._baseDmmf as DMMFClass

export const getAdminJsOptions = async () => {
  return {
    rootPath: "/admin/panel",
    loginPath: "/admin/panel/login",
    logoutPath: "/admin/panel/logout",
    dashboard: {
      component: componentLoader.resolveComponent("Dashboard"),
    },
    branding: {
      companyName: "E-commerce CRM",
      logo: "/logo.png",
      favicon: "/favicon.ico",
      withMadeWithLove: false,
    },
    resources: [
      {
        resource: { model: dmmf.modelMap.User, client: prisma },
        options: {
          navigation: {
            name: "User Management",
            icon: "User",
          },
          properties: {
            password: {
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
              type: "password",
            },
          },
          actions: {
            new: {
              before: async (request: any) => {
                if (request.payload.password) {
                  const bcrypt = require("bcryptjs")
                  request.payload.password = await bcrypt.hash(request.payload.password, 10)
                }
                return request
              },
            },
            edit: {
              before: async (request: any) => {
                if (request.payload.password) {
                  const bcrypt = require("bcryptjs")
                  request.payload.password = await bcrypt.hash(request.payload.password, 10)
                }
                return request
              },
            },
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Agency, client: prisma },
        options: {
          navigation: {
            name: "Agency Management",
            icon: "Building",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Vendor, client: prisma },
        options: {
          navigation: {
            name: "Marketplace",
            icon: "ShoppingBag",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Store, client: prisma },
        options: {
          navigation: {
            name: "Store Management",
            icon: "Store",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Product, client: prisma },
        options: {
          navigation: {
            name: "Product Management",
            icon: "Package",
          },
          properties: {
            description: {
              type: "textarea",
            },
            images: {
              components: {
                list: componentLoader.resolveComponent("ImagesList"),
                show: componentLoader.resolveComponent("ImagesShow"),
                edit: componentLoader.resolveComponent("ImagesEdit"),
              },
            },
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Category, client: prisma },
        options: {
          navigation: {
            name: "Product Management",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Order, client: prisma },
        options: {
          navigation: {
            name: "Order Management",
            icon: "ShoppingCart",
          },
          properties: {
            shippingAddress: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: true,
              },
              components: {
                show: componentLoader.resolveComponent("JsonView"),
                edit: componentLoader.resolveComponent("JsonEdit"),
              },
            },
            billingAddress: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: true,
              },
              components: {
                show: componentLoader.resolveComponent("JsonView"),
                edit: componentLoader.resolveComponent("JsonEdit"),
              },
            },
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Customer, client: prisma },
        options: {
          navigation: {
            name: "Customer Management",
            icon: "Users",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Payout, client: prisma },
        options: {
          navigation: {
            name: "Marketplace",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Review, client: prisma },
        options: {
          navigation: {
            name: "Product Management",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.ApiKey, client: prisma },
        options: {
          navigation: {
            name: "API Management",
            icon: "Key",
          },
        },
      },
      {
        resource: { model: dmmf.modelMap.Analytics, client: prisma },
        options: {
          navigation: {
            name: "Analytics",
            icon: "BarChart",
          },
        },
      },
    ],
  }
}
