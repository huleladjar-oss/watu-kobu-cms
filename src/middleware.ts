// =============================================================================
// WATU KOBU - Middleware (Role-Based Access Control)
// =============================================================================

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from request
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/api/auth'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // If user is on login page and already authenticated, redirect to their dashboard
    if (pathname === '/login' && token) {
        const role = token.role as string;
        const redirectUrl = getDashboardByRole(role);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;

    // Role-based route protection
    // Admin routes - only ADMIN can access
    if (pathname.startsWith('/admin')) {
        if (userRole !== 'ADMIN') {
            return NextResponse.redirect(
                new URL(getDashboardByRole(userRole), request.url)
            );
        }
    }

    // Management routes - only MANAGER can access
    if (pathname.startsWith('/management')) {
        if (userRole !== 'MANAGER') {
            return NextResponse.redirect(
                new URL(getDashboardByRole(userRole), request.url)
            );
        }
    }

    // Mobile routes - only COLLECTOR can access
    if (pathname.startsWith('/mobile')) {
        if (userRole !== 'COLLECTOR') {
            return NextResponse.redirect(
                new URL(getDashboardByRole(userRole), request.url)
            );
        }
    }

    // Allow request to proceed
    return NextResponse.next();
}

// Helper function to get dashboard URL by role
function getDashboardByRole(role: string): string {
    switch (role) {
        case 'ADMIN':
            return '/admin/dashboard';
        case 'MANAGER':
            return '/management/dashboard';
        case 'COLLECTOR':
            return '/mobile';
        default:
            return '/login';
    }
}

// Middleware matcher - which routes to apply middleware
export const config = {
    matcher: [
        // Protected routes
        '/admin/:path*',
        '/management/:path*',
        '/mobile/:path*',
        // Login page (for redirect if already logged in)
        '/login',
        // Exclude static files, images, and API auth routes
        '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    ],
};
