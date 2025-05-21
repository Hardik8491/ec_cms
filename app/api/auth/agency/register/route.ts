import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const { name, email, password, phone, website } = await req.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if agency already exists
        const existingAgency = await prisma.agency.findFirst({
            where: {
                OR: [{ email }, { name }],
            },
        });

        if (existingAgency) {
            return NextResponse.json(
                { error: "Agency with this email or name already exists" },
                { status: 400 }
            );
        }

        // Create agency
        const agency = await prisma.agency.create({
            data: {
                name,
                email,
                phone,
                website,
                slug: generateSlug(name),
                status: "ACTIVE",
                users: {
                    create: {
                        email,
                        name,
                        password: await hash(password, 12),
                        role: "AGENCY_ADMIN",
                    },
                },
            },
            include: {
                users: true,
            },
        });

        return NextResponse.json({
            message: "Agency registered successfully",
            agency: {
                id: agency.id,
                name: agency.name,
                email: agency.email,
            },
        });
    } catch (error) {
        console.error("Agency registration error:", error);
        return NextResponse.json(
            { error: "Failed to register agency" },
            { status: 500 }
        );
    }
}
