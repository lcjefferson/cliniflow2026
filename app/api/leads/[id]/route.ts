import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH /api/leads/[id] - Update lead
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { name, phone, email, source, status, notes } = body;

        // Check if lead exists and belongs to same clinic
        const existingLead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!existingLead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        if (existingLead.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update lead
        const updatedLead = await prisma.lead.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(email !== undefined && { email }),
                ...(source && { source }),
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
        });

        // Schedule follow-up if status changed
        if (status && status !== existingLead.status) {
            const { scheduleFollowUp } = await import('@/lib/follow-up-service');

            if (status === 'CONTACTED') {
                await scheduleFollowUp({
                    trigger: 'LEAD_CONTACTED',
                    targetId: id,
                    targetType: 'lead',
                    clinicId: session.user.clinicId,
                }).catch(err => console.error('Error scheduling follow-up:', err));
            } else if (status === 'QUALIFIED') {
                await scheduleFollowUp({
                    trigger: 'LEAD_QUALIFIED',
                    targetId: id,
                    targetType: 'lead',
                    clinicId: session.user.clinicId,
                }).catch(err => console.error('Error scheduling follow-up:', err));
            }
        }

        return NextResponse.json(updatedLead);
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/leads/[id] - Delete lead
export async function DELETE(
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
        const existingLead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!existingLead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        if (existingLead.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete lead
        await prisma.lead.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
