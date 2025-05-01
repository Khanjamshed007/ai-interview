"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
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

import React from 'react'
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import FormFields from "./FormFields"
import { useRouter } from "next/navigation"


const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
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
    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (type === "sign-up") {
                toast.success("Account created successfully")
                router.push('/sign-in')
            } else {
                toast.success("Signed in successfully")
                router.push('/')
            }
        } catch (error) {
            console.log(error)
            toast.error(`There was an error: ${error}`)
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
                        <Button className="btn" type="submit">{isSignIn ? "Sign In" : "Creat an account"}</Button>
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
