import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin":process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // Log request details
    console.log("Received request:", {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    });

    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);

    const { interviewId, userId, answers } = body;

    // Validate input
    if (!interviewId || !userId || !answers || !Array.isArray(answers)) {
      console.log("Validation failed:", { interviewId, userId, answers });
      return Response.json(
        { success: false, error: `Missing or invalid input data - interviewId: ${interviewId}, userId: ${userId}, answers: ${answers}`  },
        { status: 400, headers }
      );
    }

    // Validate answers array is not empty
    if (answers.length === 0) {
      console.log("Empty answers array");
      return Response.json(
        { success: false, error: "Answers array cannot be empty" },
        { status: 400, headers }
      );
    }

    // Check if interview exists
    console.log("Checking interview:", interviewId);
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    if (!interviewDoc.exists) {
      console.log("Interview not found:", interviewId);
      return Response.json(
        { success: false, error: "Interview not found" },
        { status: 404, headers }
      );
    }

    // Prepare submission object
    const submission = {
      interviewId,
      userId,
      answers,
      submittedAt: new Date().toISOString(),
    };

    // Save to database
    console.log("Saving submission:", submission);
    const docRef = await db.collection("mocksubmissions").add(submission);
    console.log("Submission saved, doc ID:", docRef.id);

    return Response.json(
      {
        success: true,
        data: { id: docRef.id, ...submission },
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error in POST /api/vapi/mocksubmission:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return Response.json(
      { success: false, error: error.message || "Failed to save submission" },
      { status: 500, headers }
    );
  }
}