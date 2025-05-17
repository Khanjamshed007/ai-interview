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
                <div className='flex flex-row'>
                    <h1 className="text-xl font-bold">Correct Answers: {NumberCorrect}</h1>
                    <h1 className="text-xl font-bold">Incorrect Answers: {NumberIncorrect}</h1>
                </div>
            </div>
            <div className="flex flex-col">
                {interview?.mcqs.map((item: any, index: number) => (
                    <div key={index}>
                        <div className="flex flex-row gap-2 mb-3 mt-2">
                            <p className="font-bold">{index + 1}.</p>
                            <p className='font-bold text-lg'>{item.question}</p>
                        </div>
                        <div className='ml-3'>
                            <p className='font-bold text-lg mb-2'>options:</p>
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
        </div>
    );
}

export default pages