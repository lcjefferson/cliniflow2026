import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/follow-ups/executions - List follow-up executions
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where: any = {
            clinicId: session.user.clinicId,
        };

        if (status) {
            where.status = status.toUpperCase();
        }

        const [executions, total] = await Promise.all([
            prisma.followUpExecution.findMany({
                where,
                include: {
                    followUp: {
                        select: {
                            name: true,
                            trigger: true,
                        },
                    },
                },
                orderBy: {
                    scheduledFor: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.followUpExecution.count({ where }),
        ]);

        return NextResponse.json({
            executions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching executions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
