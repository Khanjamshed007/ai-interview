import { getCurrentUser } from '@/lib/actions/auth.action';
import React from 'react'
import ResumeTemplate from './ResumeTemplate';

const page = async () => {
  const user = await getCurrentUser();
  console.log(user);
  return (
    <div>
      <ResumeTemplate user={user} />
    </div>
  )
}

export default page