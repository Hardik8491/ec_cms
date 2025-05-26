import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getStoreWithStats } from "@/services/store-service";
import { getRecentProducts, getRecentOrders } from "@/services/product-service";
import { StoreView } from "./components/stores_client";

interface StorePageProps {
  params: {
    storeId: string;
  };
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { storeId } = params;

  // You might want to fetch minimal store data here for metadata
  // Or use a lighter query than getStoreWithStats
  const store = await getStoreWithStats(storeId);

  if (!store) {
    return {
      title: "Store not found",
      description: "The requested store does not exist",
    };
  }

  return {
    title: `${store.name} - Dashboard`,
    description: store.description || `Manage your ${store.name} store`,
    openGraph: {
      title: `${store.name} - Dashboard`,
      description: store.description || `Manage your ${store.name} store`,
      url: `https://yourdomain.com/agency/stores/${storeId}`,
      siteName: "Your Platform Name",
      images: [
        {
          url: store.logo || "/default-store-image.jpg",
          width: 800,
          height: 600,
          alt: store.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${store.name} - Dashboard`,
      description: store.description || `Manage your ${store.name} store`,
      images: [store.logo || "/default-store-image.jpg"],
    },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeId } = params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "agency") {
    redirect("/dashboard");
  }

  // Fetch data
  const store = await getStoreWithStats(storeId, session.user.id);
  const recentProducts = await getRecentProducts(storeId);
  const recentOrders = await getRecentOrders(storeId);

  if (!store) {
    notFound();
  }

  return (
    <StoreView
      store={store}
      recentProducts={recentProducts}
      recentOrders={recentOrders}
    />
  );
}
