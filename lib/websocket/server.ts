import type { Server as HTTPServer } from "http"
import { Server as WebSocketServer } from "socket.io"
import { PrismaClient } from "@prisma/client"
import { verifyJwtToken } from "@/lib/auth"

const prisma = new PrismaClient()

// Store active connections
const connections: Record<string, Set<string>> = {
  users: new Set(),
  stores: new Set(),
  agencies: new Set(),
}

export function initWebSocketServer(httpServer: HTTPServer) {
  const io = new WebSocketServer(httpServer, {
    path: "/api/ws",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = await verifyJwtToken(token)

      if (!decoded) {
        return next(new Error("Invalid token"))
      }

      // Attach user data to socket
      socket.data.user = decoded
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  // Connection handler
  io.on("connection", async (socket) => {
    const userId = socket.data.user.id

    // Add to connections
    connections.users.add(userId)

    console.log(`User connected: ${userId}`)

    // Join user-specific room
    socket.join(`user:${userId}`)

    // Get user's stores and agencies
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stores: true,
        agency: true,
      },
    })

    // Join store rooms
    if (user?.stores) {
      user.stores.forEach((store) => {
        socket.join(`store:${store.id}`)
        connections.stores.add(store.id)
      })
    }

    // Join agency room
    if (user?.agency) {
      socket.join(`agency:${user.agency.id}`)
      connections.agencies.add(user.agency.id)
    }

    // Handle client events
    socket.on("subscribe", (channel) => {
      // Validate if user has access to this channel
      if (channel.startsWith("store:")) {
        const storeId = channel.split(":")[1]
        const hasAccess = user?.stores.some((store) => store.id === storeId)

        if (hasAccess) {
          socket.join(channel)
          console.log(`User ${userId} subscribed to ${channel}`)
        }
      }
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      connections.users.delete(userId)
      console.log(`User disconnected: ${userId}`)
    })
  })

  return io
}

// Send notification to specific user
export async function notifyUser(userId: string, notification: any) {
  const io = global.socketIo

  if (!io) {
    console.error("WebSocket server not initialized")
    return
  }

  io.to(`user:${userId}`).emit("notification", notification)

  // Store notification in database
  await prisma.notification.create({
    data: {
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
    },
  })
}

// Send notification to all users in a store
export async function notifyStore(storeId: string, notification: any) {
  const io = global.socketIo

  if (!io) {
    console.error("WebSocket server not initialized")
    return
  }

  io.to(`store:${storeId}`).emit("notification", notification)

  // Store notification for all users in this store
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      user: true,
    },
  })

  if (store) {
    await prisma.notification.create({
      data: {
        userId: store.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
      },
    })
  }
}

// Send notification to all users in an agency
export async function notifyAgency(agencyId: string, notification: any) {
  const io = global.socketIo

  if (!io) {
    console.error("WebSocket server not initialized")
    return
  }

  io.to(`agency:${agencyId}`).emit("notification", notification)

  // Store notification for all users in this agency
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      user: true,
    },
  })

  if (agency) {
    await prisma.notification.create({
      data: {
        userId: agency.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
      },
    })
  }
}

// Send broadcast to all connected users
export function broadcastAll(event: string, data: any) {
  const io = global.socketIo

  if (!io) {
    console.error("WebSocket server not initialized")
    return
  }

  io.emit(event, data)
}

// Get active connections count
export function getConnectionsCount() {
  return {
    users: connections.users.size,
    stores: connections.stores.size,
    agencies: connections.agencies.size,
  }
}
