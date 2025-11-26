import { NextResponse } from 'next/server';
import { processPendingFollowUps } from '@/lib/follow-up-service';

// POST /api/follow-ups/process - Process pending follow-ups (cron job)
export async function POST(request: Request) {
    try {
        // Optional: Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.FOLLOW_UP_CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await processPendingFollowUps();

        return NextResponse.json({
            success: true,
            processed: result.processed,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error processing follow-ups:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/follow-ups/process - Manual trigger for testing
export async function GET(request: Request) {
    try {
        const result = await processPendingFollowUps();

        return NextResponse.json({
            success: true,
            processed: result.processed,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error processing follow-ups:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
