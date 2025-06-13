import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import pdf from "pdf-parse";

export async function POST(request: Request) {
  try {
    // Parse multipart form data to get userid and file
    const formData = await request.formData();
    const userid = formData.get("userid")?.toString();
    const file = formData.get("file");

    if (!userid || !file || !(file instanceof File) || file.type !== "application/pdf") {
      return Response.json(
        { success: false, error: "Missing userid or valid PDF file" },
        { status: 400 }
      );
    }

    // Read and parse PDF file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdf(buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return Response.json(
        { success: false, error: "No text extracted from the PDF" },
        { status: 400 }
      );
    }

    // Generate open-ended questions and answers based on resume
    const { text: openEndedResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Based on the following resume text, prepare questions and answers for a job interview.
        Resume text: ${resumeText}
        Generate ${5} open-ended questions relevant to the candidate's experience, skills, or projects mentioned in the resume.
        Return ONLY the questions and answers in the following JSON format, with no additional text, explanations, or code fences:
        [{"question": "Question 1", "answer": "Answer 1"}, {"question": "Question 2", "answer": "Answer 2"}]
        The questions and answers will be read by a voice assistant, so avoid using special characters like / or *.
        Thank you!`,
    });

    // Generate 10 MCQ questions based on resume
    const { text: mcqResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Based on the following resume text, prepare 10 multiple-choice questions (MCQs) for a mock job interview.
        Resume text: ${resumeText}
        Focus on technical questions related to the skills, technologies, or projects mentioned in the resume.
        Return ONLY the questions in the following JSON format, with no additional text, explanations, or code fences:
        [{"question": "Question 1", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option A"}, {"question": "Question 2", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option B"}]
        The questions and options will be read by a voice assistant, so avoid using special characters like / or *.
        Ensure exactly 10 questions are generated.
        Thank you!`,
    });

    // Clean and parse open-ended response
    let openEndedPairs;
    try {
      let cleanedResponse = openEndedResponse.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\n|\n```$/g, "");
      cleanedResponse = cleanedResponse.replace(/\n/g, "");
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
      cleanedResponse = cleanedResponse.replace(/^```json\n|\n```$/g, "");
      cleanedResponse = cleanedResponse.replace(/\n/g, "");
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
    if (mcqPairs.length !== 10) {
      console.error("Incorrect number of MCQ questions:", mcqPairs.length);
      return Response.json(
        {
          success: false,
          error: "Expected 10 MCQ questions, received " + mcqPairs.length,
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
      role: "Resume-Based Interview",
      type: "technical",
      level: "unknown",
      techstack: [], // No specific tech stack provided
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
    console.error("Error in POST /resume-interview:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}