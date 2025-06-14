import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
    getFeedbackByInterviewId,
    getInterviewById,
    getResumeInterviewById,
    getResumeInterviewByUerId,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Question = async ({ params, searchParams }: RouteParams) => {
    const { id } = await params;
    const { resume } = await searchParams;
    const user = await getCurrentUser();
    const userId = user?.id
    console.log(user)
    const interview = resume
        ? await getResumeInterviewById(id!)
        : await getInterviewById(id);
    if (!interview) redirect("/");

    console.log(interview)

    return (
        <section className="section-feedback">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Interview Card: <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-row justify-center ">
                <div className="flex flex-row gap-5">

                    {/* Date */}
                    <div className="flex flex-row gap-2">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>
                            {interview?.createdAt
                                ? dayjs(interview.createdAt).format("MMM D, YYYY h:mm A")
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            <hr />


            {/* Interview Breakdown */}
            <div className="flex flex-col gap-4">
                <h2>Questions of the Interview:</h2>
                {interview?.questions?.map((question, index) => (
                    <div key={index}>
                        <p className="font-bold" key={index}>
                            {index + 1}. {question?.question}?
                            <br />
                            <br />
                            Explanation: <p className="text-primary-200 font-medium">
                                {question?.answer}
                            </p>
                        </p>
                    </div>
                ))}
            </div>


            <div className="buttons">
                <Button className="btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </Link>
                </Button>

                <Button className="btn-primary flex-1">
                    <Link
                        href={`/interview/${id}`}
                        className="flex w-full justify-center"
                    >
                        <p className="text-sm font-semibold text-black text-center">
                            Take a Interview
                        </p>
                    </Link>
                </Button>
            </div>
        </section>
    );
};

export default Question;
