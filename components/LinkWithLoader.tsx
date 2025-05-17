'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from './ui/button'
import LoadingModal from './LoadingModal'

type Props = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'  // Add more if needed
}

export default function LinkWithLoader({ href, children, variant = 'primary' }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      router.push(href)
    })
  }

  const buttonClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : ''

  return (
    <>
      {isPending && <LoadingModal />}
      <Button className={buttonClass} onClick={handleClick}>
        {children}
      </Button>
    </>
  )
}
