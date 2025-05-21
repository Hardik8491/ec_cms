"use client";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: ReactNode }) {
    // You can add custom logic here, e.g. redirect if not authenticated, etc.

    return (
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
            {children}
        </SessionProvider>
    );
}
