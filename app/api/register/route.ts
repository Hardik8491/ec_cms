import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { z } from "zod"

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agencyName: z.string().optional(),
  agencySubdomain: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  agencyDescription: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = userSchema.parse(json)

    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Get the user role
    let roleId: string
    let agencyId: string | null = null

    // Check if this is an agency registration
    if (body.agencyName && body.agencySubdomain) {
      // Check if subdomain is already taken
      const existingAgency = await db.agency.findUnique({
        where: { subdomain: body.agencySubdomain },
      })

      if (existingAgency) {
        return NextResponse.json({ error: "Subdomain is already taken" }, { status: 400 })
      }

      // Get agency role
      const agencyRole = await db.role.findUnique({
        where: { name: "agency" },
      })

      if (!agencyRole) {
        return NextResponse.json({ error: "Agency role not found" }, { status: 500 })
      }

      roleId = agencyRole.id

      // Create the agency
      const agency = await db.agency.create({
        data: {
          name: body.agencyName,
          subdomain: body.agencySubdomain,
          description: body.agencyDescription || "",
          isApproved: false, // Requires admin approval
        },
      })

      agencyId = agency.id
    } else {
      // Regular user registration
      const userRole = await db.role.findUnique({
        where: { name: "user" },
      })

      if (!userRole) {
        return NextResponse.json({ error: "User role not found" }, { status: 500 })
      }

      roleId = userRole.id
    }

    // Hash the password
    const hashedPassword = await hash(body.password, 10)

    // Create the user
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        roleId,
        agencyId,
      },
    })

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: agencyId ? "Agency registered successfully. Awaiting admin approval." : "User registered successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
