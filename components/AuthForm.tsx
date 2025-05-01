"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
    Form
} from "@/components/ui/form"


const authSchema = (type: FormType) => {
    return z.object({
        name: type === "sign-up" ? z.string().min(3, { message: "Name must be at least 3 characters" }).max(50, { message: "Name must not be more than 50 characters" }) : z.string().optional(),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(50, { message: "Password must not exceed 50 characters" }),
    });
};

import React, { useState } from 'react'
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import FormFields from "./FormFields"
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"


const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const formSchema = authSchema(type)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if (type === "sign-up") {
                const { name, email, password } = values;
                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredentials.user, { displayName: name });
                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password,
                });

                if (!result?.success) {
                    toast.error(result?.message);
                    return;
                }
                toast.success("Account created successfully");
                router.push('/sign-in');
            } else {
                const { email, password } = values;
                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                const idToken = await userCredential.user.getIdToken();
                if (!idToken) {
                    toast.error("There was an error signing in");
                    return;
                }
                await signIn({
                    email,
                    idToken,
                });
                toast.success("Signed in successfully");
                router.push('/');
            }
        } catch (error: any) {
            console.error(error);
            // Handle Firebase auth errors for sign-in
            if (error.code === 'auth/invalid-credential' ||
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/wrong-password') {
                toast.error("Invalid email or password");
            } else {
                toast.error(`There was an error: ${error.message || error}`);
            }
        }
        finally {
            setIsLoading(false);
        }
    }

    const isSignIn = type === "sign-in"
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" width={38} height={32} alt="logo" />
                    <h2 className="text-primary-100">JDPrep</h2>
                </div>
                <h3 className="text-center">Practice job interview with AI</h3>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormFields
                                name="name"
                                control={form.control}
                                label="Name"
                                placeholder="Your Name"
                            />
                        )}
                        <FormFields
                            name="email"
                            control={form.control}
                            label="Email"
                            placeholder="Your Email Address"
                            type="email"
                        />
                        <FormFields
                            name="password"
                            control={form.control}
                            label="Password"
                            placeholder="Your Password"
                            type="password"
                        />
                        <Button className="btn" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {isSignIn ? "Signing In..." : "Signing Up..."}
                                </>
                            ) : (
                                <>{isSignIn ? "Sign In" : "Sign Up"}</>
                            )}
                        </Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? "No account yet?" : "Already have an account?"}{" "}
                    <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="text-primary-200 cursor-pointer">{isSignIn ? "Sign Up" : "Sign In"}</Link>
                </p>
            </div>
        </div>
    )
}

export default AuthForm
