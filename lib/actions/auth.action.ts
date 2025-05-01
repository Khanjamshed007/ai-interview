"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email, password } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "This user already exists",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
      password,
    });
    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error: any) {
    console.error("Error creating a user:", error);

    if (error.code === "auth/email-already-exists") {
      return {
        sucess: false,
        message: "This email already exists",
      };
    }

    return {
      success: false,
      message: "There was an error creating your account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;
  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist.create an account",
      };
    }
    await setSessionCookie(idToken);
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      message: "There was an error signing in",
    };
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(token, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaim = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db.collection("users").doc(decodedClaim.uid).get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function deleteSessionCookie() {
  cookies().delete('session');
}