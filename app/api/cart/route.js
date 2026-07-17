import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cart } = await request.json();

    // save cart to DB

    await prisma.user.update({
      where: { id: userId },
      data: {
        cart: cart,
      },
    });

    return NextResponse.json(
      { message: "Cart updated successfully" },
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

// get user cart
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return NextResponse.json({ cart: user?.cart }, { status: 200 });
  } catch (error) {
    console.error("Error getting cart:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
