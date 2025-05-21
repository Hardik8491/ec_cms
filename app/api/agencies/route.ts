import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/agencies - Get all agencies (Super Admin only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const agencies = await prisma.agency.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                stores: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                subscription: true,
            },
        });

        return NextResponse.json(agencies);
    } catch (error) {
        console.error("Error fetching agencies:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/agencies - Create a new agency (Super Admin only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { name, slug, logo } = await request.json();

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Name and slug are required" },
                { status: 400 }
            );
        }

        // Check if agency with same slug exists
        const existingAgency = await prisma.agency.findUnique({
            where: { slug },
        });

        if (existingAgency) {
            return NextResponse.json(
                { error: "Agency with this slug already exists" },
                { status: 400 }
            );
        }

        const agency = await prisma.agency.create({
            data: {
                name,
                slug,
                logo,
            },
            include: {
                users: true,
                stores: true,
                subscription: true,
            },
        });

        return NextResponse.json(agency);
    } catch (error) {
        console.error("Error creating agency:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
