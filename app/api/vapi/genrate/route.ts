import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "Thank You" }, { status: 200 });
}


export async function POST(request: Request) {
  try {
    // Parse request body
    const { type, role, level, techstack, amount, userid } = await request.json();

    // Generate open-ended questions and answers
    const { text: openEndedResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions and answers for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Return ONLY the questions and answers in the following JSON format, with no additional text, explanations, or code fences:
        [{"question": "Question 1", "answer": "Answer 1"}, {"question": "Question 2", "answer": "Answer 2"}, {"question": "Question 3", "answer": "Answer 3"}]
        Example for a Software Engineer role (do not include this example in the output):
        [{"question": "Explain event delegation in JavaScript", "answer": "Event delegation is a technique where a single event listener is added to a parent element to manage events on its children, leveraging event bubbling to improve performance."}, {"question": "What is a closure?", "answer": "A closure is a function that retains access to its lexical scope, even when executed outside that scope, allowing for data encapsulation."}]
        The questions and answers will be read by a voice assistant, so avoid using special characters like / or *.
        Thank you!`,
    });

    // Generate 25 MCQ questions
    const { text: mcqResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare 25 multiple-choice questions (MCQs) for a mock job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus should be on technical questions related to the tech stack.
        Return ONLY the questions in the following JSON format, with no additional text, explanations, or code fences:
        [{"question": "Question 1", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option A"}, {"question": "Question 2", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option B"}]
        Example for a Software Engineer role (do not include this example in the output):
        [{"question": "What is the primary purpose of React's useState hook?", "options": ["Manage component state", "Handle API calls", "Optimize rendering", "Control routing"], "correctAnswer": "Manage component state"}, {"question": "Which HTTP method is used for updating resources?", "options": ["GET", "POST", "PUT", "DELETE"], "correctAnswer": "PUT"}]
        The questions and options will be read by a voice assistant, so avoid using special characters like / or *.
        Ensure exactly 25 questions are generated.
        Thank you!`,
    });

    // Clean and parse open-ended response
    let openEndedPairs;
    try {
      let cleanedResponse = openEndedResponse.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\n|\n```$/g, ""); // Remove code fences
      cleanedResponse = cleanedResponse.replace(/\n/g, ""); // Remove newlines
      openEndedPairs = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse open-ended response:", openEndedResponse, parseError);
      return Response.json(
        {
          success: false,
          error: "Invalid open-ended response format from model",
          rawResponse: openEndedResponse,
        },
        { status: 500 }
      );
    }

    // Clean and parse MCQ response
    let mcqPairs;
    try {
      let cleanedResponse = mcqResponse.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\n|\n```$/g, ""); // Remove code fences
      cleanedResponse = cleanedResponse.replace(/\n/g, ""); // Remove newlines
      mcqPairs = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse MCQ response:", mcqResponse, parseError);
      return Response.json(
        {
          success: false,
          error: "Invalid MCQ response format from model",
          rawResponse: mcqResponse,
        },
        { status: 500 }
      );
    }

    // Validate open-ended response structure
    for (const pair of openEndedPairs) {
      if (!pair.question || !pair.answer) {
        console.error("Invalid open-ended question-answer pair:", pair);
        return Response.json(
          {
            success: false,
            error: "Missing question or answer in open-ended response",
            rawResponse: openEndedResponse,
          },
          { status: 500 }
        );
      }
    }

    // Validate MCQ response structure
    if (mcqPairs.length !== 25) {
      console.error("Incorrect number of MCQ questions:", mcqPairs.length);
      return Response.json(
        {
          success: false,
          error: "Expected 25 MCQ questions, received " + mcqPairs.length,
          rawResponse: mcqResponse,
        },
        { status: 500 }
      );
    }

    for (const pair of mcqPairs) {
      if (
        !pair.question ||
        !pair.options ||
        pair.options.length !== 4 ||
        !pair.correctAnswer ||
        !pair.options.includes(pair.correctAnswer)
      ) {
        console.error("Invalid MCQ structure:", pair);
        return Response.json(
          {
            success: false,
            error: "Invalid MCQ structure in response",
            rawResponse: mcqResponse,
          },
          { status: 500 }
        );
      }
    }

    // Prepare interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((tech: string) => tech.trim()),
      questions: openEndedPairs,
      mcqs: mcqPairs,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to database
    await db.collection("interviews").add(interview);

    return Response.json({ success: true, data: interview }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /interviews:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
