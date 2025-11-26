import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH /api/follow-ups/[id] - Update follow-up rule
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
        const { name, description, trigger, targetType, delay, messageTemplate, active } = body;

        // Check if follow-up exists and belongs to clinic
        const existingFollowUp = await prisma.followUp.findUnique({
            where: { id },
        });

        if (!existingFollowUp) {
            return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
        }

        if (existingFollowUp.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update follow-up
        const updatedFollowUp = await prisma.followUp.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(trigger && { trigger }),
                ...(targetType && { targetType }),
                ...(delay !== undefined && { delay }),
                ...(messageTemplate && { messageTemplate }),
                ...(active !== undefined && { active }),
            },
        });

        return NextResponse.json(updatedFollowUp);
    } catch (error) {
        console.error('Error updating follow-up:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/follow-ups/[id] - Delete follow-up rule
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

        // Check if follow-up exists and belongs to clinic
        const existingFollowUp = await prisma.followUp.findUnique({
            where: { id },
        });

        if (!existingFollowUp) {
            return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
        }

        if (existingFollowUp.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Soft delete - set active to false
        await prisma.followUp.update({
            where: { id },
            data: { active: false },
        });

        // Cancel pending executions
        await prisma.followUpExecution.updateMany({
            where: {
                followUpId: id,
                status: 'PENDING',
            },
            data: {
                status: 'FAILED',
                error: 'Follow-up rule deleted',
                executedAt: new Date(),
            },
        });

        return NextResponse.json({ message: 'Follow-up deleted successfully' });
    } catch (error) {
        console.error('Error deleting follow-up:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
