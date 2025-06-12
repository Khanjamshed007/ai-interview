import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  gridFsId: mongoose.Schema.Types.ObjectId,
  uploadedAt: String,
});

// ✅ Force correct collection name
export const Resume =
  mongoose.models.Resume || mongoose.model("Resume", resumeSchema, "resumeMetadata");
