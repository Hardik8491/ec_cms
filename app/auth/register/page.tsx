"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),
        confirmPassword: z.string(),
        agencyName: z
            .string()
            .min(2, "Agency name must be at least 2 characters"),
        agencySlug: z
            .string()
            .min(2, "Agency slug must be at least 2 characters")
            .regex(
                /^[a-z0-9-]+$/,
                "Agency slug can only contain lowercase letters, numbers, and hyphens"
            ),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            agencyName: "",
            agencySlug: "",
        },
    });

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        try {
            setIsLoading(true);
            console.log("[register] Attempting to register agency and user:", {
                email: values.email,
                agencyName: values.agencyName,
            });

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    agencyName: values.agencyName,
                    agencySlug: values.agencySlug,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("[register] Registration failed:", data);
                throw new Error(data.message || "Registration failed");
            }

            console.log("[register] Registration successful:", {
                email: values.email,
                agencyName: values.agencyName,
            });
            toast.success("Registration successful! Please log in.");
            router.push("/auth/agency/login");
        } catch (error) {
            console.error("[register] Error during registration:", error);
            toast.error(
                error instanceof Error ? error.message : "Registration failed"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='container flex h-screen w-screen flex-col items-center justify-center'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                <div className='flex flex-col space-y-2 text-center'>
                    <h1 className='text-2xl font-semibold tracking-tight'>
                        Create an Agency Account
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Enter your agency and account details below
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='agencyName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agency Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='My Agency'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='agencySlug'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agency Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='my-agency'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='John Doe'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='john@example.com'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type='password' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='confirmPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type='password' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Creating account..."
                                : "Create agency account"}
                        </Button>
                    </form>
                </Form>

                <p className='px-8 text-center text-sm text-muted-foreground'>
                    Already have an account?{" "}
                    <Link
                        href='/auth/agency/login'
                        className='underline underline-offset-4 hover:text-primary'
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
