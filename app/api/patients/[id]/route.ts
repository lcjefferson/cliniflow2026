import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const patient = await prisma.patient.findFirst({
            where: { id, clinicId: session.user.clinicId },
        });
        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }
        return NextResponse.json(patient);
    } catch (error) {
        console.error("Error fetching patient:", error);
        return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;

        const updated = await prisma.patient.updateMany({
            where: { id, clinicId: session.user.clinicId },
            data: { active: false },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting patient:", error);
        return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
    }
}

