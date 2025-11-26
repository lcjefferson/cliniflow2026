import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        const payment = await prisma.payment.findFirst({
            where: {
                id: id,
                patient: {
                    clinicId: session.user.clinicId,
                },
            },
            include: {
                patient: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json(payment);
    } catch (error) {
        console.error("Error fetching payment:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment" },
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

        const { id } = await params;
        const body = await request.json();

        const payment = await prisma.payment.update({
            where: {
                id: id,
                patient: {
                    clinicId: session.user.clinicId,
                },
            },
            data: {
                amount: body.amount ? parseFloat(body.amount) : undefined,
                status: body.status,
                method: body.method,
                description: body.description,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                paidDate: body.paidDate ? new Date(body.paidDate) : undefined,
            },
        });

        return NextResponse.json(payment);
    } catch (error) {
        console.error("Error updating payment:", error);
        return NextResponse.json(
            { error: "Failed to update payment" },
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

        const { id } = await params;

        await prisma.payment.delete({
            where: {
                id: id,
                patient: {
                    clinicId: session.user.clinicId,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting payment:", error);
        return NextResponse.json(
            { error: "Failed to delete payment" },
            { status: 500 }
        );
    }
}
