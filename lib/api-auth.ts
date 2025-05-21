import { prisma } from "@/lib/prisma"

type ApiKeyPermission = "read" | "write" | "full"

export async function validateApiKey(
  apiKey: string,
  storeId: string,
  requiredPermissions: ApiKeyPermission[] = ["read", "write", "full"],
) {
  try {
    // Find the API key in the database
    const key = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        storeId,
        status: "active",
      },
    })

    if (!key) {
      return null
    }

    // Check if the key has the required permissions
    if (!requiredPermissions.includes(key.permission as ApiKeyPermission)) {
      return null
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() },
    })

    return key
  } catch (error) {
    console.error("API key validation error:", error)
    return null
  }
}

export async function generateApiKey(storeId: string, name: string, permission: ApiKeyPermission = "read") {
  try {
    // Generate a random API key
    const key = `sk_${permission.substring(0, 4)}_${Math.random().toString(36).substring(2, 15)}${Math.random()
      .toString(36)
      .substring(2, 15)}`

    // Create the API key in the database
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        permission,
        store: {
          connect: { id: storeId },
        },
      },
    })

    return { ...apiKey, key }
  } catch (error) {
    console.error("API key generation error:", error)
    return null
  }
}

export async function revokeApiKey(apiKeyId: string) {
  try {
    // Update the API key status to inactive
    const apiKey = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { status: "inactive" },
    })

    return apiKey
  } catch (error) {
    console.error("API key revocation error:", error)
    return null
  }
}
