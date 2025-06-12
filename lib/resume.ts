// lib/resume.ts

import { Resume } from "@/models/resume";
import { connectToDatabase } from "./mongodb";

// Get all resumes
export async function getAllResumes() {
  await connectToDatabase();
  return Resume.find({});
}

// Get resumes by userId
export async function getResumesByUserId(userId: string) {
  await connectToDatabase();
  return Resume.find({ userId });
}

// Get resume by ID
export async function getResumeById(id: string) {
  await connectToDatabase();
  return Resume.findById(id);
}

// Save new resume
export async function saveResume(data: {
  userId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}) {
  await connectToDatabase();
  const resume = new Resume(data);
  return resume.save();
}
