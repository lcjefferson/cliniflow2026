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

        // Fetch payments
        const payments = await prisma.payment.findMany({
            where: {
                createdBy: {
                    clinicId: session.user.clinicId,
                },
                ...(Object.keys(dateFilter).length > 0 && { dueDate: dateFilter }),
            },
            include: {
                patient: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                dueDate: "desc",
            },
        });

        // Calculate totals
        const totalReceived = payments
            .filter((p) => p.status === "PAID")
            .reduce((sum, p) => sum + p.amount, 0);

        const totalPending = payments
            .filter((p) => p.status === "PENDING")
            .reduce((sum, p) => sum + p.amount, 0);

        const totalOverdue = payments
            .filter((p) => p.status === "OVERDUE")
            .reduce((sum, p) => sum + p.amount, 0);

        // Format data for report
        const reportData = {
            title: "Relatório Financeiro",
            subtitle: `Período: ${startDate ? format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR }) : "Início"} - ${endDate ? format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR }) : "Hoje"}`,
            headers: ["Paciente", "Valor", "Vencimento", "Pagamento", "Status", "Método"],
            rows: payments.map((payment) => [
                payment.patient?.name || "Sem paciente",
                `R$ ${payment.amount.toFixed(2)}`,
                payment.dueDate ? format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "-",
                payment.paidDate
                    ? format(new Date(payment.paidDate), "dd/MM/yyyy", { locale: ptBR })
                    : "-",
                payment.status === "PAID" ? "Pago" : payment.status === "PENDING" ? "Pendente" : "Atrasado",
                payment.method || "-",
            ]),
            totals: [
                { label: "Total Recebido", value: `R$ ${totalReceived.toFixed(2)}` },
                { label: "Total Pendente", value: `R$ ${totalPending.toFixed(2)}` },
                { label: "Total Atrasado", value: `R$ ${totalOverdue.toFixed(2)}` },
                { label: "Total Geral", value: `R$ ${(totalReceived + totalPending + totalOverdue).toFixed(2)}` },
            ],
        };

        return NextResponse.json(reportData);
    } catch (error) {
        console.error("Error generating financial report:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
