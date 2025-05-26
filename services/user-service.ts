import { prisma } from "@/lib/db";

export const UserService = {
  // ... existing functions ...

  async getUsersForAgencyAssignment() {
    return await prisma.user.findMany({
      where: {
        role: {
          in: ["admin", "agency"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async getUsersForStoreAssignment() {
    return await prisma.user.findMany({
      where: {
        role: {
          in: ["admin", "agency"], // Adjust roles as needed
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },
};
