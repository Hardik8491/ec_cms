import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find agency by email
        const agency = await prisma.agency.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                status: true,
            },
        });

        if (!agency) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Check if agency is active
        if (agency.status !== "ACTIVE") {
            return NextResponse.json(
                { error: "Account is not active" },
                { status: 403 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, agency.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = sign(
            {
                id: agency.id,
                email: agency.email,
                type: "agency",
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        // Return success response with token
        return NextResponse.json({
            success: true,
            data: {
                token,
                agency: {
                    id: agency.id,
                    email: agency.email,
                    name: agency.name,
                },
            },
        });
    } catch (error) {
        console.error("Agency login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
