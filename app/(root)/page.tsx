import InterviewCard from '@/components/InterviewCard'
import LinkWithLoader from '@/components/LinkWithLoader'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviewByUerId, getLatestInterview, getResumeInterviewByUerId } from '@/lib/actions/general.action'
import Image from 'next/image'
import React from 'react'
import { FaUpload } from "react-icons/fa";

const page = async () => {
  const user = await getCurrentUser();

  const [userInterviews, resumeInterviews, latestInterviews] = await Promise.all([
    await getInterviewByUerId(user?.id!),
    await getResumeInterviewByUerId(user?.id!),
    await getLatestInterview({ userId: user?.id! })
  ])


  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview-ready with AI-powered Practice and Mock Interviews</h2>
          <p className='text-lg'>Practice on real time interviews with AI-generated questions and instant feedback</p>
          <div className='flex flex-row gap-4'>
            <Button asChild className='btn-primary'>
              <LinkWithLoader href='/interview'>
                Start an interview
              </LinkWithLoader>
            </Button>
            <Button asChild className='btn-primary'>
              <LinkWithLoader href='/resume'>
                <FaUpload /> Upload Resume
              </LinkWithLoader>
            </Button>
          </div>
        </div>
        <Image
          src="/robot.png"
          alt="mock interview"
          width={400}
          height={400}
          className='hidden sm:block mt-6 sm:mt-0'
        />
      </section>
      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>
        <div className='interviews-section'>
          {userInterviews && userInterviews.length > 0 ? (
            userInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p className="no-interviews">You have not taken any interviews yet</p>
          )}
        </div>
      </section>
      <section className='flex flex-col gap-6 mt-8'>
        <h2>Resume Based Interviews</h2>
        <div className='interviews-section'>
          {resumeInterviews && resumeInterviews.length > 0 ? (
            resumeInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} resume="resume"/>
            ))
          ) : (
            <p className="no-interviews">You have not taken any interviews yet</p>
          )}
        </div>
      </section>
      <section className='flex flex-col gap-6 mt-8'>
        <h2>Take an Interview</h2>
        <div className='interviews-section'>
          {latestInterviews && latestInterviews.length > 0 ? (
            latestInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p className="no-interviews">There is no interview availabel</p>
          )}
        </div>
      </section>
    </>
  )
}

export default page