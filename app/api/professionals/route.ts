import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { professionalSchema } from "@/lib/validations/professional";

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const professionals = await prisma.professional.findMany({
            where: {
                clinicId: session.user.clinicId,
                active: true,
            },
            select: {
                id: true,
                name: true,
                specialty: true,
                cro: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(professionals);
    } catch (error) {
        console.error("Error fetching professionals:", error);
        return NextResponse.json(
            { error: "Failed to fetch professionals" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = professionalSchema.parse(body);

        const professional = await prisma.professional.create({
            data: {
                ...validatedData,
                clinicId: session.user.clinicId,
            },
        });

        return NextResponse.json(professional, { status: 201 });
    } catch (error) {
        console.error("Error creating professional:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create professional" },
            { status: 500 }
        );
    }
}
