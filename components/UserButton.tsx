'use client';

import { Button } from '@/components/ui/button';
import { auth } from '@/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteSessionCookie } from '@/lib/actions/auth.action';

const UserButton = () => {
    const router = useRouter();
    const [userName, setUserName] = useState<string | null>(null);

    // Fetch current user details
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // Prioritize displayName, fallback to email
                setUserName(user.displayName || user.email || 'User');
            } else {
                setUserName(null);
                
                router.push('/sign-in');
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Signed out successfully');
            await deleteSessionCookie();
            router.push('/sign-in');
        } catch (error: any) {
            console.error(error);
            toast.error(`Logout failed: ${error.message || error}`);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className='cursor-pointer'>{userName || 'User'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;