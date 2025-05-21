"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    slug: z
        .string()
        .min(2, { message: "Slug must be at least 2 characters" })
        .regex(/^[a-z0-9-]+$/, {
            message:
                "Slug can only contain lowercase letters, numbers, and hyphens",
        }),
    logo: z.string().url({ message: "Please enter a valid URL" }).optional(),
});

interface CreateAgencyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateAgencyDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateAgencyDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            logo: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const response = await fetch("/api/agencies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create agency");
            }

            toast({
                title: "Success",
                description: "Agency created successfully",
            });

            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Agency</DialogTitle>
                    <DialogDescription>
                        Create a new agency to manage multiple stores
                    </DialogDescription>
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
                                    <FormLabel>Agency Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter agency name'
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
                                    <FormLabel>Agency Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='enter-agency-slug'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='logo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo URL (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='https://example.com/logo.png'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Agency"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
