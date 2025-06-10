import { MongoClient, GridFSBucket } from "mongodb";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME || "your_db_name"; // Add to your .env.local

export async function POST(req: Request) {
  const headers = {
    "Access-Control-Allow-Origin":
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return Response.json(
        { success: false, error: "Missing userId or resume file" },
        { status: 400, headers }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const client = await new MongoClient(uri).connect();
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: "resumes" });

    const filename = `${userId}_${uuidv4()}.pdf`;

    const readableStream = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { userId, originalName: file.name, contentType: file.type },
    });

    await new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    const metadata = {
      userId,
      fileName: file.name,
      gridFsId: uploadStream.id,
      uploadedAt: new Date().toISOString(),
    };

    await db.collection("resumeMetadata").insertOne(metadata);

    return Response.json({ success: true, data: metadata }, { status: 200, headers });
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    return Response.json(
      { success: false, error: error.message || "Resume upload failed" },
      { status: 500, headers }
    );
  }
}
