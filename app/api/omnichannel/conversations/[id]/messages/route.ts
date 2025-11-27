import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/omnichannel/conversations/[id]/messages - Get messages
export async function GET(
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
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        if (conversation.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get messages
        const messages = await prisma.message.findMany({
            where: {
                conversationId: id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/omnichannel/conversations/[id]/messages - Send message
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
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Verify conversation belongs to clinic
        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        if (conversation.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                externalId: `msg_${Date.now()}`,
                content,
                direction: 'OUTBOUND',
                conversationId: id,
            },
        });

        // Update conversation last message
        await prisma.conversation.update({
            where: { id },
            data: {
                lastMessage: content,
                lastMessageAt: new Date(),
            },
        });

        // TODO: Send message via WhatsApp/Instagram API
        // This will be implemented in the webhook integration phase

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
