import { prisma } from '@/lib/prisma';

interface ScheduleFollowUpParams {
    trigger: string;
    targetId: string;
    targetType: 'lead' | 'patient';
    clinicId: string;
    additionalData?: {
        referenceDate?: string | Date;
        data?: string;
        hora?: string;
        profissional?: string;
    };
}

interface MessageVariables {
    [key: string]: string | undefined;
    nome: string;
    clinica: string;
    data?: string;
    hora?: string;
    profissional?: string;
}

/**
 * Schedule a follow-up message based on trigger
 */
export async function scheduleFollowUp(params: ScheduleFollowUpParams) {
    const { trigger, targetId, targetType, clinicId, additionalData = {} } = params;

    try {
        // Find active follow-up rules for this trigger and target type
        const followUpRules = await prisma.followUp.findMany({
            where: {
                clinicId,
                trigger,
                targetType: targetType.toUpperCase(),
                active: true,
            },
        });

        if (followUpRules.length === 0) {
            console.log(`No active follow-up rules found for trigger: ${trigger}`);
            return;
        }

        // Get target data (lead or patient)
        const target = targetType === 'lead'
            ? await prisma.lead.findUnique({ where: { id: targetId } })
            : await prisma.patient.findUnique({ where: { id: targetId } });

        if (!target) {
            console.error(`Target ${targetType} not found: ${targetId}`);
            return;
        }

        // Get clinic data
        const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });

        // Create executions for each rule
        for (const rule of followUpRules) {
            // For appointment reminders, use the appointment date as reference
            // Otherwise use current date
            const referenceDate = additionalData.referenceDate
                ? new Date(additionalData.referenceDate)
                : new Date();

            const scheduledFor = calculateScheduledDate(rule.delay || 0, referenceDate);

            // Prepare message variables
            const variables: MessageVariables = {
                nome: target.name,
                clinica: clinic?.name || 'Clínica',
                data: additionalData.data,
                hora: additionalData.hora,
                profissional: additionalData.profissional,
            };

            // Process message template
            const message = processMessageTemplate(rule.messageTemplate, variables);

            // Create execution
            await prisma.followUpExecution.create({
                data: {
                    followUpId: rule.id,
                    targetId,
                    targetType,
                    scheduledFor,
                    message,
                    clinicId,
                },
            });

            console.log(`Scheduled follow-up: ${rule.name} for ${target.name} at ${scheduledFor}`);
        }
    } catch (error) {
        console.error('Error scheduling follow-up:', error);
        throw error;
    }
}

/**
 * Calculate scheduled date based on delay in days
 */
function calculateScheduledDate(delayDays: number, referenceDate: Date = new Date()): Date {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() + delayDays);
    return date;
}

/**
 * Process message template and replace variables
 */
export function processMessageTemplate(
    template: string,
    variables: Record<string, string | undefined>
): string {
    let message = template;

    // Replace all variables in the format {variable}
    Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        message = message.replace(regex, variables[key] || '');
    });

    return message;
}

/**
 * Send message via WhatsApp or Instagram
 */
export async function sendMessage(
    phone: string,
    message: string,
    channel: 'whatsapp' | 'instagram',
    clinicId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get clinic settings
        const settings = await prisma.clinicSettings.findFirst({
            where: { clinicId },
        });

        if (!settings) {
            return { success: false, error: 'Clinic settings not found' };
        }

        if (channel === 'whatsapp') {
            return await sendWhatsAppMessage(phone, message, settings);
        } else {
            return await sendInstagramMessage(phone, message, settings);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

/**
 * Send WhatsApp message via Meta Graph API
 */
type ClinicSettings = {
    whatsappToken?: string | null;
    whatsappPhoneNumberId?: string | null;
    instagramAccessToken?: string | null;
};

async function sendWhatsAppMessage(
    phone: string,
    message: string,
    settings: ClinicSettings
): Promise<{ success: boolean; error?: string }> {
    if (!settings.whatsappToken || !settings.whatsappPhoneNumberId) {
        return { success: false, error: 'WhatsApp not configured' };
    }

    try {
        const url = `https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.whatsappToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phone,
                type: 'text',
                text: { body: message },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: JSON.stringify(error) };
        }

        return { success: true };
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

/**
 * Send Instagram message via Meta Graph API
 */
async function sendInstagramMessage(
    recipientId: string,
    message: string,
    settings: ClinicSettings
): Promise<{ success: boolean; error?: string }> {
    if (!settings.instagramAccessToken) {
        return { success: false, error: 'Instagram not configured' };
    }

    try {
        const url = 'https://graph.facebook.com/v18.0/me/messages';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.instagramAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: message },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: JSON.stringify(error) };
        }

        return { success: true };
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

/**
 * Process pending follow-up executions
 */
export async function processPendingFollowUps() {
    try {
        const now = new Date();

        // Find pending executions scheduled for now or earlier
        const pendingExecutions = await prisma.followUpExecution.findMany({
            where: {
                status: 'PENDING',
                scheduledFor: {
                    lte: now,
                },
            },
            include: {
                followUp: true,
            },
            take: 50, // Process in batches
        });

        console.log(`Processing ${pendingExecutions.length} pending follow-ups`);

        for (const execution of pendingExecutions) {
            try {
                // Get target data to determine phone/channel
                let phone: string | null = null;
                let channel: 'whatsapp' | 'instagram' = 'whatsapp';

                if (execution.targetType === 'lead') {
                    const lead = await prisma.lead.findUnique({
                        where: { id: execution.targetId },
                    });
                    phone = lead?.phone || null;
                    channel = lead?.source === 'INSTAGRAM' ? 'instagram' : 'whatsapp';
                } else {
                    const patient = await prisma.patient.findUnique({
                        where: { id: execution.targetId },
                    });
                    phone = patient?.phone || null;
                }

                if (!phone) {
                    await prisma.followUpExecution.update({
                        where: { id: execution.id },
                        data: {
                            status: 'FAILED',
                            error: 'Phone number not found',
                            executedAt: new Date(),
                        },
                    });
                    continue;
                }

                // Send message
                const result = await sendMessage(
                    phone,
                    execution.message,
                    channel,
                    execution.clinicId
                );

                // Update execution status
                await prisma.followUpExecution.update({
                    where: { id: execution.id },
                    data: {
                        status: result.success ? 'SENT' : 'FAILED',
                        error: result.error,
                        executedAt: new Date(),
                    },
                });

                console.log(
                    `Follow-up ${execution.id}: ${result.success ? 'SENT' : 'FAILED'}`
                );
            } catch (error) {
                console.error(`Error processing execution ${execution.id}:`, error);

                // Mark as failed
                await prisma.followUpExecution.update({
                    where: { id: execution.id },
                    data: {
                        status: 'FAILED',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        executedAt: new Date(),
                    },
                });
            }
        }

        return { processed: pendingExecutions.length };
    } catch (error) {
        console.error('Error processing pending follow-ups:', error);
        throw error;
    }
}
