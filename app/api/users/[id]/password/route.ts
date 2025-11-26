import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// PATCH /api/users/[id]/password - Change password
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validate required fields
        if (!newPassword) {
            return NextResponse.json(
                { error: 'New password is required' },
                { status: 400 }
            );
        }

        // Validate password strength (minimum 6 characters)
        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user exists and belongs to same clinic
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (existingUser.clinicId !== session.user.clinicId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // If changing own password, require current password
        if (session.user.id === id) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required' },
                    { status: 400 }
                );
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(
                currentPassword,
                existingUser.password
            );

            if (!isValidPassword) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 401 }
                );
            }
        } else {
            // Only ADMIN can change other users' passwords
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
