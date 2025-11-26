import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clinic = await prisma.clinic.findUnique({
            where: {
                id: session.user.clinicId,
            },
        });

        if (!clinic) {
            return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
        }

        return NextResponse.json(clinic);
    } catch (error) {
        console.error("Error fetching clinic settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch clinic settings" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Validate fields if necessary, but for now we allow partial updates
        // of the fields present in the body.

        const clinic = await prisma.clinic.update({
            where: {
                id: session.user.clinicId,
            },
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address,
                city: body.city,
                state: body.state,
                zipCode: body.zipCode,
                cnpj: body.cnpj,
                description: body.description,
            },
        });

        return NextResponse.json(clinic);
    } catch (error) {
        console.error("Error updating clinic settings:", error);
        return NextResponse.json(
            { error: "Failed to update clinic settings" },
            { status: 500 }
        );
    }
}
