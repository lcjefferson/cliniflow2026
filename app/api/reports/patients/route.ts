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
        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }

        // Fetch patients
        const patients = await prisma.patient.findMany({
            where: {
                clinicId: session.user.clinicId,
                ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
            },
            include: {
                _count: {
                    select: {
                        appointments: true,
                        payments: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Calculate statistics
        const totalPatients = patients.length;
        const activePatients = patients.filter((p) => p.active).length;
        const inactivePatients = patients.filter((p) => !p.active).length;

        // Format data for report
        const reportData = {
            title: "Relatório de Pacientes",
            subtitle: `Período: ${startDate ? format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR }) : "Início"} - ${endDate ? format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR }) : "Hoje"}`,
            headers: ["Nome", "Email", "Telefone", "Data Cadastro", "Agendamentos", "Status"],
            rows: patients.map((patient) => [
                patient.name,
                patient.email || "-",
                patient.phone || "-",
                format(new Date(patient.createdAt), "dd/MM/yyyy", { locale: ptBR }),
                patient._count.appointments,
                patient.active ? "Ativo" : "Inativo",
            ]),
            totals: [
                { label: "Total de Pacientes", value: totalPatients },
                { label: "Ativos", value: activePatients },
                { label: "Inativos", value: inactivePatients },
            ],
        };

        return NextResponse.json(reportData);
    } catch (error) {
        console.error("Error generating patients report:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
