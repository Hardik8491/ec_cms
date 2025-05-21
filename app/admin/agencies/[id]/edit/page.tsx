import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AgencyForm } from "@/components/admin/agency-form"

export const metadata = {
  title: "Edit Agency | Admin Dashboard",
  description: "Edit an existing agency",
}

export default async function EditAgencyPage({
  params,
}: {
  params: { id: string }
}) {
  const agency = await db.agency.findUnique({
    where: { id: params.id },
  })

  if (!agency) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Agency</h1>
      <AgencyForm agency={agency} />
    </div>
  )
}
