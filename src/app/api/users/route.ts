import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users - Fetch users, optionally filtered by role
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        // Build where clause
        const where: { role?: string; isActive?: boolean } = {
            isActive: true, // Only active users
        };

        if (role) {
            where.role = role.toUpperCase();
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                employeeId: true,
                area: true,
                isActive: true,
                createdAt: true,
                // Count assignments
                _count: {
                    select: {
                        assignments: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Transform data for frontend
        const transformedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
            area: user.area || 'Unassigned',
            isActive: user.isActive,
            assignedCount: user._count.assignments,
            createdAt: user.createdAt.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            data: transformedUsers,
            count: transformedUsers.length,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
