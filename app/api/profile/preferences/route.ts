import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prefs = await req.json();

    const updated = await prisma.user.update({
        where: { email: session.user.email },
        data: {
            preferences: prefs,
        },
    });

    return NextResponse.json({ success: true, updated });
}
