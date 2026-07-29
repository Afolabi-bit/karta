import { formatApiError } from "@/lib/apiError";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

function getBaseUrl(request: NextRequest): string {
  let envUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
      envUrl = `http://${envUrl}`;
    }
    return envUrl.replace(/\/$/, "");
  }

  const origin = request.headers.get("origin");
  if (origin && (origin.startsWith("http://") || origin.startsWith("https://"))) {
    return origin.replace(/\/$/, "");
  }

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`.replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  try {
    const { userId, has } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod } =
      await request.json();

    if (
      !addressId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let coupon: any = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: {
          code: couponCode,
        },
      });
      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 },
        );
      }
    }

    if (couponCode && coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({
        where: {
          userId,
        },
      });

      if (userOrders.length > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users" },
          { status: 400 },
        );
      }
    }

    const isPlusMember = has({ plan: "plus" });

    if (couponCode && coupon.forMember) {
      if (!isPlusMember) {
        return NextResponse.json(
          { error: "Coupon valid for members" },
          { status: 400 },
        );
      }
    }

    const orderByStore = new Map<string, any[]>();

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: {
          id: item.id,
        },
      });
      const storeId = product?.storeId;

      if (!storeId) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      if (!orderByStore.has(storeId)) {
        orderByStore.set(storeId, []);
      }

      orderByStore.get(storeId)!.push({
        ...item,
        price: product.price,
      });
    }

    const createdOrderIds: string[] = [];

    for (const [storeId, storeItems] of orderByStore.entries()) {
      let storeTotal = storeItems.reduce(
        (sum: number, i: any) => sum + i.price * i.quantity,
        0,
      );

      if (coupon) {
        storeTotal = storeTotal - (storeTotal * coupon.discount) / 100;
      }

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: storeTotal,
          paymentMethod: paymentMethod as PaymentMethod,
          isCouponUsed: Boolean(coupon),
          coupon: coupon || {},
          orderItems: {
            create: storeItems.map((i: any) => ({
              productId: i.id,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      createdOrderIds.push(order.id);
    }

    if (paymentMethod === "STRIPE") {
      const baseUrl = getBaseUrl(request);

      const lineItems = items.map((i: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: i.name,
          },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${baseUrl}/orders`,
        cancel_url: `${baseUrl}/cart`,
        metadata: {
          orderIds: createdOrderIds.join(","),
          userId,
          appId: "karta",
        },
      });

      return NextResponse.json({ session });
    }

    return NextResponse.json({
      message: "Order placed successfully",
      orders: createdOrderIds,
    });
  } catch (error: any) {
    return formatApiError(error, "Failed to place order");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
        store: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return formatApiError(error, "Failed to fetch orders", 500);
  }
}


