import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

    const logs = await prisma.activityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ logs });
}
