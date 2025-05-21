import type React from "react"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/layout/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/session-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EC CMS - Multi-Tenant Content Management System",
  description: "A role-based CMS with subdomain multi-tenancy",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen">
              {session ? (
                <>
                  <AppSidebar />
                  <div className="flex-1 overflow-auto">
                    <main>{children}</main>
                  </div>
                </>
              ) : (
                <main className="flex-1">{children}</main>
              )}
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
