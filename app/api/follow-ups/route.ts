import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/follow-ups - List follow-up rules
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const followUps = await prisma.followUp.findMany({
            where: {
                clinicId: session.user.clinicId,
            },
            include: {
                _count: {
                    select: {
                        executions: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Get execution statistics for each follow-up
        const followUpsWithStats = await Promise.all(
            followUps.map(async (followUp: typeof followUps[number]) => {
                const stats = await prisma.followUpExecution.groupBy({
                    by: ['status'],
                    where: {
                        followUpId: followUp.id,
                    },
                    _count: true,
                });

                const statsMap: Record<string, number> = {};
                for (const stat of stats) {
                    const key = String(stat.status).toLowerCase();
                    statsMap[key] = Number(stat._count);
                }

                return {
                    ...followUp,
                    stats: {
                        total: followUp._count.executions,
                        pending: statsMap.pending || 0,
                        sent: statsMap.sent || 0,
                        failed: statsMap.failed || 0,
                    },
                };
            })
        );

        return NextResponse.json(followUpsWithStats);
    } catch (error) {
        console.error('Error fetching follow-ups:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/follow-ups - Create follow-up rule
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, trigger, targetType, delay, messageTemplate, active } = body;

        // Validate required fields
        if (!name || !trigger || !targetType || !messageTemplate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create follow-up
        const followUp = await prisma.followUp.create({
            data: {
                name,
                description,
                trigger,
                targetType,
                delay: delay || 0,
                messageTemplate,
                active: active !== undefined ? active : true,
                clinicId: session.user.clinicId,
            },
        });

        return NextResponse.json(followUp, { status: 201 });
    } catch (error) {
        console.error('Error creating follow-up:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
