import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

type RegisterUserParams = {
  name: string
  email: string
  password: string
  role?: string
}

export async function registerUser({ name, email, password, role = "user" }: RegisterUserParams) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  })

  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export async function createAdminUser({ name, email, password }: RegisterUserParams) {
  return registerUser({ name, email, password, role: "admin" })
}

export async function createAgencyUser({ name, email, password }: RegisterUserParams) {
  const user = await registerUser({ name, email, password, role: "agency" })

  // Create agency for the user
  await prisma.agency.create({
    data: {
      name: `${name}'s Agency`,
      userId: user.id,
    },
  })

  return user
}

export async function generateApiKey(userId: string, storeId?: string, permissions: string[] = ["read"]) {
  const key = `sk_${crypto.randomBytes(24).toString("hex")}`

  const apiKey = await prisma.apiKey.create({
    data: {
      name: storeId ? "Store API Key" : "User API Key",
      key,
      userId,
      storeId,
      permissions: permissions,
    },
  })

  return apiKey
}

export async function validateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: {
      user: true,
      store: true,
    },
  })

  if (!apiKey || !apiKey.isActive) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  })

  return apiKey
}
