// import type { ReactNode } from "react"
// import { Sidebar } from "@/components/sidebar"
// import { TopNav } from "@/components/top-nav"

// interface DashboardLayoutProps {
//   children: ReactNode
// }

// export function DashboardLayout({ children }: DashboardLayoutProps) {
//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar />
//       <div className="flex flex-col flex-1 overflow-hidden">
//         <TopNav />
//         <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">{children}</main>
//       </div>
//     </div>
//   )
// }

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "../top-nav"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
         <TopNav />
      <main className="flex-1 overflow-y-auto bg-muted/50">{children}</main>
    </div>
    </div>
  )
}
