import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

const resumeSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  fileType: String,
  fileData: Buffer,
  uploadedAt: String,
});

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ success: false, error: "Missing userId or file" }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 5MB limit" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await connectToDatabase();

    console.log("Mongoose connection state:", mongoose.connection.readyState);

    console.log("Deleting resume for userId:", userId);
    const deleteResult = await Resume.deleteOne({ userId });
    console.log("Delete result:", deleteResult);

    const result = await Resume.create({
      userId,
      fileName: file.name,
      fileType: file.type,
      fileData: buffer,
      uploadedAt: new Date().toISOString(),
    });

    console.log("Inserted resume for user:", userId, "ID:", result._id);

    return NextResponse.json({
      success: true,
      data: { id: result._id, fileUrl: `/api/vapi/resume/${result._id}` },
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const raw = await Resume.find({}, "-fileData").exec();
    console.log("RAW RESUMES:", raw);

    const data = raw.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      uploadedAt: doc.uploadedAt,
      fileUrl: `/api/vapi/resume/${doc._id}`,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error fetching resumes:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}