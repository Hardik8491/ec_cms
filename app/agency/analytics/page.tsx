import { AnalyticsDashboard } from "@/components/agency/analytics-dashboard"

export const metadata = {
  title: "Analytics | Agency Dashboard",
  description: "View your agency analytics",
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <AnalyticsDashboard />
    </div>
  )
}
