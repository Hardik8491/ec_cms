import { NextResponse } from "next/server"
import { createAdminUser, createAgencyUser, registerUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    let user

    switch (role) {
      case "admin":
        // Only allow admin creation in development or with special token
        if (
          process.env.NODE_ENV !== "development" &&
          request.headers.get("x-admin-token") !== process.env.ADMIN_SECRET
        ) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        user = await createAdminUser({ name, email, password })
        break
      case "agency":
        user = await createAgencyUser({ name, email, password })
        break
      default:
        user = await registerUser({ name, email, password })
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 500 })
  }
}
