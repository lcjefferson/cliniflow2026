import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Build date filter
        const dateFilter: any = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }

        // Fetch appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                clinicId: session.user.clinicId,
                ...(Object.keys(dateFilter).length > 0 && { startTime: dateFilter }),
            },
            include: {
                patient: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
                professional: {
                    select: {
                        name: true,
                        specialty: true,
                    },
                },
                service: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        // Calculate statistics
        const totalAppointments = appointments.length;
        const completed = appointments.filter((a) => a.status === "COMPLETED").length;
        const cancelled = appointments.filter((a) => a.status === "CANCELLED").length;
        const scheduled = appointments.filter((a) => a.status === "SCHEDULED").length;

        // Format data for report
        const reportData = {
            title: "Relatório de Agendamentos",
            subtitle: `Período: ${startDate ? format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR }) : "Início"} - ${endDate ? format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR }) : "Hoje"}`,
            headers: ["Data/Hora", "Paciente", "Profissional", "Serviço", "Status"],
            rows: appointments.map((appointment) => [
                format(new Date(appointment.startTime), "dd/MM/yyyy HH:mm", { locale: ptBR }),
                appointment.patient.name,
                appointment.professional?.name || "-",
                appointment.service?.name || appointment.title,
                appointment.status === "COMPLETED"
                    ? "Concluído"
                    : appointment.status === "CANCELLED"
                        ? "Cancelado"
                        : "Agendado",
            ]),
            totals: [
                { label: "Total de Agendamentos", value: totalAppointments },
                { label: "Concluídos", value: completed },
                { label: "Cancelados", value: cancelled },
                { label: "Agendados", value: scheduled },
            ],
        };

        return NextResponse.json(reportData);
    } catch (error) {
        console.error("Error generating appointments report:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
