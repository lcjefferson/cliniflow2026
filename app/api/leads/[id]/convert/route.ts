import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/leads/[id]/convert - Convert lead to patient
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Check if lead exists and belongs to same clinic
        const lead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        if (lead.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if lead is already converted
        if (lead.status === 'CONVERTED') {
            return NextResponse.json(
                { error: 'Lead already converted' },
                { status: 400 }
            );
        }

        // Create patient from lead data
        const patient = await prisma.patient.create({
            data: {
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                notes: lead.notes,
                clinicId: session.user.clinicId,
            },
        });

        // Update lead status to converted
        await prisma.lead.update({
            where: { id },
            data: {
                status: 'CONVERTED',
            },
        });

        return NextResponse.json({
            message: 'Lead converted successfully',
            patient,
        });
    } catch (error) {
        console.error('Error converting lead:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
