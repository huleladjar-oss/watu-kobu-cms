"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// =============================================================================
// TYPES
// =============================================================================

export type Role = "ADMIN" | "MANAGER" | "COLLECTOR";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
    employeeId?: string;
    area?: string;
    phone?: string;
    address?: string;
    redirectTo: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// HELPER
// =============================================================================

function getRedirectPath(role: Role): string {
    switch (role) {
        case "ADMIN":
            return "/admin/dashboard";
        case "MANAGER":
            return "/management/dashboard";
        case "COLLECTOR":
            return "/mobile";
        default:
            return "/login";
    }
}

// =============================================================================
// PROVIDER
// =============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // TRANSFORMASI LANGSUNG (Menggunakan useMemo)
    // Data user langsung tersedia saat render, tidak perlu menunggu useEffect
    const user = useMemo<User | null>(() => {
        if (status === "authenticated" && session?.user) {
            const sUser = session.user as {
                id?: string;
                name?: string;
                email?: string;
                role?: Role;
                avatarUrl?: string;
                employeeId?: string;
                area?: string;
                phone?: string;
                address?: string;
                image?: string;
            };

            const role = (sUser.role as Role) || "COLLECTOR";

            return {
                id: sUser.id || "",
                name: sUser.name || "User",
                email: sUser.email || "",
                role: role,
                avatarUrl: sUser.avatarUrl || sUser.image || "",
                employeeId: sUser.employeeId || "",
                area: sUser.area || "",
                phone: sUser.phone || "",
                address: sUser.address || "",
                redirectTo: getRedirectPath(role),
            };
        }
        return null;
    }, [session, status]);

    // State langsung dari NextAuth - no delay
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && user !== null;

    const login = () => signIn();

    const logout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// =============================================================================
// HOOK
// =============================================================================

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
