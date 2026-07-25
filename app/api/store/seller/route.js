import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isSeller: false }, { status: 200 });
    }

    const store = await prisma.store.findUnique({
      where: { userId },
    });

    const isSeller = store?.status === "approved";

    return NextResponse.json(
      { isSeller, storeInfo: isSeller ? store : null },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching seller info:", error);
    return NextResponse.json(
      { isSeller: false, error: error.message },
      { status: 200 },
    );
  }
}
