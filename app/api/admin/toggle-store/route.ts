import { formatApiError } from "@/lib/apiError";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import authAdmin from "../../../../middlewares/authAdmin";
import prisma from "@/lib/db";

// toggle store isActive
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

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: "Missing store id" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive: !store.isActive,
      },
    });

    return NextResponse.json({
      message: `Store is now ${updatedStore.isActive ? "active" : "inactive"}`,
      isActive: updatedStore.isActive,
    });
  } catch (error: any) {
    return formatApiError(error, "Failed to toggle store status");
  }
}

