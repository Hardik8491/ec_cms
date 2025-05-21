"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
    .object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters" }),
        email: z
            .string()
            .email({ message: "Please enter a valid email address" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" }),
        confirmPassword: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to register");
            }

            toast({
                title: "Registration successful",
                description: "Redirecting to dashboard...",
            });

            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='space-y-1'>
                    <CardTitle className='text-2xl font-bold'>
                        Create an Account
                    </CardTitle>
                    <CardDescription>
                        Enter your details to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-4'
                        >
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
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
                                                placeholder='email@example.com'
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
                                                placeholder='••••••••'
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
                                                placeholder='••••••••'
                                                {...field}
                                            />
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
                                    : "Create account"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className='flex flex-col'>
                    <p className='mt-2 text-center text-sm text-muted-foreground'>
                        Already have an account?{" "}
                        <Link
                            href='/login'
                            className='text-primary hover:underline'
                        >
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
