import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// GET /api/users/[id] - Get a single user details
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/users/[id] - Update user fields (except password)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Only ADMIN can update users
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await request.json();
        const { name, email, role, active } = body;
        const updated = await prisma.user.update({
            where: { id: params.id },
            data: { name, email, role, active },
            select: { id: true, name: true, email: true, role: true, active: true },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/users/[id] - Soft delete (deactivate) user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.clinicId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Only ADMIN can deactivate users
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const deactivated = await prisma.user.update({
            where: { id: params.id },
            data: { active: false },
            select: { id: true, active: true },
        });
        return NextResponse.json(deactivated);
    } catch (error) {
        console.error('Error deactivating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
