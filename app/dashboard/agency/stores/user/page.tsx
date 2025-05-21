"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Settings } from "lucide-react";

export default function UserDashboard() {
    return (
        <div className='space-y-6'>
            <h1 className='text-3xl font-bold'>User Dashboard</h1>
            <div className='grid gap-4 md:grid-cols-2'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            My Stores
                        </CardTitle>
                        <Store className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>3</div>
                        <p className='text-xs text-muted-foreground'>
                            Stores under your management
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Account Settings
                        </CardTitle>
                        <Settings className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>Active</div>
                        <p className='text-xs text-muted-foreground'>
                            Your account is active and in good standing
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
