import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const status = searchParams.get("status");
        const patientId = searchParams.get("patientId");

        const where: Prisma.PaymentWhereInput = {
            patient: {
                clinicId: session.user.clinicId,
            },
        };

        if (startDate && endDate) {
            where.dueDate = {
                gte: startOfDay(parseISO(startDate)),
                lte: endOfDay(parseISO(endDate)),
            };
        }

        if (status && status !== "ALL") {
            where.status = status;
        }

        if (patientId) {
            where.patientId = patientId;
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                patient: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                dueDate: "asc",
            },
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
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

        const payment = await prisma.payment.create({
            data: {
                amount: parseFloat(body.amount),
                type: body.type || "INCOME",
                status: body.status || "PENDING",
                method: body.method,
                description: body.description,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                paidDate: body.paidDate ? new Date(body.paidDate) : undefined,
                patientId: body.patientId,
                createdById: session.user.id,
            },
        });

        return NextResponse.json(payment);
    } catch (error) {
        console.error("Error creating payment:", error);
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}
