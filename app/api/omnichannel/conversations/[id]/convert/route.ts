import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST /api/omnichannel/conversations/[id]/convert - Convert conversation to lead
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify conversation belongs to clinic
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                lead: true,
            },
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        if (conversation.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if already converted
        if (conversation.lead) {
            return NextResponse.json(
                { error: 'Conversation already converted to lead' },
                { status: 400 }
            );
        }

        // Create lead from conversation
        const lead = await prisma.lead.create({
            data: {
                name: conversation.contactName,
                phone: conversation.contactPhone || '',
                source: conversation.channel === 'whatsapp' ? 'WHATSAPP' : 'INSTAGRAM',
                status: 'NEW',
                notes: `Convertido do ${conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Instagram'}`,
                clinicId: session.user.clinicId,
                conversationId: conversation.id,
            },
        });

        return NextResponse.json({
            message: 'Conversation converted to lead successfully',
            lead,
        });
    } catch (error) {
        console.error('Error converting conversation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
