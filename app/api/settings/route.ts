import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.clinicSettings.findUnique({
            where: { clinicId: session.user.clinicId },
        });

        return NextResponse.json(settings || {});
    } catch (error) {
        console.error("Error fetching omnichannel settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
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

        const data = {
            whatsappToken: body.whatsappToken ?? undefined,
            whatsappPhoneNumberId: body.whatsappPhoneNumberId ?? undefined,
            whatsappWebhookToken: body.whatsappWebhookToken ?? undefined,
            instagramAccessToken: body.instagramAccessToken ?? undefined,
            instagramAccountId: body.instagramAccountId ?? undefined,
        };

        const updated = await prisma.clinicSettings.upsert({
            where: { clinicId: session.user.clinicId },
            update: data,
            create: { clinicId: session.user.clinicId, ...data },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating omnichannel settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}

