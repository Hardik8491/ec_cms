import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { hash } from "bcryptjs";

const storeSchema = z.object({
    name: z.string().min(2, "Store name must be at least 2 characters"),
    slug: z
        .string()
        .min(2, "Store slug must be at least 2 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Store slug can only contain lowercase letters, numbers, and hyphens"
        ),
    description: z.string().optional(),
    currency: z.string().default("USD"),
    userEmail: z.string().email("Invalid email format"),
    userName: z.string().min(2, "Name must be at least 2 characters"),
    userPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const stores = await prisma.store.findMany({
            where: {
                agencyId: session.user.agencyId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(stores);
    } catch (error) {
        console.error("Error fetching stores:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validationResult = storeSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid request data",
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        const {
            name,
            slug,
            description,
            currency,
            userEmail,
            userName,
            userPassword,
        } = validationResult.data;

        // Check if store slug already exists
        const existingStore = await prisma.store.findUnique({
            where: { slug },
        });

        if (existingStore) {
            return NextResponse.json(
                {
                    error: "Store slug already exists",
                    message: "A store with this slug already exists",
                },
                { status: 409 }
            );
        }

        // Check if user email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    error: "User email already exists",
                    message: "A user with this email already exists",
                },
                { status: 409 }
            );
        }

        // Create store and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create store
            const store = await tx.store.create({
                data: {
                    name,
                    slug,
                    description,
                    currency,
                    agencyId: session.user.agencyId!,
                },
            });

            // Hash password
            const hashedPassword = await hash(userPassword, 12);

            // Create user
            const user = await tx.user.create({
                data: {
                    name: userName,
                    email: userEmail,
                    password: hashedPassword,
                    role: "AGENCY_USER",
                    agencyId: session.user.agencyId!,
                    stores: {
                        connect: { id: store.id },
                    },
                },
            });

            return { store, user };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error creating store:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
