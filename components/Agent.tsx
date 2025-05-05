"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

// Define the enum for call status
enum CallStatus {
    INACTIVE = "INACTIVE",
    ACTIVE = "ACTIVE",
    CONNECTING = "CONNECTING",
    FINISHED = "FINISHED",
}

// Define interfaces for props and messages
interface SavedMessage {
    role: "user" | "assistant" | "system"; // Corrected typo 'sysrtem' to 'system'
    content: string;
}

interface Message {
    type: string;
    transcriptType?: string;
    role: "user" | "assistant" | "system";
    transcript: string;
}

const Agent = ({ userName, userId, type, questions, interviewId }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    useEffect(() => {
        // Event handlers for VAPI events
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage: SavedMessage = {
                    role: message.role,
                    content: message.transcript,
                };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        console.log(onMessage)
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.error("VAPI Error:", error);

        // Register event listeners
        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        // Cleanup event listeners on component unmount
        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    const handleGenrateFeedback = async (messages: SavedMessage[]) => {
        console.log("Genrate Feedback here")

        const { success, feedbackId: id } = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages
        })

        if (success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        }
        else {
            console.log('Error saving feedback');
            router.push('/')
        }
    }

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === "genrate") {
                router.push("/");
            } else {
                handleGenrateFeedback(messages);
            }
        }
    }, [callStatus, router, type, userId, messages]);

    // Handle starting the call
    const handleCall = async () => {
        console.log("Starting call", type);
        console.log("Questions prop received:", questions);
        setCallStatus(CallStatus.CONNECTING);

        if (type === "genrate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId
                }
            });
        }
        // else {
        //     let formattedQuestions = ""

        //     if (questions) {
        //         formattedQuestions = questions.map((question) => `- ${question}`).join('\n')
        //     }

        //     await vapi.start(interviewer, {
        //         variableValues: {
        //             questions: formattedQuestions
        //         }
        //     })
        // }

    }

    // Handle disconnecting the call
    const handleDisconnect = async () => {
        try {
            await vapi.stop();
            setCallStatus(CallStatus.FINISHED);
        } catch (error) {
            console.error("Failed to stop call:", error);
        }
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished =
        callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className='call-view'>
                <div className='card-interviewer'>
                    <div className='avatar'>
                        <Image src="/ai-avatar.png" alt='vapi' width={65} height={54} className='object-cover' />
                        {isSpeaking && <span className='animate-speak' />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>
                <div className='card-border'>
                    <div className='card-content'>
                        <Image src="/user-avatar.png" alt='vapi' width={540} height={540} className='object-cover size-[120px] rounded-full' />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {messages.length > 0 && (
                <div className='transcript-border'>
                    <div className='transcript'>
                        <p key={latestMessage} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}
            <div className='w-full flex justify-center'>
                {callStatus !== "ACTIVE" ? (
                    <button className='relative btn-call' onClick={handleCall}>
                        <span className={cn("absolute animate-ping rounded-full opacity-75", callStatus !== "CONNECTING" && "hidden")} />
                        <span>{isCallInactiveOrFinished ? "Start Call" : "...."}</span>
                    </button>
                ) : (
                    <button className='btn-disconnect' onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div >
        </>
    );
};

export default Agent;