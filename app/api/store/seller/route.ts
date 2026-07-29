import { formatApiError } from "@/lib/apiError";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isSeller: false }, { status: 200 });
    }

    const store = await prisma.store.findUnique({
      where: { userId },
    });

    const hasStore = Boolean(store);
    const isSeller = store?.status === "approved";

    return NextResponse.json(
      { isSeller, hasStore, storeInfo: store },
      { status: 200 },
    );
  } catch (error: any) {
    return formatApiError(error, "Failed to verify seller status");
  }
}

