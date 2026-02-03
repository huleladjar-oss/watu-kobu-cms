// Mock user data for authentication
export interface User {
    id: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'collector';
    name: string;
    redirectTo: string;
}

export const users: User[] = [
    {
        id: '1',
        email: 'admin@watukobu.co.id',
        password: 'admin',
        role: 'admin',
        name: 'Sarah Jenkins',
        redirectTo: '/admin/dashboard',
    },
    {
        id: '2',
        email: 'manager@watukobu.co.id',
        password: 'manager',
        role: 'manager',
        name: 'Alex Morgan',
        redirectTo: '/management/dashboard',
    },
    {
        id: '3',
        email: 'kolektor@watukobu.co.id',
        password: 'kolektor',
        role: 'collector',
        name: 'Budi Santoso',
        redirectTo: '/mobile',
    },
];

// Helper function to find user by credentials
export function findUserByCredentials(email: string, password: string): User | null {
    return users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    ) || null;
}
