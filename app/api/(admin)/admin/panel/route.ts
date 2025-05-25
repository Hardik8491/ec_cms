import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AdminJS from "adminjs"
import express from "express"
import { getAdminJsOptions } from "@/lib/adminjs"
import { buildAuthenticatedRouter } from "@adminjs/express"
import { createServer } from "http"

let adminJs: AdminJS
let serverStarted = false

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (!serverStarted) {
    const app = express()

    // Initialize AdminJS
    const adminJsOptions = await getAdminJsOptions()
    adminJs = new AdminJS(adminJsOptions)

    // Build and use AdminJS router
    const router = buildAuthenticatedRouter(
      adminJs,
      {
        authenticate: async (email, password) => {
          // This is handled by NextAuth, we just need to verify the session
          return { email: session.user.email }
        },
        cookiePassword: process.env.ADMINJS_COOKIE_SECRET || "complex-secret-for-cookies",
      },
      null,
      {
        resave: false,
        saveUninitialized: true,
      },
    )

    app.use(adminJs.options.rootPath, router)

    // Start the server
    const server = createServer(app)
    server.listen(3001, () => {
      console.log(`AdminJS started on http://localhost:3001${adminJs.options.rootPath}`)
      serverStarted = true
    })
  }

  // Redirect to AdminJS panel
  return NextResponse.redirect(new URL("/admin/panel", request.url))
}
