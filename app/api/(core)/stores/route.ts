import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import next from "next";

const prisma = new PrismaClient();

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     // Only admin and agency can create stores
//     if (session.user.role !== "admin" && session.user.role !== "agency") {
//       return NextResponse.json({ message: "Forbidden" }, { status: 403 });
//     }

//     const { name, description } = await request.json();

//     if (!name) {
//       return NextResponse.json(
//         { message: "Store name is required" },
//         { status: 400 }
//       );
//     }

//     // For regular users, check if they already have a store
//     if (session.user.role === "user") {
//       const existingStore = await prisma.store.findFirst({
//         where: {
//           userId: session.user.id,
//         },
//       });

//       if (existingStore) {
//         return NextResponse.json(
//           { message: "You already have a store" },
//           { status: 400 }
//         );
//       }
//     }

//     const store = await prisma.store.create({
//       data: {
//         name,
//         description,
//         userId: session.user.id,
//       },
//     });

//     return NextResponse.json(store, { status: 201 });
//   } catch (error) {
//     console.error("Error creating store:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      logo,
      bannerImage,
      subdomain,
      currency,
      userId,
      agencyId,
      vendorId,
      isMarketplace,
      commissionRate,
      aiEnabled,
      channels,
      createdAt,
    } = body;
console.log(userId)
    if (!name || !userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newStore = await prisma.store.create({
      data: {
        name,
        description: description || null,
        logo: logo || null,
        bannerImage: bannerImage || null,
        subdomain: subdomain || null,
        currency: currency || 'USD',
        userId,
        agencyId, // Assuming the userId is the agencyId
        vendorId: vendorId || null,
        isMarketplace: isMarketplace ?? false,
        commissionRate: commissionRate ?? 10,
        aiEnabled: aiEnabled ?? true,
        channels: channels || {},
        createdAt: createdAt ? new Date(createdAt) : undefined, // optional
      },
    });

    return NextResponse.json({ message: 'Store created successfully', store: newStore }, { status: 201 });
    return NextResponse.json({ message: 'Store created successfully', store: body }, { status: 201 });
  } catch (error: any) {
    console.error('Store creation error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin can see all stores
    if (session.user.role === "admin") {
      const stores = await prisma.store.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      return NextResponse.json(stores);
    }

    // Agency and users can only see their own stores
    const stores = await prisma.store.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
