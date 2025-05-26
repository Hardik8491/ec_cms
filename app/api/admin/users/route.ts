import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminService } from "@/services/admin-service";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["ADMIN", "AGENCY_OWNER", "STORE_OWNER", "USER"]),
    agencyId: z.string().optional().nullable(),
    password: z.string().min(8),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = createUserSchema.parse(body);

        // Hash the password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const newUser = await AdminService.createUser({
            ...validatedData,
            password: hashedPassword,
        });

        return NextResponse.json(newUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
