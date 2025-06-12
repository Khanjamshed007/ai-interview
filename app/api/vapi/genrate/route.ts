import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
import pdf from "pdf-parse";

export async function GET() {
  return Response.json({ success: true, data: "Thank You" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    // Parse multipart form data to get the PDF file
    const formData = await request.formData();
    const pdfFile = formData.get("resume") as File | null;

    // Validate PDF file
    if (!pdfFile) {
      return Response.json(
        { success: false, error: "No resume PDF provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (pdfFile.type !== "application/pdf") {
      return Response.json(
        { success: false, error: "Uploaded file must be a PDF" },
        { status: 400 }
      );
    }

    // Validate file size (e.g., max 5MB)
    if (pdfFile.size > 5 * 1024 * 1024) {
      return Response.json(
        { success: false, error: "PDF file size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Extract text from PDF
    let resumeText: string;
    try {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const data = await pdf(buffer);
      resumeText = data.text.trim();
      if (!resumeText) {
        return Response.json(
          { success: false, error: "No text could be extracted from the PDF" },
          { status: 400 }
        );
      }
    } catch (pdfError) {
      console.error("Failed to parse PDF:", pdfError);
      return Response.json(
        { success: false, error: "Error processing PDF file" },
        { status: 500 }
      );
    }

    // Set default parameters
    const type = "mixed"; // Default to mixed technical and behavioral questions
    const amount = 5; // Default to 5 open-ended questions
    const userid = "anonymous"; // Placeholder; replace with auth-derived user ID in production

    // Generate open-ended questions and answers based on resume
    const { text: openEndedResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions and answers for a job interview based on the following resume content:
        Resume: ${resumeText.substring(0, 5000)}
        The focus should be a mix of behavioural and technical questions.
        The amount of questions required is: ${amount}.
        Return ONLY the questions and answers in the following JSON format, with no additional text, explanations, or code fences:
        [{"question": "Question 1", "answer": "Answer 1"}, {"question": "Question 2", "answer": "Answer 2"}, {"question": "Question 3", "answer": "Answer 3"}]
        Example (do not include this example in the output):
        [{"question": "Describe your experience with React as mentioned in your resume", "answer": "As per my resume, I developed multiple React applications, focusing on component-based architecture and state management with Redux."}, {"question": "How did you optimize performance in your projects?", "answer": "I implemented lazy loading and memoization techniques to improve performance, as noted in my resume."}]
        The questions and answers will be read by a voice assistant, so avoid using special characters like / or *.
        Thank you!`,
    });

    // Generate 25 MCQ questions based on resume
    const { text: mcqResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare 25 multiple-choice questions (MCQs) for a mock job interview based on the following resume content:
        Resume: ${resumeText.substring(0, 5000)}
        The focus should be on technical questions related to the skills and experiences mentioned in the resume.
        Return ONLY the questions in the following JSON format, with no additional text, explanations, or code fences:
        [{"question": "Question 1", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option A"}, {"question": "Question 2", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option B"}]
        Example (do not include this example in the output):
        [{"question": "Which framework did you use for frontend development as per your resume?", "options": ["React", "Angular", "Vue", "Svelte"], "correctAnswer": "React"}, {"question": "What database did you use in your projects?", "options": ["MySQL", "MongoDB", "PostgreSQL", "SQLite"], "correctAnswer": "MongoDB"}]
        The questions and options will be read by a voice assistant, so avoid using special characters like / or *.
        Ensure exactly 25 questions are generated.
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
      console.error(
        "Failed to parse open-ended response:",
        openEndedResponse,
        parseError
      );
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
      resume: resumeText.substring(0, 1000), // Truncate resume text to avoid large data
      type,
      questions: openEndedPairs,
      mcqs: mcqPairs,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to database
    await db.collection("resume_interviews").add(interview);

    return Response.json({ success: true, data: interview }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /resume-interviews:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
