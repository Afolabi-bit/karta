import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import authSeller from "@/middlewares/authsellers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isSeller = await authSeller(userId);
    if (!isSeller)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeInfo = await prisma.store.findUnique({
      where: { userId },
    });
    return NextResponse.json({ isSeller, storeInfo }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
