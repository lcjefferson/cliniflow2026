import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations/service";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const service = await prisma.service.findFirst({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error("Error fetching service:", error);
        return NextResponse.json(
            { error: "Failed to fetch service" },
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
        const validatedData = serviceSchema.parse(body);

        const service = await prisma.service.updateMany({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            data: {
                ...validatedData,
                price: parseFloat(validatedData.price),
                duration: parseInt(validatedData.duration),
            },
        });

        if (service.count === 0) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        const updatedService = await prisma.service.findUnique({
            where: { id: id },
        });

        return NextResponse.json(updatedService);
    } catch (error) {
        console.error("Error updating service:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update service" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Soft delete - set active to false
        await prisma.service.updateMany({
            where: {
                id: id,
                clinicId: session.user.clinicId,
            },
            data: {
                active: false,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting service:", error);
        return NextResponse.json(
            { error: "Failed to delete service" },
            { status: 500 }
        );
    }
}
