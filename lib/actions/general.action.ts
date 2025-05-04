import { db } from "@/firebase/admin";

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
    console.log('getInterviewById called with ID:', id); // Debug: Log input ID
    try {
      if (!id) {
        console.error('Invalid ID provided');
        return null;
      }
  
      const interviewDoc = await db.collection('interviews').doc(id).get();
  
      if (!interviewDoc.exists) {
        return null;
      }
  
      const interviewData = interviewDoc.data();
  
      if (!interviewData) {
        return null;
      }
  
      return interviewData as Interview;
    } catch (error) {
      console.error('Error fetching interview with ID:', id, error);
      return null;
    }
  }
