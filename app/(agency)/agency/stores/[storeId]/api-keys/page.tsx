// // pages/stores/[storeId]/api-keys/page.tsx
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { redirect, notFound } from "next/navigation";
// import { prisma } from "@/lib/db";
// import ApiKeysPageClient from "./api_client";
// import { Metadata } from "next";

// interface ApiKeysPageProps {
//   params: {
//     storeId: string;
//   };
// }

// // Add Metadata
// export async function generateMetadata({
//   params,
// }: ApiKeysPageProps): Promise<Metadata> {
//   const store = await prisma.store.findUnique({
//     where: { id: params.storeId },
//     select: { name: true },
//   });

//   return {
//     title: store ? `${store.name} - API Keys` : "API Keys",
//     description: `Manage API keys for the store ${
//       store?.name || ""
//     }. Generate, revoke, and view access keys.`,
//   };
// }

// export default async function ApiKeysPage({ params }: ApiKeysPageProps) {
//   const { storeId } = params;
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "agency") {
//     redirect("/dashboard");
//   }

//   const agency = await prisma.agency.findUnique({
//     where: { userId: session.user.id },
//   });

//   if (!agency) {
//     redirect("/agency");
//   }

//   const store = await prisma.store.findUnique({
//     where: {
//       id: storeId,
//       agencyId: agency.id,
//     },
//   });

//   if (!store) {
//     notFound();
//   }

//   const apiKeys = await prisma.apiKey.findMany({
//     where: { storeId },
//     orderBy: { createdAt: "desc" },
//   });

//   const maskedApiKeys = apiKeys.map((key) => ({
//     ...key,
//     key: `${key.key.substring(0, 8)}...${key.key.substring(
//       key.key.length - 4
//     )}`,
//   }));

//   return <ApiKeysPageClient storeId={storeId} maskedApiKeys={maskedApiKeys} />;
// }
