"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <div className='flex min-h-screen flex-col items-center justify-center'>
            <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-900'>
                        Authentication Error
                    </h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        {error === "Configuration"
                            ? "There is a problem with the server configuration."
                            : error === "AccessDenied"
                            ? "You do not have permission to sign in."
                            : error === "Verification"
                            ? "The verification token has expired or has already been used."
                            : "An error occurred during authentication."}
                    </p>
                </div>
                <div className='mt-4 text-center'>
                    <Link
                        href='/login'
                        className='text-sm font-medium text-blue-600 hover:text-blue-500'
                    >
                        Return to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
