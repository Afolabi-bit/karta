import { formatApiError } from "@/lib/apiError";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import authSeller from "../../../middlewares/authsellers";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 },
      );
    }

    await prisma.order.update({
      where: { id: orderId, storeId },
      data: { status },
    });

    return NextResponse.json(
      { message: "Order status updated successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    return formatApiError(error, "Failed to update order status");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        user: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    return formatApiError(error, "Failed to fetch store orders");
  }
}

