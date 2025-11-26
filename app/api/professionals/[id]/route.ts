import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { professionalSchema } from "@/lib/validations/professional";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const professional = await prisma.professional.findFirst({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
        });

        if (!professional) {
            return NextResponse.json({ error: "Professional not found" }, { status: 404 });
        }

        return NextResponse.json(professional);
    } catch (error) {
        console.error("Error fetching professional:", error);
        return NextResponse.json(
            { error: "Failed to fetch professional" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = professionalSchema.parse(body);

        const professional = await prisma.professional.updateMany({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            data: validatedData,
        });

        if (professional.count === 0) {
            return NextResponse.json({ error: "Professional not found" }, { status: 404 });
        }

        const updatedProfessional = await prisma.professional.findUnique({
            where: { id: id },
        });

        return NextResponse.json(updatedProfessional);
    } catch (error) {
        console.error("Error updating professional:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update professional" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Soft delete - set active to false
        await prisma.professional.updateMany({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            data: {
                active: false,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting professional:", error);
        return NextResponse.json(
            { error: "Failed to delete professional" },
            { status: 500 }
        );
    }
}
