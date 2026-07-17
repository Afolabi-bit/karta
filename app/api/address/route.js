import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add new address
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { address } = await request.json();

    address.userId = userId;

    // save address to DB

    const newAddress = await prisma.address.create({ data: address });

    return NextResponse.json(
      { newAddress, message: "Address added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}

// get all addresses for a user
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ addresses }, { status: 200 });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
