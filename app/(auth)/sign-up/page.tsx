import AuthForm from '@/components/AuthForm'
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import React from 'react'

const Page = async() => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect('/')
  return (
    <AuthForm type="sign-up" />
  )
}

export default Page