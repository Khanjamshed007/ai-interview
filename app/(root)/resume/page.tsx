import { getCurrentUser } from '@/lib/actions/auth.action';
import React from 'react'
import ResumeTemplate from './ResumeTemplate';
import { getResumes, getResumesById } from '@/lib/actions/general.action';

const page = async () => {
  const user = await getCurrentUser();
  console.log(user);
  const Resumes = await getResumes();
  console.log(Resumes);
  const ResumeId = Resumes[0]?.id

  const resumeData = await getResumesById(ResumeId!);
  console.log(resumeData);

  return (
    <div>
      <ResumeTemplate user={user} resumeData={resumeData}/>
    </div>
  )
}

export default page