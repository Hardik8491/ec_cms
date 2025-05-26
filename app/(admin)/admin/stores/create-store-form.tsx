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
    subdomain: z
        .string()
        .min(3, {
            message: "Subdomain must be at least 3 characters.",
        })
        .regex(/^[a-z0-9-]+$/, {
            message:
                "Subdomain can only contain lowercase letters, numbers, and hyphens.",
        }),
    currency: z.string().length(3),
    userId: z.string({
        required_error: "Please select an owner.",
    }),
    agencyId: z.string().optional().nullable(),
    vendorId: z.string().optional().nullable(),
    isMarketplace: z.boolean().default(false),
    commissionRate: z.number().min(0).max(100).default(10),
    aiEnabled: z.boolean().default(true),
});

export function CreateStoreForm({
    users,
    agencies,
    
}: {
    users: { id: string  ; name: string | null; email: string }[];
    agencies: { id: string; name: string }[];
    vendors: { id: string; name: string }[];
}) {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            logo: "",
            subdomain: "",
            currency: "USD",
            isMarketplace: false,
            commissionRate: 10,
            aiEnabled: true,
        },
    });

    const isMarketplace = form.watch("isMarketplace");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch("/api/admin/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to create store");
            }

            const data = await response.json();

            toast({
                title: "Success",
                description: "Store created successfully",
            });

            router.push(`/admin/stores/${data.id}`);
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
                                        placeholder='Enter store name'
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
                                            placeholder='your-store'
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
                                                value={user.id }
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
                        name='currency'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue='USD'
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select currency' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='USD'>
                                            USD ($)
                                        </SelectItem>
                                        <SelectItem value='EUR'>
                                            EUR (€)
                                        </SelectItem>
                                        <SelectItem value='GBP'>
                                            GBP (£)
                                        </SelectItem>
                                        <SelectItem value='JPY'>
                                            JPY (¥)
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
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select an agency' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={""}>
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

                    <FormField
                        control={form.control}
                        name='vendorId'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vendor</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a vendor' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={""}>
                                            None
                                        </SelectItem>
                                      
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
                                        placeholder='Brief description of the store'
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
                        name='isMarketplace'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                <div className='space-y-0.5'>
                                    <FormLabel className='text-base'>
                                        Marketplace
                                    </FormLabel>
                                    <p className='text-sm text-muted-foreground'>
                                        Enable marketplace features
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

                    {isMarketplace && (
                        <FormField
                            control={form.control}
                            name='commissionRate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commission Rate (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            min='0'
                                            max='100'
                                            placeholder='10'
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

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
                                        Enable AI capabilities for this store
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
                </div>

                <div className='flex justify-end gap-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => router.push("/admin/stores")}
                    >
                        Cancel
                    </Button>
                    <Button type='submit'>Create Store</Button>
                </div>
            </form>
        </Form>
    );
}
