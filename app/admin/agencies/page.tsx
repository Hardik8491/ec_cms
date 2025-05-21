import { db } from "@/lib/db"
import { AgenciesTable } from "@/components/admin/agencies-table"

export const metadata = {
  title: "Agencies | Admin Dashboard",
  description: "Manage all agencies in the system",
}

export default async function AgenciesPage() {
  const agencies = await db.agency.findMany({
    include: {
      _count: {
        select: {
          users: true,
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-6">
      <AgenciesTable agencies={agencies} />
    </div>
  )
}
