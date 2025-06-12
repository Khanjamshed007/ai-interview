import { getCurrentUser } from '@/lib/actions/auth.action';
import React from 'react'
import ResumeTemplate from './ResumeTemplate';
import { getResumes } from '@/lib/actions/general.action';

const page = async () => {
  const user = await getCurrentUser();
  console.log(user);
  const Resumes = await getResumes();
  console.log(Resumes);
  return (
    <div>
      <ResumeTemplate user={user} />
    </div>
  )
}

export default page