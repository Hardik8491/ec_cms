"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bell, Settings } from "lucide-react";
import { CreateStoreDialog } from "@/components/dashboard/create-store-dialog";

interface Agency {
    id: string;
    name: string;
    email: string;
    phone?: string;
    website?: string;
    logo?: string;
}

export function AgencyHeader() {
    const { data: session } = useSession();
    const [agency, setAgency] = useState<Agency | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        const fetchAgencyDetails = async () => {
            if (session?.user?.agencyId) {
                try {
                    const response = await fetch(
                        `/api/agencies/${session.user.agencyId}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setAgency(data.agency);
                    }
                } catch (error) {
                    console.error("Error fetching agency details:", error);
                }
            }
        };

        fetchAgencyDetails();
    }, [session?.user?.agencyId]);

    if (!agency) {
        return null;
    }

    return (
        <header className='bg-white border-b'>
            <div className='container mx-auto px-6 py-4'>
                <div className='flex items-center justify-between'>
                    {/* Agency Info */}
                    <div className='flex items-center space-x-4'>
                        {agency.logo ? (
                            <img
                                src={agency.logo}
                                alt={agency.name}
                                className='h-10 w-10 rounded-full object-cover'
                            />
                        ) : (
                            <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center'>
                                <span className='text-lg font-semibold text-gray-600'>
                                    {agency.name.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div>
                            <h1 className='text-xl font-semibold'>
                                {agency.name}
                            </h1>
                            <p className='text-sm text-gray-500'>
                                {agency.email}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center space-x-4'>
                        <Button
                            variant='outline'
                            size='icon'
                            className='relative'
                            title='Notifications'
                        >
                            <Bell className='h-5 w-5' />
                            <span className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center'>
                                3
                            </span>
                        </Button>
                        <Button variant='outline' size='icon' title='Settings'>
                            <Settings className='h-5 w-5' />
                        </Button>
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className='ml-2'
                        >
                            <PlusCircle className='mr-2 h-4 w-4' />
                            Create Store
                        </Button>
                    </div>
                </div>
            </div>

            <CreateStoreDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </header>
    );
}
