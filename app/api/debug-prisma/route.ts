import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const models = Object.keys(prisma);
    const hasPrescription = "prescription" in prisma;
    const hasCertificate = "medicalCertificate" in prisma;

    return NextResponse.json({
        models,
        hasPrescription,
        hasCertificate,
        prescriptionModel: !!prisma.prescription,
        certificateModel: !!prisma.medicalCertificate
    });
}
