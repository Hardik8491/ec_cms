import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AgencyService } from "@/services/agency-service";
import { z } from "zod";

const updateAgencySchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    logo: z.string().url().optional().nullable(),
    website: z.string().url().optional().nullable(),
    subdomain: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
    userId: z.string().optional(),
    aiEnabled: z.boolean().optional(),
    aiCredits: z.number().min(0).optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = updateAgencySchema.parse(body);

        if (validatedData.subdomain) {
            const existingAgency = await AgencyService.getAgencyBySubdomain(
                validatedData.subdomain
            );
            if (existingAgency && existingAgency.id !== params.id) {
                return NextResponse.json(
                    { error: "Subdomain is already in use" },
                    { status: 400 }
                );
            }
        }

        const updatedAgency = await AgencyService.updateAgency(
            params.id,
            validatedData
        );

        return NextResponse.json(updatedAgency);
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

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await AgencyService.deleteAgency(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
