import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/users/[id]/profile - Update user profile
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = id;

        // Users can only update their own profile
        if (session.user.id !== userId) {
            return NextResponse.json(
                { success: false, error: 'You can only update your own profile' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, phone, email, address } = body;

        // Validate required fields
        if (!name || !name.trim()) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        // Check if email is already used by another user
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: email,
                    NOT: { id: userId },
                },
            });

            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: 'Email already in use' },
                    { status: 400 }
                );
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name.trim(),
                phone: phone?.trim() || null,
                email: email?.trim() || undefined,
                address: address?.trim() || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                role: true,
                employeeId: true,
                area: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

// GET /api/users/[id]/profile - Get user profile
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                role: true,
                employeeId: true,
                area: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}
