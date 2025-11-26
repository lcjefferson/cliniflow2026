import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/omnichannel/webhooks/instagram - Webhook verification
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('hub.mode');
        const token = searchParams.get('hub.verify_token');
        const challenge = searchParams.get('hub.challenge');

        // Use same webhook token as WhatsApp
        const settings = await prisma.clinicSettings.findFirst();
        const webhookToken = settings?.whatsappWebhookToken || process.env.WHATSAPP_WEBHOOK_TOKEN;

        if (mode === 'subscribe' && token === webhookToken) {
            console.log('Instagram webhook verified');
            return new NextResponse(challenge, { status: 200 });
        }

        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } catch (error) {
        console.error('Error verifying webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/omnichannel/webhooks/instagram - Receive messages
export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('Instagram webhook received:', JSON.stringify(body, null, 2));

        // Instagram sends test messages, ignore them
        if (body.object !== 'instagram') {
            return NextResponse.json({ status: 'ignored' });
        }

        const entry = body.entry?.[0];
        const messaging = entry?.messaging?.[0];

        if (!messaging?.message) {
            return NextResponse.json({ status: 'no_message' });
        }

        const senderId = messaging.sender.id;
        const messageId = messaging.message.mid;
        const messageText = messaging.message.text || '';

        // Get clinic from Instagram account ID
        const recipientId = messaging.recipient.id;
        const settings = await prisma.clinicSettings.findFirst({
            where: {
                instagramAccountId: recipientId,
            },
            include: {
                clinic: true,
            },
        });

        if (!settings) {
            console.log('No clinic found for Instagram account:', recipientId);
            return NextResponse.json({ status: 'no_clinic' });
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                channel_externalId: {
                    channel: 'instagram',
                    externalId: senderId,
                },
            },
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    channel: 'instagram',
                    externalId: senderId,
                    contactName: `Instagram User ${senderId.slice(0, 8)}`,
                    contactPhone: null,
                    lastMessage: messageText,
                    lastMessageAt: new Date(),
                    unreadCount: 1,
                    clinicId: settings.clinicId,
                },
            });
        } else {
            // Update conversation
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                    lastMessage: messageText,
                    lastMessageAt: new Date(),
                    unreadCount: { increment: 1 },
                },
            });
        }

        // Create message
        await prisma.message.create({
            data: {
                externalId: messageId,
                content: messageText,
                direction: 'INBOUND',
                conversationId: conversation.id,
            },
        });

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing Instagram webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
