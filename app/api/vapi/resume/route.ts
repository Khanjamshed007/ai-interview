import { db, adminStorage } from "@/firebase/admin";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";

export async function POST(request: Request) {
  const headers = {
    "Access-Control-Allow-Origin":       process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // Log environment variables for debugging
    console.log("FIREBASE_STORAGE_BUCKET:", process.env.FIREBASE_STORAGE_BUCKET);

    const formData = await request.formData();
    const file = formData.get("resume") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return Response.json(
        { success: false, error: "Missing userId or resume file" },
        { status: 400, headers }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { success: false, error: "File too large (max 5MB)" },
        { status: 400, headers }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = uuidv4();
    const filename = `resumes/${userId}_${uniqueId}.pdf`;

    if (!process.env.FIREBASE_STORAGE_BUCKET) {
      throw new Error("FIREBASE_STORAGE_BUCKET is not defined in environment variables");
    }

    const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    console.log("Bucket Name:", bucket.name); // Debug bucket name

    const fileUpload = bucket.file(filename);
    const downloadToken = uuidv4();

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
        firebaseStorageDownloadTokens: downloadToken,
        userId,
      },
      resumable: false,
    });

    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(filename)}?alt=media&token=${downloadToken}`;

    const metadata = {
      userId,
      fileName: file.name,
      fileUrl,
      uploadedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("resumes").add(metadata);

    return Response.json(
      { success: true, data: { id: docRef.id, ...metadata } },
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    return Response.json(
      { success: false, error: error.message || "Resume upload failed" },
      { status: 500, headers }
    );
  }
}