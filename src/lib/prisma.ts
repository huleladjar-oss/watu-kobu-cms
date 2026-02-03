// =============================================================================
// WATU KOBU - Prisma Client Singleton
// Best practice for Next.js to prevent multiple instances in development
// =============================================================================

import { PrismaClient } from '@prisma/client';

// Declare global type for PrismaClient in development
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Create Prisma Client options
const prismaClientOptions = {
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
} as const;

// Singleton pattern: Reuse existing instance in development to prevent
// creating multiple connections during hot-reload
const prisma = globalThis.prisma ?? new PrismaClient(prismaClientOptions as any);

// In development, attach to globalThis to persist across hot-reloads
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely disconnect Prisma Client
 * Use this in API routes or serverless functions if needed
 */
export async function disconnectPrisma() {
    await prisma.$disconnect();
}

/**
 * Ensure Prisma Client is connected
 * Useful for health checks
 */
export async function connectPrisma() {
    await prisma.$connect();
}

/**
 * Execute a transaction with automatic retry
 * @param fn - Transaction function
 * @param maxRetries - Maximum number of retries (default: 3)
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Only retry on connection errors
            if (
                error instanceof Error &&
                (error.message.includes('Connection') ||
                    error.message.includes('timeout') ||
                    error.message.includes('ECONNREFUSED'))
            ) {
                console.warn(`Prisma operation failed, retrying (${i + 1}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
                continue;
            }

            throw error;
        }
    }

    throw lastError;
}
