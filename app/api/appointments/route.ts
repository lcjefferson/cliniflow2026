import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations/appointment";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("start");
        const endDate = searchParams.get("end");

        const appointments = await prisma.appointment.findMany({
            where: {
                clinicId: session.user.clinicId,
                ...(startDate &&
                    endDate && {
                    startTime: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }),
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
            orderBy: { startTime: "asc" },
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointments" },
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

        // Check for conflicts
        const conflicts = await prisma.appointment.findMany({
            where: {
                clinicId: session.user.clinicId,
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

        const appointment = await prisma.appointment.create({
            data: {
                title,
                patientId: validatedData.patientId,
                professionalId: validatedData.professionalId,
                clinicId: session.user.clinicId,
                startTime: startDateTime,
                endTime: endDateTime,
                serviceId: validatedData.serviceId || null,
                notes: validatedData.notes || null,
                status: validatedData.status || "SCHEDULED",
                createdById: session.user.id,
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

        // Schedule follow-ups for appointment
        try {
            const { scheduleFollowUp } = await import('@/lib/follow-up-service');

            // Format date and time for message variables
            const appointmentDate = startDateTime.toLocaleDateString('pt-BR');
            const appointmentTime = startDateTime.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Trigger APPOINTMENT_SCHEDULED follow-up
            await scheduleFollowUp({
                trigger: 'APPOINTMENT_SCHEDULED',
                targetId: validatedData.patientId,
                targetType: 'patient',
                clinicId: session.user.clinicId,
                additionalData: {
                    data: appointmentDate,
                    hora: appointmentTime,
                    profissional: appointment.professional.name,
                },
            });

            // Trigger APPOINTMENT_REMINDER follow-up (uses appointment date as reference)
            await scheduleFollowUp({
                trigger: 'APPOINTMENT_REMINDER',
                targetId: validatedData.patientId,
                targetType: 'patient',
                clinicId: session.user.clinicId,
                additionalData: {
                    referenceDate: startDateTime.toISOString(),
                    data: appointmentDate,
                    hora: appointmentTime,
                    profissional: appointment.professional.name,
                },
            });
        } catch (followUpError) {
            console.error('Error scheduling follow-ups:', followUpError);
            // Don't fail the appointment creation if follow-up scheduling fails
        }

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        console.error("Error creating appointment:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create appointment" },
            { status: 500 }
        );
    }
}
