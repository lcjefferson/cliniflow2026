import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/omnichannel/webhooks/whatsapp - Webhook verification
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('hub.mode');
        const token = searchParams.get('hub.verify_token');
        const challenge = searchParams.get('hub.challenge');

        // Get webhook token from settings
        const settings = await prisma.clinicSettings.findFirst();
        const webhookToken = settings?.whatsappWebhookToken || process.env.WHATSAPP_WEBHOOK_TOKEN;

        if (mode === 'subscribe' && token === webhookToken) {
            console.log('WhatsApp webhook verified');
            return new NextResponse(challenge, { status: 200 });
        }

        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } catch (error) {
        console.error('Error verifying webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/omnichannel/webhooks/whatsapp - Receive messages
export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

        // WhatsApp sends test messages, ignore them
        if (body.object !== 'whatsapp_business_account') {
            return NextResponse.json({ status: 'ignored' });
        }

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value?.messages) {
            return NextResponse.json({ status: 'no_messages' });
        }

        const message = value.messages[0];
        const from = message.from; // Phone number
        const messageId = message.id;
        const messageText = message.text?.body || '';
        const contactName = value.contacts?.[0]?.profile?.name || from;

        // Get clinic from phone number ID
        const phoneNumberId = value.metadata?.phone_number_id;
        const settings = await prisma.clinicSettings.findFirst({
            where: {
                whatsappPhoneNumberId: phoneNumberId,
            },
            include: {
                clinic: true,
            },
        });

        if (!settings) {
            console.log('No clinic found for phone number:', phoneNumberId);
            return NextResponse.json({ status: 'no_clinic' });
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                channel_externalId: {
                    channel: 'whatsapp',
                    externalId: from,
                },
            },
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    channel: 'whatsapp',
                    externalId: from,
                    contactName,
                    contactPhone: from,
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
        console.error('Error processing WhatsApp webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
