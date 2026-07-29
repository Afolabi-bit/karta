import { formatApiError } from "@/lib/apiError";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");

    if (!username)
      return NextResponse.json(
        { error: "Username is missing" },
        { status: 400 },
      );

    const store = await prisma.store.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
        isActive: true,
      },
      include: {
        Product: {
          include: { rating: true },
        },
      },
    });
    if (!store)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    return NextResponse.json(store, { status: 200 });
  } catch (error: any) {
    return formatApiError(error, "Failed to fetch store details");
  }
}

