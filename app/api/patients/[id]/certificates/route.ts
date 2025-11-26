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

        const certificates = await prisma.medicalCertificate.findMany({
            where: {
                patientId: id,
                clinicId: session.user.clinicId,
            },
            include: {
                professional: {
                    select: {
                        name: true,
                        cro: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(certificates);
    } catch (error) {
        console.error("Error fetching certificates:", error);
        return NextResponse.json(
            { error: "Failed to fetch certificates" },
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

        // Get professional ID linked to the current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { professional: true },
        });

        if (!user?.professionalId) {
            return NextResponse.json(
                { error: "User is not linked to a professional profile" },
                { status: 400 }
            );
        }

        const certificate = await prisma.medicalCertificate.create({
            data: {
                description: body.description,
                startDate: new Date(body.startDate),
                days: parseInt(body.days),
                notes: body.notes,
                patientId: id,
                professionalId: user.professionalId,
                clinicId: session.user.clinicId,
            },
        });

        return NextResponse.json(certificate);
    } catch (error) {
        console.error("Error creating certificate:", error);
        return NextResponse.json(
            { error: "Failed to create certificate" },
            { status: 500 }
        );
    }
}
