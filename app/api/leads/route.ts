import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/leads - List leads with filters
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const source = searchParams.get('source');
        const search = searchParams.get('search');

        const where: any = {
            clinicId: session.user.clinicId,
        };

        if (status) {
            where.status = status;
        }

        if (source) {
            where.source = source;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const leads = await prisma.lead.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/leads - Create new lead
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, email, source, status = 'NEW', notes } = body;

        // Validate required fields
        if (!name || !phone) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            );
        }

        // Create lead
        const lead = await prisma.lead.create({
            data: {
                name,
                phone,
                email,
                source: source || 'OMNICHANNEL',
                status,
                notes,
                clinicId: session.user.clinicId,
            },
        });

        // Schedule follow-up for LEAD_CREATED trigger
        const { scheduleFollowUp } = await import('@/lib/follow-up-service');
        await scheduleFollowUp({
            trigger: 'LEAD_CREATED',
            targetId: lead.id,
            targetType: 'lead',
            clinicId: session.user.clinicId,
        }).catch(err => console.error('Error scheduling follow-up:', err));

        return NextResponse.json(lead, { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
