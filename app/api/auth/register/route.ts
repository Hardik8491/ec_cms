import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

// Define validation schema
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
    agencyName: z.string().min(2, "Agency name must be at least 2 characters"),
    agencySlug: z
        .string()
        .min(2, "Agency slug must be at least 2 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Agency slug can only contain lowercase letters, numbers, and hyphens"
        ),
});

export async function POST(request: Request) {
    console.log("[register] Received registration request");

    try {
        // Parse and validate request body
        const body = await request.json();
        console.log("[register] Request body:", {
            email: body.email,
            agencyName: body.agencyName,
            agencySlug: body.agencySlug,
        });

        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            console.error(
                "[register] Validation error:",
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

        const { name, email, password, agencyName, agencySlug } =
            validationResult.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("[register] User already exists:", email);
            return NextResponse.json(
                {
                    error: "User already exists",
                    message: "A user with this email already exists",
                },
                { status: 409 }
            );
        }

        // Check if agency slug already exists
        const existingAgency = await prisma.agency.findUnique({
            where: { slug: agencySlug },
        });

        if (existingAgency) {
            console.log("[register] Agency slug already exists:", agencySlug);
            return NextResponse.json(
                {
                    error: "Agency slug already exists",
                    message: "An agency with this slug already exists",
                },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create agency and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create agency
            const agency = await tx.agency.create({
                data: {
                    name: agencyName,
                    slug: agencySlug,
                },
            });

            // Create user
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "AGENCY_ADMIN", // Set as agency admin
                    agencyId: agency.id,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });

            return { agency, user };
        });

        console.log("[register] Agency and user created successfully:", {
            agencyId: result.agency.id,
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role,
        });

        return NextResponse.json(
            {
                message: "Agency and user registered successfully",
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                },
                agency: {
                    id: result.agency.id,
                    name: result.agency.name,
                    slug: result.agency.slug,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        // Handle specific error types
        if (error instanceof z.ZodError) {
            console.error("[register] Zod validation error:", error);
            return NextResponse.json(
                {
                    error: "Validation error",
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            console.error("[register] Error:", {
                message: error.message,
                stack: error.stack,
            });
            return NextResponse.json(
                {
                    error: "Internal server error",
                    message: "An unexpected error occurred during registration",
                },
                { status: 500 }
            );
        }

        // Handle unknown errors
        console.error("[register] Unknown error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
