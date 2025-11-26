import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations/service";

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const services = await prisma.service.findMany({
            where: {
                clinicId: session.user.clinicId,
                active: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true,
                category: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json(
            { error: "Failed to fetch services" },
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
        const validatedData = serviceSchema.parse(body);

        const service = await prisma.service.create({
            data: {
                ...validatedData,
                price: parseFloat(validatedData.price),
                duration: parseInt(validatedData.duration),
                clinicId: session.user.clinicId,
            },
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation error", details: error },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create service" },
            { status: 500 }
        );
    }
}
