// =============================================================================
// WATU KOBU - NextAuth Configuration
// =============================================================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// Extend NextAuth types to include custom fields
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: 'ADMIN' | 'MANAGER' | 'COLLECTOR';
            employeeId: string | null;
            avatarUrl: string | null;
            area: string | null;
            phone: string | null;
            address: string | null;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: 'ADMIN' | 'MANAGER' | 'COLLECTOR';
        employeeId: string | null;
        avatarUrl: string | null;
        area: string | null;
        phone: string | null;
        address: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        name: string;
        role: 'ADMIN' | 'MANAGER' | 'COLLECTOR';
        employeeId: string | null;
        avatarUrl: string | null;
        area: string | null;
        phone: string | null;
        address: string | null;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Validate input
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email dan password harus diisi');
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // User not found
                if (!user) {
                    throw new Error('Email tidak terdaftar');
                }

                // Check if user is active
                if (!user.isActive) {
                    throw new Error('Akun Anda telah dinonaktifkan');
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error('Password salah');
                }

                // Return user object (will be passed to jwt callback)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    employeeId: user.employeeId,
                    avatarUrl: user.avatarUrl,
                    area: user.area,
                    phone: user.phone,
                    address: user.address,
                };
            },
        }),
    ],

    callbacks: {
        // JWT callback - called when JWT is created/updated
        async jwt({ token, user }) {
            // Initial sign in - add user data to token
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.employeeId = user.employeeId;
                token.avatarUrl = user.avatarUrl;
                token.area = user.area;
                token.phone = user.phone;
                token.address = user.address;
            }
            return token;
        },

        // Session callback - called when session is checked
        async session({ session, token }) {
            // Add token data to session
            session.user = {
                id: token.id,
                email: token.email,
                name: token.name,
                role: token.role,
                employeeId: token.employeeId,
                avatarUrl: token.avatarUrl,
                area: token.area,
                phone: token.phone,
                address: token.address,
            };
            return session;
        },
    },

    pages: {
        signIn: '/login',
        error: '/login', // Redirect to login on error
    },

    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },

    jwt: {
        maxAge: 24 * 60 * 60, // 24 hours
    },

    secret: process.env.NEXTAUTH_SECRET || 'watu-kobu-secret-key-2024',

    debug: process.env.NODE_ENV === 'development',
};
