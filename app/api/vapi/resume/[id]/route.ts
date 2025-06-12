import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const resumeSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  fileType: String,
  fileData: Buffer,
  uploadedAt: String,
});

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const inline = searchParams.get("inline") === "true";

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing file ID" }, { status: 400 });
    }

    await connectToDatabase();
    console.log("Mongoose connection state:", mongoose.connection.readyState);

    const document = await Resume.findById(id).exec();

    if (!document) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const fileData = document.fileData;
    const fileName = document.fileName || "resume.pdf";
    const fileType = document.fileType || "application/pdf";

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        "Content-Type": fileType,
        "Content-Disposition": inline ? "inline" : `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error("File retrieval error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to retrieve file" }, { status: 500 });
  }
}