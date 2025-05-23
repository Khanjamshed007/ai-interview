'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingModal from './LoadingModal' // your loading modal component

export default function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    router?.events?.on('routeChangeStart', handleStart)
    router?.events?.on('routeChangeComplete', handleComplete)
    router?.events?.on('routeChangeError', handleComplete)

    return () => {
      router?.events?.off('routeChangeStart', handleStart)
      router?.events?.off('routeChangeComplete', handleComplete)
      router?.events?.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <>
      {loading && <LoadingModal />}
      {children}
    </>
  )
}
