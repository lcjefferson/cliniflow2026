import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';


// GET /api/omnichannel/conversations - List conversations
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const channel = searchParams.get('channel');
        const search = searchParams.get('search');

        const where: { clinicId: string; channel?: string; OR?: { contactName?: { contains: string }; contactPhone?: { contains: string } }[] } = {
            clinicId: session.user.clinicId,
        };

        if (channel) {
            where.channel = channel;
        }

        if (search) {
            where.OR = [
                { contactName: { contains: search } },
                { contactPhone: { contains: search } },
            ];
        }

        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                lastMessageAt: 'desc',
            },
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/omnichannel/conversations - Create conversation
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { channel, externalId, contactName, contactPhone, initialMessage } = body;

        // Validate required fields
        if (!channel || !externalId || !contactName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if conversation already exists
        const existingConversation = await prisma.conversation.findUnique({
            where: {
                channel_externalId: {
                    channel,
                    externalId,
                },
            },
        });

        if (existingConversation) {
            return NextResponse.json(existingConversation);
        }

        // Create conversation
        const conversation = await prisma.conversation.create({
            data: {
                channel,
                externalId,
                contactName,
                contactPhone,
                lastMessage: initialMessage,
                lastMessageAt: new Date(),
                clinicId: session.user.clinicId,
            },
        });

        // Create initial message if provided
        if (initialMessage) {
            await prisma.message.create({
                data: {
                    externalId: `${externalId}_initial`,
                    content: initialMessage,
                    direction: 'INBOUND',
                    conversationId: conversation.id,
                },
            });
        }

        return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
