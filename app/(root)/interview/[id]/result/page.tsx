import LinkWithLoader from '@/components/LinkWithLoader';
import { Button } from '@/components/ui/button';
import { getInterviewById, getMockResultById } from '@/lib/actions/general.action';
import React from 'react'

const pages = async ({ params }: RouteParams) => {
    const { id } = await params;
    const MockData = await getMockResultById(id);
    const interview = await getInterviewById(MockData?.interviewId!);

    console.log(MockData);
    console.log(interview);

    const answers = MockData?.answers?.map((item: any) => item.selectedOption);
    const correctAnswer = interview?.mcqs?.map((item: any) => item?.correctAnswer);
    console.log(correctAnswer)
    console.log(answers);

    const NumberCorrect = answers?.filter((answer: any, index: number) => answer === correctAnswer[index]).length;
    const NumberIncorrect = answers?.filter((answer: any, index: number) => answer !== correctAnswer[index]).length;

    console.log(NumberCorrect);
    console.log(NumberIncorrect);

    return (
        <div className="flex items-center justify-center flex-col">
            <div className='flex flex-row justify-between'>
                <h1 className="text-3xl font-bold mb-6">Mock Result</h1>
            </div>
            <div className="flex flex-row gap-3 mb-5">
                <h1 className="text-md font-semibold text-green-700 bg-green-100 border border-green-300 rounded-md px-4 py-2">
                    ✅ Correct Answers: {NumberCorrect}
                </h1>
                <h1 className="text-md font-semibold text-red-700 bg-red-100 border border-red-300 rounded-md px-4 py-2">
                    ❌ Incorrect Answers: {NumberIncorrect}
                </h1>
            </div>

            <div className="flex flex-col">
                {interview?.mcqs.map((item: any, index: number) => (
                    <div key={index}>
                        <div className="flex flex-row gap-2 mb-3 mt-2">
                            <p className="font-bold">{index + 1}.</p>
                            <p className='font-bold text-lg'>{item.question}</p>
                        </div>
                        <div className='ml-3'>
                            <p className='font-semibold text-lg mb-2'>options:</p>
                            {item?.options?.length > 0 ? (
                                item.options.map((option: string, optionIndex: number) => (
                                    <div key={optionIndex} className="radio-input">
                                        <label className="label" htmlFor={`option-${index}-${optionIndex}`}>
                                            <p
                                                className="text mb-2"
                                                style={{
                                                    border:
                                                        option === item.correctAnswer
                                                            ? "2px solid green"
                                                            : option === answers[index]
                                                                ? "2px solid red"
                                                                : "",
                                                    width: 'fit-content',
                                                    padding: '3px 10px',
                                                    borderRadius: '5px'
                                                }}
                                            >
                                                {option}
                                            </p>
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

            <div className="buttons mt-6">
                <Button className="btn-secondary flex-1">
                    <LinkWithLoader href="/" variant="secondary">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </LinkWithLoader>
                </Button>

            </div>
        </div>
    );
}

export default pages