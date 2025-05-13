"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import './styles.css';

interface MockyInterview {
  id: string;
  mcqs: { question: string; options: string[]; correctAnswer: string }[];
}

const McqClient = ({ interview,id}: { interview: any;id:any}) => {
    // State to track selected options for each question
    const [selectedOptions, setSelectedOptions] = useState<{
        [key: number]: string | null;
    }>({});
    // State for error message
    const [error, setError] = useState<string | null>(null);

    console.log(interview);

    // Handle radio button change
    const handleOptionChange = (questionIndex: number, option: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [questionIndex]: option,
        }));
        setError(null); // Clear error when user selects an option
    };

    // Handle form submission
    const handleSubmit = async() => {
        // Check if all questions have a selected option
        const unansweredQuestions = interview.mcqs.some(
            (_: any, index: number) => !selectedOptions[index]
        );

        if (unansweredQuestions) {
            setError("Please answer all questions before submitting.");
            return;
        }

        // Collect selected options
        const submission = interview.mcqs.map((item: any, index: number) => ({
            question: item.question,
            selectedOption: selectedOptions[index],
        }));

        const SubmissionBody={
            interviewId: id,
            userId: interview?.userId,
            answers: submission
        }

        console.log("Submitted answers:", SubmissionBody);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

        await fetch(`${apiBaseUrl}/api/vapi/mocksubmission`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(SubmissionBody),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        })

        setError(null);
        
    };

    return (
        <section className="section-feedback">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Mock Interview Card: <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-row justify-center">
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
                <h2 className="text-center">Questions of the Mock Interview</h2>
                {interview?.mcqs.map((item: any, index: number) => (
                    <div key={index}>
                        <div className="flex flex-row gap-2">
                            <p className="font-bold">{index + 1}.</p>
                            <p>{item.question}</p>
                        </div>
                        <div>
                            {item?.options?.length > 0 ? (
                                item.options.map((option: string, optionIndex: number) => (
                                    <div key={optionIndex} className="radio-input">
                                        <label className="label" htmlFor={`option-${index}-${optionIndex}`}>
                                            <input
                                                type="radio"
                                                id={`option-${index}-${optionIndex}`}
                                                name={`question-${index}`}
                                                value={option}
                                                checked={selectedOptions[index] === option}
                                                onChange={() => handleOptionChange(index, option)}
                                            />
                                            <p className="text">{option}</p>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p>No options available</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-center mt-4">
                    {error}
                </div>
            )}

            <div className="buttons mt-6">
                <Button className="btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </Link>
                </Button>

                <Button
                    className="btn-primary flex-1"
                    onClick={handleSubmit}
                >
                    <p className="text-sm font-semibold text-black text-center">
                        Submit Test
                    </p>
                </Button>
            </div>
        </section>
    );
};

export default McqClient;