// edit - user - form.tsx;

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
import { User, Agency } from "@/types";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email.",
    }),
    role: z.enum(["ADMIN", "AGENCY_OWNER", "STORE_OWNER", "USER"]),
    agencyId: z.string().optional().nullable(),
});

type EditUserFormProps = {
    user: User;
    agencies: Agency[];
};

export function EditUserForm({ user, agencies }: EditUserFormProps) {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
            role: user.role,
            agencyId: user.agency?.id || null,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to update user");
            }

            toast({
                title: "Success",
                description: "User updated successfully",
            });

            router.push(`/admin/users/${user.id}`);
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
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter name'
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
                                        placeholder='Enter email'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='role'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a role' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='ADMIN'>
                                            Admin
                                        </SelectItem>
                                        <SelectItem value='AGENCY_OWNER'>
                                            Agency Owner
                                        </SelectItem>
                                        <SelectItem value='STORE_OWNER'>
                                            Store Owner
                                        </SelectItem>
                                        <SelectItem value='USER'>
                                            User
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='agencyId'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agency</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || undefined}
                                    defaultValue={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select an agency' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={undefined}>
                                            None
                                        </SelectItem>
                                        {agencies.map((agency) => (
                                            <SelectItem
                                                key={agency.id}
                                                value={agency.id}
                                            >
                                                {agency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end gap-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                        Cancel
                    </Button>
                    <Button type='submit'>Save Changes</Button>
                </div>
            </form>
        </Form>
    );
}
