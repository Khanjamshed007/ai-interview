import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviewByUerId, getLatestInterview } from '@/lib/actions/general.action'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const page = async () => {
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewByUerId(user?.id!),
    await getLatestInterview({ userId: user?.id! })
  ])

  console.log(userInterviews)

  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview-ready with AI-powered Practice and Mock Interviews</h2>
          <p className='text-lg'>Practice on real time interviews with AI-generated questions and instant feedback</p>
          <Button asChild className='btn-primary'>
            <Link href='/interview'>
              Start an interview
            </Link>
          </Button>
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