import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);

        // Total Received this month
        const receivedThisMonth = await prisma.payment.aggregate({
            where: {
                patient: { clinicId: session.user.clinicId },
                status: "PAID",
                paidDate: {
                    gte: startOfCurrentMonth,
                    lte: endOfCurrentMonth,
                },
                type: "INCOME",
            },
            _sum: {
                amount: true,
            },
        });

        // Total Pending this month
        const pendingThisMonth = await prisma.payment.aggregate({
            where: {
                patient: { clinicId: session.user.clinicId },
                status: "PENDING",
                dueDate: {
                    gte: startOfCurrentMonth,
                    lte: endOfCurrentMonth,
                },
                type: "INCOME",
            },
            _sum: {
                amount: true,
            },
        });

        // Total Overdue (all time)
        const overdue = await prisma.payment.aggregate({
            where: {
                patient: { clinicId: session.user.clinicId },
                status: "PENDING",
                dueDate: {
                    lt: new Date(), // Due date passed
                },
                type: "INCOME",
            },
            _sum: {
                amount: true,
            },
        });

        return NextResponse.json({
            received: receivedThisMonth._sum.amount || 0,
            pending: pendingThisMonth._sum.amount || 0,
            overdue: overdue._sum.amount || 0,
        });
    } catch (error) {
        console.error("Error fetching financial stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch financial stats" },
            { status: 500 }
        );
    }
}
