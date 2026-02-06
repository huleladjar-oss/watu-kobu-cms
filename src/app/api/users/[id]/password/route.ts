import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/users/[id]/password - Change user password
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

        // Users can only change their own password
        if (session.user.id !== userId) {
            return NextResponse.json(
                { success: false, error: 'You can only change your own password' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'New password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Get user with current password
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Password lama salah' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Password berhasil diubah',
        });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengubah password' },
            { status: 500 }
        );
    }
}
