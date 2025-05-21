import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Define validation schema
const checkRoleSchema = z.object({
    email: z.string().email("Invalid email format"),
});

export async function POST(request: Request) {
    console.log("[check-role] Received request to check user role");

    try {
        // Parse and validate request body
        const body = await request.json();
        console.log("[check-role] Request body:", { email: body.email });

        const validationResult = checkRoleSchema.safeParse(body);
        if (!validationResult.success) {
            console.error(
                "[check-role] Validation error:",
                validationResult.error
            );
            return NextResponse.json(
                {
                    error: "Invalid request data",
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        const { email } = validationResult.data;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                role: true,
                id: true,
                name: true,
            },
        });

        if (!user) {
            console.log("[check-role] User not found:", email);
            return NextResponse.json(
                {
                    error: "User not found",
                    message: "No user exists with the provided email address",
                },
                { status: 404 }
            );
        }

        console.log("[check-role] User found:", {
            id: user.id,
            name: user.name,
            role: user.role,
        });

        return NextResponse.json({
            role: user.role,
            message: "Role retrieved successfully",
        });
    } catch (error) {
        // Handle specific error types
        if (error instanceof z.ZodError) {
            console.error("[check-role] Zod validation error:", error);
            return NextResponse.json(
                {
                    error: "Validation error",
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            console.error("[check-role] Error:", {
                message: error.message,
                stack: error.stack,
            });
            return NextResponse.json(
                {
                    error: "Internal server error",
                    message:
                        "An unexpected error occurred while checking user role",
                },
                { status: 500 }
            );
        }

        // Handle unknown errors
        console.error("[check-role] Unknown error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
