import LoadingWrapper from '@/components/LoadingWrapper'
import UserButton from '@/components/UserButton'
import { isAuthenticated } from '@/lib/actions/auth.action'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

const Rootlayout = async ({ children }: { children: ReactNode }) => {

    const isUserAuthenticated = await isAuthenticated();
    if (!isUserAuthenticated) redirect('/sign-in')

    return (
        <div className='root-layout'>
            <nav className='flex flex-row justify-between'>
                <Link href="/" className='flex items-center gap-2'>
                    <Image
                        src="/logo.svg"
                        alt="logo"
                        width={38}
                        height={32}
                    />
                    <h2 className='text-primary-100'>JDPrep</h2>
                </Link>
                <UserButton />
            </nav>
            <LoadingWrapper>
                {children}
            </LoadingWrapper>
        </div>
    )
}

export default Rootlayout