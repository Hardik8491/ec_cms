"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    logo: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    subdomain: z
        .string()
        .min(3, {
            message: "Subdomain must be at least 3 characters.",
        })
        .regex(/^[a-z0-9-]+$/, {
            message:
                "Subdomain can only contain lowercase letters, numbers, and hyphens.",
        }),
    userId: z.string({
        required_error: "Please select an owner.",
    }),
    aiEnabled: z.boolean().default(true),
    aiCredits: z.number().min(0).default(1000),
});

export function CreateAgencyForm({
    users,
}: {
    users: { id: string; name: string; email: string }[];
}) {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            logo: "",
            website: "",
            subdomain: "",
            aiEnabled: true,
            aiCredits: 1000,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch("/api/admin/agencies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to create agency");
            }

            const data = await response.json();

            toast({
                title: "Success",
                description: "Agency created successfully",
            });

            router.push(`/admin/agencies/${data.id}`);
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name *</FormLabel>
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
                        name='subdomain'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subdomain *</FormLabel>
                                <FormControl>
                                    <div className='flex'>
                                        <Input
                                            placeholder='your-agency'
                                            {...field}
                                        />
                                        <span className='flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-md text-sm'>
                                            .yourplatform.com
                                        </span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='userId'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Owner *</FormLabel>
                                <Select onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select an owner' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        placeholder='Brief description of the agency'
                                        className='resize-none'
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
                                <FormLabel>Logo URL</FormLabel>
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

                    <FormField
                        control={form.control}
                        name='website'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='https://example.com'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='aiEnabled'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                <div className='space-y-0.5'>
                                    <FormLabel className='text-base'>
                                        AI Features
                                    </FormLabel>
                                    <p className='text-sm text-muted-foreground'>
                                        Enable AI capabilities for this agency
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='aiCredits'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Initial AI Credits</FormLabel>
                                <FormControl>
                                    <Input
                                        type='number'
                                        min='0'
                                        placeholder='1000'
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                parseInt(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end gap-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => router.push("/admin/agencies")}
                    >
                        Cancel
                    </Button>
                    <Button type='submit'>Create Agency</Button>
                </div>
            </form>
        </Form>
    );
}
