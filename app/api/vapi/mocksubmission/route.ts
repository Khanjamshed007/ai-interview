import { db } from "@/firebase/admin";

const headers = {
  "Access-Control-Allow-Origin": "http://localhost:3000", // or set dynamically via env
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  // Preflight request handler for CORS
  return new Response(null, {
    status: 204,
    headers,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewId, userId, answers } = body;

    if (!interviewId || !userId || !answers || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing or invalid input data",
        }),
        { status: 400, headers }
      );
    }

    if (answers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Answers array cannot be empty",
        }),
        { status: 400, headers }
      );
    }

    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    if (!interviewDoc.exists) {
      return new Response(
        JSON.stringify({ success: false, error: "Interview not found" }),
        { status: 404, headers }
      );
    }

    const submission = {
      interviewId,
      userId,
      answers,
      submittedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("mocksubmissions").add(submission);

    return new Response(
      JSON.stringify({ success: true, data: { id: docRef.id, ...submission } }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Error submitting:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Submission failed" }),
      { status: 500, headers }
    );
  }
}
