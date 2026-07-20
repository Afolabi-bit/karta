import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request) {
  try {
    const { orderId, productId, rating, review } = await request.json();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }

    const isAlreadyRated = await prisma.rating.findFirst({
      where: { productId, orderId },
    });

    if (isAlreadyRated) {
      return NextResponse.json(
        { error: "You already rated this product" },
        { status: 400 },
      );
    }

    const response = await prisma.rating.create({
      data: { userId, productId, rating, review, orderId },
    });

    return NextResponse.json({ message: "Rating added successfully", rating: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ratings = await prisma.rating.findMany({
      where: { userId },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
