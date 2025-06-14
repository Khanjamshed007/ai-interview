import React from 'react'
import dayjs from "dayjs";
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';
import { getFeedbackByInterviewId, getInterviewById, getResumeInterviewByUerId } from '@/lib/actions/general.action';
import LinkWithLoader from './LinkWithLoader';

const InterviewCard = async ({ id, userId, role, type, techstack, resume, createdAt }: InterviewCardProps) => {
    const feedback = userId && id ? await getFeedbackByInterviewId({ interviewId: id, userId }) : null;
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format("MMM D, YYYY");
    const interview = await getInterviewById(id);
    const Resumeinterview = await getResumeInterviewByUerId(userId!);
    const ResumeFirst = Resumeinterview
        ?.filter(item => item.mcqs && item.mcqs.length > 0)
        .map(item => item.mcqs);

    return (
        <div className='card-border w-[360px] max-sm:w-full min-h-96'>
            <div className='card-interview'>
                <div>
                    <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
                        <p className='badge-text'>{normalizedType}</p>
                    </div>
                    <Image src={getRandomInterviewCover()} alt="mock interview" width={90} height={90} className='rounded-full object-fit size-[70px]' />

                    <h3 className='mt-5 capitalize'>
                        {role} Interview
                    </h3>
                    <div className='flex flex-row gap-5 mt-3'>
                        <div className='flex flex-row gap-2'>
                            <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                            <p>{formattedDate}</p>
                        </div>
                        <div className='flex flex-row gap-2'>
                            <Image src="/star.svg" alt="star" width={22} height={22} />
                            <p>{feedback?.totalScore || "---"}/100</p>
                        </div>
                    </div>
                    <p className='line-clamp-2 mt-5'>
                        {feedback?.finalAssessment || "You have not taken this interview yet.Take it now to improve your interview skills."}
                    </p>
                </div>
                <div className='flex flex-row justify-between'>
                    <DisplayTechIcons techStack={techstack} />
                    {resume === "resume" && ResumeFirst ? (
                        ResumeFirst && ResumeFirst?.length > 0 && (
                            <Button className="btn-primary" asChild>
                                <LinkWithLoader href={`/interview/${id}/mcq?resume=1`}>Mock Interview</LinkWithLoader>
                            </Button>
                        )
                    ) : (
                        interview?.mcqs && interview?.mcqs?.length > 0 && (
                            <Button className="btn-primary" asChild>
                                <LinkWithLoader href={`/interview/${id}/mcq`}>Mock Interview</LinkWithLoader>
                            </Button>
                        )
                    )}

                </div>
                <div className='flex flex-row justify-between'>
                    <div className="flex gap-4">
                        <Button className="btn-primary" asChild>
                            <LinkWithLoader
                                href={
                                    feedback
                                        ? resume
                                            ? `/interview/${id}/feedback?resume=1`
                                            : `/interview/${id}/feedback`
                                        : resume
                                            ? `/interview/${id}?resume=1`
                                            : `/interview/${id}`
                                }
                            >
                                {feedback ? "Check Feedback" : "Start Interview"}
                            </LinkWithLoader>
                        </Button>

                        <Button className="btn-secondary" asChild>
                            <LinkWithLoader href={resume ? `/interview/${id}/question?resume=1` : `/interview/${id}/question`} variant="secondary">View Questions</LinkWithLoader>
                        </Button>
                    </div>
                </div>
            </div>

        </div >
    )
}

export default InterviewCard