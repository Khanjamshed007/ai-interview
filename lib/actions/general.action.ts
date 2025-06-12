"use server";

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../mongodb";
import { Resume } from "@/models/resume";

export async function getInterviewByUerId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[];
}

export async function getLatestInterview(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  // Debug: Log input ID
  try {
    if (!id) {
      console.error("Invalid ID provided");
      return null;
    }

    const interviewDoc = await db.collection("interviews").doc(id).get();

    if (!interviewDoc.exists) {
      return null;
    }

    const interviewData = interviewDoc.data();

    if (!interviewData) {
      return null;
    }

    return interviewData as Interview;
  } catch (error) {
    console.error("Error fetching interview with ID:", id, error);
    return null;
  }
}
export async function getMockResultById(
  id: string
): Promise<MockResult | null> {
  // Debug: Log input ID
  try {
    if (!id) {
      console.error("Invalid ID provided");
      return null;
    }

    const mockResultDoc = await db.collection("mocksubmissions").doc(id).get();

    if (!mockResultDoc.exists) {
      return null;
    }

    const mockResultData = mockResultDoc.data();

    if (!mockResultData) {
      return null;
    }

    return mockResultData as MockResult;
  } catch (error) {
    console.error("Error fetching mock result with ID:", id, error);
    return null;
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const {
      object: {
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
      },
    } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (error) {
    console.log("Error saving feedback", error);
    return { success: false, error: error };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) return null;

  const feedbackDoc = feedback.docs[0];

  return {
    id: feedbackDoc.id,
    ...feedbackDoc.data(),
  } as Feedback;
}

// lib/actions/getResumes.ts
export async function getResumes() {
  try {
    const res = await fetch("http://localhost:3000/api/vapi/resume");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch resumes");
    return data.data;
  } catch (error) {
    console.error("Client: Error fetching resumes:", error);
    return [];
  }
}
// general.action.ts
export async function getResumesById(id: string) {
  try {
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/vapi/resume/${id}?inline=true`, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch resume (status: ${response.status})`);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `resume-${id}.pdf`;
    if (contentDisposition && contentDisposition.includes('filename=')) {
      fileName = contentDisposition
        .split('filename=')[1]
        .replace(/"/g, '')
        .trim();
    }

    return {
      fileUrl: `${baseUrl}/api/vapi/resume/${id}?inline=true`, // API URL for viewing
      fileUrlDownload: `${baseUrl}/api/vapi/resume/${id}`, // API URL for downloading
      fileName,
      fileType: response.headers.get('content-type') || 'application/pdf',
    };
  } catch (error) {
    console.error('Client: Error fetching resume:', error);
    return null;
  }
}
