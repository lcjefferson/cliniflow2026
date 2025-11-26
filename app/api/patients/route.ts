import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { patientSchema } from "@/lib/validations/patient";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const patients = await prisma.patient.findMany({
            where: {
                clinicId: session.user.clinicId,
                active: true,
                ...(search && {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                        { phone: { contains: search } },
                        { cpf: { contains: search } },
                    ],
                }),
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(patients);
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Failed to fetch patients" },
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
        const validatedData = patientSchema.parse(body);

        const patient = await prisma.patient.create({
            data: {
                ...validatedData,
                birthDate: validatedData.birthDate
                    ? new Date(validatedData.birthDate)
                    : null,
                clinicId: session.user.clinicId,
            },
        });

        return NextResponse.json(patient, { status: 201 });
    } catch (error) {
        console.error("Error creating patient:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create patient" },
            { status: 500 }
        );
    }
}
