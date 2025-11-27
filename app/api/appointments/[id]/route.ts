import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations/appointment";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const appointment = await prisma.appointment.findFirst({
            where: { id, clinicId: session.user.clinicId },
            include: {
                patient: { select: { id: true, name: true, phone: true, email: true } },
                professional: { select: { id: true, name: true, specialty: true } },
                service: { select: { id: true, name: true, duration: true, price: true } },
            },
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = appointmentSchema.parse(body);

        const startDateTime = new Date(validated.startTime);
        const endDateTime = new Date(validated.endTime);

        const conflicts = await prisma.appointment.findMany({
            where: {
                clinicId: session.user.clinicId,
                id: { not: id },
                status: { not: "CANCELLED" },
                OR: [
                    { AND: [{ startTime: { lte: startDateTime } }, { endTime: { gt: startDateTime } }] },
                    { AND: [{ startTime: { lt: endDateTime } }, { endTime: { gte: endDateTime } }] },
                    { AND: [{ startTime: { gte: startDateTime } }, { endTime: { lte: endDateTime } }] },
                ],
            },
        });

        if (conflicts.length > 0) {
            return NextResponse.json({ error: "Conflito de horário detectado" }, { status: 409 });
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                patientId: validated.patientId,
                professionalId: validated.professionalId,
                serviceId: validated.serviceId || null,
                startTime: startDateTime,
                endTime: endDateTime,
                notes: validated.notes || null,
                status: validated.status || undefined,
            },
            include: {
                patient: { select: { id: true, name: true, phone: true, email: true } },
                professional: { select: { id: true, name: true, specialty: true } },
                service: { select: { id: true, name: true, duration: true, price: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating appointment:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Validation error", details: error }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const updated = await prisma.appointment.updateMany({
            where: { id, clinicId: session.user.clinicId },
            data: { status: "CANCELLED" },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
    }
}

