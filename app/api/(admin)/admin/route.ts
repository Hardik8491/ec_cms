import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_SECRET_PIN = process.env.ADMIN_SECRET_PIN!;
const ADMIN_SECRET_PASSWORD = process.env.ADMIN_SECRET_PASSWORD!;

interface RequestBody {
  pin: string;
  password: string;
  newRole: string;
}

export async function PUT(req: NextRequest) {
  try {
    // Create mock req/res for session
    const session = await getServerSession(authOptions);

    // Validate session and role
    if (!session || session.user?.role === "agency") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: RequestBody = await req.json();
    const { pin, password, newRole } = body;
    console.log(pin, password);

    // Validate pin and password
    if (pin !== ADMIN_SECRET_PIN || password !== ADMIN_SECRET_PASSWORD) {
      return NextResponse.json(
        { message: "Invalid PIN or password" },
        { status: 401 }
      );
    }

    // Update user role in DB
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id as string },
      data: { role: newRole },
    });

    return NextResponse.json(
      { message: "User role updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
