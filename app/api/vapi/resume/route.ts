import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ success: false, error: "Missing userId or file" }, { status: 400 });
    }

    // Max file size: 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 5MB limit" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const db = await connectToDatabase();
    const collection = db.collection("resumes");

    const result = await collection.insertOne({
      userId,
      fileName: file.name,
      fileType: file.type,
      fileData: buffer,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { id: result.insertedId } });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}

// app/api/resume/route.ts

export async function GET() {
  try {
    await connectToDatabase();

    const raw = await mongoose.connection.db
      .collection("resumeMetadata")
      .find({})
      .toArray();

    console.log("RAW RESUMES:", raw); // <-- this should 100% log your data

    return NextResponse.json({ success: true, data: raw });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

