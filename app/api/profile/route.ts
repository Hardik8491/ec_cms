import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            // phone: true,
            // address: true,
            // city: true,
            // state: true,
            // postalCode: true,
            // country: true,
            preferences: true,
            createdAt: true,
            lastActive: true,
        },
    });

    if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
            name: body.name,
            email: body.email,
            phone: body.phone,
            // address: body.address,
            // city: body.city,
            // state: body.state,
            // postalCode: body.postalCode,
            // country: body.country,
        },
    });

    return NextResponse.json(updatedUser);
}
