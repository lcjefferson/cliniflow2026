import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations/appointment";

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
        const appointment = await prisma.appointment.findFirst({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                professional: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        duration: true,
                        price: true,
                    },
                },
            },
        });

        if (!appointment) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointment" },
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
        const validatedData = appointmentSchema.parse(body);

        // Convert ISO strings to DateTime objects
        const startDateTime = new Date(validatedData.startTime);
        const endDateTime = new Date(validatedData.endTime);

        // Get service name for title if serviceId is provided
        let title = "Consulta";
        if (validatedData.serviceId) {
            const service = await prisma.service.findUnique({
                where: { id: validatedData.serviceId },
                select: { name: true },
            });
            if (service) {
                title = service.name;
            }
        }

        // Check for conflicts (excluding current appointment)
        const { id } = await params;
        const conflicts = await prisma.appointment.findMany({
            where: {
                clinicId: session.user.clinicId,
                id: { not: id },
                status: {
                    not: "CANCELLED",
                },
                OR: [
                    {
                        AND: [
                            { startTime: { lte: startDateTime } },
                            { endTime: { gt: startDateTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: endDateTime } },
                            { endTime: { gte: endDateTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { gte: startDateTime } },
                            { endTime: { lte: endDateTime } },
                        ],
                    },
                ],
            },
        });

        if (conflicts.length > 0) {
            return NextResponse.json(
                { error: "Conflito de horário detectado" },
                { status: 409 }
            );
        }

        const appointment = await prisma.appointment.update({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            data: {
                title,
                patientId: validatedData.patientId,
                professionalId: validatedData.professionalId,
                startTime: startDateTime,
                endTime: endDateTime,
                serviceId: validatedData.serviceId || null,
                notes: validatedData.notes || null,
                status: validatedData.status || "SCHEDULED",
            },
            include: {
                patient: {
                    select: { id: true, name: true, phone: true, email: true },
                },
                professional: {
                    select: { id: true, name: true, specialty: true },
                },
                service: {
                    select: { id: true, name: true, duration: true, price: true },
                },
            },
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update appointment" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cancel appointment instead of deleting
        const { id } = await params;
        const appointment = await prisma.appointment.updateMany({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            data: {
                status: "CANCELLED",
            },
        });

        if (appointment.count === 0) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return NextResponse.json(
            { error: "Failed to cancel appointment" },
            { status: 500 }
        );
    }
}
