import type React from "react";
import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";



export const metadata: Metadata = {
  title: "E-commerce CRM",
  description: "A comprehensive CRM for e-commerce businesses",
  generator: "v0.dev",
};

export default function DashboardPart({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* <DashboardLayout> */}
      <DashboardLayout>
      {children}
      </DashboardLayout>
    
    </div>
  );
  {
    /* Add any additional components or layout elements here */
  }
}
