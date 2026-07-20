import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
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
      return NextResponse.json({ error: "Store not found" }, { status: 400 });

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
