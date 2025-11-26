import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const anamnesis = await prisma.anamnesis.findFirst({
            where: {
                patientId: id,
                patient: {
                    clinicId: session.user.clinicId,
                },
            },
        });

        return NextResponse.json(anamnesis || {});
    } catch (error) {
        console.error("Error fetching anamnesis:", error);
        return NextResponse.json(
            { error: "Failed to fetch anamnesis" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id } = await params;

        // Check if anamnesis already exists
        const existingAnamnesis = await prisma.anamnesis.findFirst({
            where: {
                patientId: id,
            },
        });

        let anamnesis;

        if (existingAnamnesis) {
            // Update existing
            anamnesis = await prisma.anamnesis.update({
                where: { id: existingAnamnesis.id },
                data: {
                    ...body,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Create new
            anamnesis = await prisma.anamnesis.create({
                data: {
                    ...body,
                    patientId: id,
                },
            });
        }

        return NextResponse.json(anamnesis);
    } catch (error) {
        console.error("Error saving anamnesis:", error);
        return NextResponse.json(
            { error: "Failed to save anamnesis" },
            { status: 500 }
        );
    }
}
