import { formatApiError } from "@/lib/apiError";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import authAdmin from "../../../../middlewares/authAdmin";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storeId, status } = await request.json();

    if (status === "approved") {
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          status: "approved",
          isActive: true,
        },
      });
    } else if (status === "rejected") {
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          status: "rejected",
          isActive: false,
        },
      });
    }

    return NextResponse.json({ message: status + " successfully" });
  } catch (error: any) {
    return formatApiError(error, "Failed to update store approval status");
  }
}

// get all stores that are pending and rejected
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: {
        status: {
          in: ["pending", "rejected"],
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ stores });
  } catch (error: any) {
    return formatApiError(error, "Failed to fetch pending store applications");
  }
}

