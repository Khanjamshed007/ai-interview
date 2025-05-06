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

    // Generate questions and answers
    const { text: response } = await generateText({
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

    // Clean and parse model response
    let questionAnswerPairs;
    try {
      // Clean response: remove code fences, extra whitespace, or common issues
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\n|\n```$/g, ""); // Remove code fences
      cleanedResponse = cleanedResponse.replace(/\n/g, ""); // Remove newlines
      questionAnswerPairs = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse model response:", response, parseError);
      return Response.json(
        {
          success: false,
          error: "Invalid response format from model",
          rawResponse: response, // Include raw response for debugging
        },
        { status: 500 }
      );
    }

    // Validate response structure
    
    for (const pair of questionAnswerPairs) {
      if (!pair.question || !pair.answer) {
        console.error("Invalid question-answer pair:", pair);
        return Response.json(
          {
            success: false,
            error: "Missing question or answer in response",
            rawResponse: response,
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
      questions: questionAnswerPairs,
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
