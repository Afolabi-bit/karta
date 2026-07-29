import { formatApiError } from "@/lib/apiError";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
  } catch (error: any) {
    return formatApiError(error, "Failed to update cart");
  }
}

// get user cart
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return NextResponse.json({ cart: user?.cart }, { status: 200 });
  } catch (error: any) {
    return formatApiError(error, "Failed to fetch cart");
  }
}

