import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { patientSchema } from "@/lib/validations/patient";

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

        const patient = await prisma.patient.findFirst({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json(patient);
    } catch (error) {
        console.error("Error fetching patient:", error);
        return NextResponse.json(
            { error: "Failed to fetch patient" },
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

        const body = await request.json();
        const validatedData = patientSchema.parse(body);

        const { id } = await params;
        const patient = await prisma.patient.updateMany({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            data: {
                ...validatedData,
                birthDate: validatedData.birthDate
                    ? new Date(validatedData.birthDate)
                    : null,
            },
        });

        if (patient.count === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const updatedPatient = await prisma.patient.findUnique({
            where: { id: id },
        });

        return NextResponse.json(updatedPatient);
    } catch (error) {
        console.error("Error updating patient:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update patient" },
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

        await prisma.patient.deleteMany({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting patient:", error);
        return NextResponse.json(
            { error: "Failed to delete patient" },
            { status: 500 }
        );
    }
}

