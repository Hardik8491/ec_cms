import { AgencyForm } from "@/components/admin/agency-form"

export const metadata = {
  title: "Create Agency | Admin Dashboard",
  description: "Create a new agency in the system",
}

export default function NewAgencyPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Agency</h1>
      <AgencyForm />
    </div>
  )
}
