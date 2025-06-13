import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "Thank You" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("resume") as File | null;

    if (!pdfFile) {
      return Response.json(
        { success: false, error: "No resume PDF provided" },
        { status: 400 }
      );
    }

    if (pdfFile.type !== "application/pdf") {
      return Response.json(
        { success: false, error: "Uploaded file must be a PDF" },
        { status: 400 }
      );
    }

    if (pdfFile.size > 5 * 1024 * 1024) {
      return Response.json(
        { success: false, error: "PDF file size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    let resumeText: string;
    try {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());

      // Validate PDF header
      if (!buffer.toString("utf8", 0, 5).startsWith("%PDF-")) {
        return Response.json(
          { success: false, error: "Invalid PDF file format" },
          { status: 400 }
        );
      }

      // Dynamically import pdf-parse to prevent build-time error
      const { default: pdf } = await import("pdf-parse");

      const data = await pdf(buffer);
      resumeText = data.text.trim();

      if (!resumeText) {
        console.warn("No text extracted from PDF; proceeding with empty resume text");
        resumeText = "No resume content available";
      }
    } catch (pdfError: any) {
      console.error("Failed to parse PDF:", pdfError);
      let errorMessage = "Error processing PDF file";
      if (pdfError.message.includes("Invalid PDF")) {
        errorMessage = "The uploaded PDF is invalid or corrupted";
      } else if (pdfError.message.includes("encrypted")) {
        errorMessage = "The PDF is password-protected or encrypted";
      }
      return Response.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }

    const type = "ai";
    const amount = 5;
    const userid = "anonymous";

    const { text: openEndedResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions and answers for a job interview based on the following resume content:
        Resume: ${resumeText.substring(0, 5000)}
        The focus should be a mix of behavioural and technical questions.
        The amount of questions required is: ${amount}.
        Return ONLY the questions and answers in the following JSON format, with no additional text, explanations, or code fences:
        [{"question": "...", "answer": "..."}]`
    });

    const { text: mcqResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare 25 multiple-choice questions (MCQs) for a mock job interview based on the following resume content:
        Resume: ${resumeText.substring(0, 5000)}
        The focus should be on technical questions.
        Return ONLY the questions in this format:
        [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}]
        Ensure exactly 25 questions.`
    });

    let openEndedPairs;
    try {
      let cleaned = openEndedResponse.trim().replace(/^```json\n|\n```$/g, "").replace(/\n/g, "");
      openEndedPairs = JSON.parse(cleaned);
    } catch (e) {
      return Response.json(
        { success: false, error: "Invalid open-ended response format", rawResponse: openEndedResponse },
        { status: 500 }
      );
    }

    let mcqPairs;
    try {
      let cleaned = mcqResponse.trim().replace(/^```json\n|\n```$/g, "").replace(/\n/g, "");
      mcqPairs = JSON.parse(cleaned);
    } catch (e) {
      return Response.json(
        { success: false, error: "Invalid MCQ response format", rawResponse: mcqResponse },
        { status: 500 }
      );
    }

    if (mcqPairs.length !== 25) {
      return Response.json(
        { success: false, error: `Expected 25 MCQs, got ${mcqPairs.length}`, rawResponse: mcqResponse },
        { status: 500 }
      );
    }

    for (const mcq of mcqPairs) {
      if (
        !mcq.question ||
        !Array.isArray(mcq.options) ||
        mcq.options.length !== 4 ||
        !mcq.correctAnswer ||
        !mcq.options.includes(mcq.correctAnswer)
      ) {
        return Response.json(
          { success: false, error: "Invalid MCQ format", rawResponse: mcqResponse },
          { status: 500 }
        );
      }
    }

    for (const pair of openEndedPairs) {
      if (!pair.question || !pair.answer) {
        return Response.json(
          { success: false, error: "Invalid open-ended Q&A format", rawResponse: openEndedResponse },
          { status: 500 }
        );
      }
    }

    const interview = {
      resume: resumeText.substring(0, 1000),
      type,
      questions: openEndedPairs,
      mcqs: mcqPairs,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("resume_interviews").add(interview);

    return Response.json({ success: true, data: interview }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /resume-interviews:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}