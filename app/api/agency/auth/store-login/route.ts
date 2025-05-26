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

        // Find store by email
        const store = await prisma.store.findFirst({
            where: {
                user: {
                    email: email,
                },
            },
            select: {
                id: true,
                name: true,
                agencyId: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        password: true,
                        role: true,
                    },
                },
            },
        });

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
            password,
            store.user.password
        );
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = sign(
            {
                id: store.id,
                userId: store.user.id,
                email: store.user.email,
                type: "store",
                agencyId: store.agencyId,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        // Return success response with token
        return NextResponse.json({
            success: true,
            data: {
                token,
                store: {
                    id: store.id,
                    name: store.name,
                    email: store.user.email,
                },
            },
        });
    } catch (error) {
        console.error("Store login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
