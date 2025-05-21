"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const agencySchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        phone: z.string().optional(),
        website: z
            .string()
            .url("Invalid website URL")
            .optional()
            .or(z.literal("")),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type AgencyFormValues = z.infer<typeof agencySchema>;

export default function AgencyRegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AgencyFormValues>({
        resolver: zodResolver(agencySchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            website: "",
        },
    });

    async function onSubmit(data: AgencyFormValues) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/agency/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    phone: data.phone,
                    website: data.website,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Registration failed");
            }

            toast.success("Registration successful! Please log in.");
            router.push("/auth/agency/login");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Registration failed"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md space-y-8'>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold tracking-tight'>
                        Register Your Agency
                    </h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        Already have an account?{" "}
                        <Link
                            href='/auth/agency/login'
                            className='font-medium text-blue-600 hover:text-blue-500'
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='mt-8 space-y-6'
                    >
                        <div className='space-y-4'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Agency Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter your agency name'
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
                                                type='email'
                                                placeholder='Enter your email'
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
                                            <Input
                                                type='password'
                                                placeholder='Create a password'
                                                {...field}
                                            />
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
                                            <Input
                                                type='password'
                                                placeholder='Confirm your password'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='phone'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Phone Number (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='tel'
                                                placeholder='Enter your phone number'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='website'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Website (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='url'
                                                placeholder='Enter your website URL'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isLoading}
                        >
                            {isLoading ? "Registering..." : "Register Agency"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
