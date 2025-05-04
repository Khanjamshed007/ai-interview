'use client';

import { Button } from '@/components/ui/button';
import { auth } from '@/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteSessionCookie, getCurrentUser } from '@/lib/actions/auth.action';

// Define interface for user data
interface User {
    name?: string | null;
    email?: string | null;
}

const UserButton = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on component mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error: any) {
                console.error('Failed to fetch user:', error);
                toast.error('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            await deleteSessionCookie();
            toast.success('Signed out successfully');
            router.push('/sign-in');
        } catch (error: any) {
            console.error('Logout error:', error);
            toast.error(`Logout failed: ${error.message || 'An error occurred'}`);
        }
    };

    // Display loading state or fallback if no user
    if (loading) {
        return (
            <Button variant="outline" disabled>
                Loading...
            </Button>
        );
    }

    if (!user || !user.name) {
        return (
            <Button variant="outline" onClick={() => router.push('/sign-in')}>
                Sign In
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    {user.name}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;