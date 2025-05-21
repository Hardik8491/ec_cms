"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function AgencyLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        console.log("onSubmit");
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        console.log("email", email);
        console.log("password", password);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid credentials");
                return;
            }

            // Check if user is an agency user or admin
            const response = await fetch("/api/auth/check-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const { role } = await response.json();

            if (role === "AGENCY_USER" || role === "AGENCY_ADMIN") {
                router.push("/dashboard");
            } else {
                toast.error("Access denied. Agency login only.");
                await signIn("credentials", { redirect: false });
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-100'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <CardTitle>Agency Login</CardTitle>
                    <CardDescription>
                        Sign in to access your agency dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email</Label>
                            <Input
                                id='email'
                                name='email'
                                type='email'
                                placeholder='agency@example.com'
                                required
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                id='password'
                                name='password'
                                type='password'
                                required
                            />
                        </div>
                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
