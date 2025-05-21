"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

const storeSchema = z.object({
    name: z.string().min(2, "Store name must be at least 2 characters"),
    slug: z
        .string()
        .min(2, "Store slug must be at least 2 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Store slug can only contain lowercase letters, numbers, and hyphens"
        ),
    description: z.string().optional(),
    currency: z.string().default("USD"),
    userEmail: z.string().email("Invalid email format"),
    userName: z.string().min(2, "Name must be at least 2 characters"),
    userPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface CreateStoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateStoreDialog({
    open,
    onOpenChange,
}: CreateStoreDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<StoreFormValues>({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            currency: "USD",
            userEmail: "",
            userName: "",
            userPassword: "",
        },
    });

    async function onSubmit(data: StoreFormValues) {
        try {
            setIsLoading(true);
            const response = await fetch("/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create store");
            }

            const result = await response.json();
            router.push(`/dashboard/store/${result.store.id}`);
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error creating store:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Create New Store</DialogTitle>
                </DialogHeader>
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
                                    <FormLabel>Store Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='My Awesome Store'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='slug'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Store Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='my-awesome-store'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Tell us about your store...'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='currency'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='border-t pt-4'>
                            <h3 className='text-lg font-medium mb-4'>
                                Store User Account
                            </h3>

                            <FormField
                                control={form.control}
                                name='userName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Name</FormLabel>
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
                                name='userEmail'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='email'
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
                                name='userPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Password</FormLabel>
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
                        </div>

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Create Store"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
