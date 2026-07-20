// Create new order

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@/prisma/generated/client";

export async function POST(request) {
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

    let coupon = null;

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

    //   Check if coupon is applicable to new users

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

    //   Group orders by store Id using a map
    const orderByStore = new Map();

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

      orderByStore.get(storeId).push({
        ...item,
        price: product.price,
      });
    }

    //  create a new order for each store
    let orderId = [];
    let fullAmount = 0;

    let isShippingFeeAdded = false;

    // Create orders for each seller
    for (const [storeId, sellerItems] of orderByStore.entries()) {
      // Calculate total amount for this store
      let total = sellerItems.reduce(
        (acc, item) => acc + item.price * (item.qty || item.quantity || 1),
        0,
      );

      if (couponCode) {
        total -= (total * coupon.discount) / 100;

        if (!isPlusMember && !isShippingFeeAdded) {
          total += 599;
          isShippingFeeAdded = true;
        }
      }

      fullAmount += parseFloat(total.toFixed(2));

      // create order
      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: coupon ? true : false,
          coupon: coupon ? coupon : {},
          orderItems: {
            create: sellerItems.map((item) => ({
              productId: item.id,
              quantity: item.qty || item.quantity || 1,
              price: item.price,
            })),
          },
        },
      });
      orderId.push(order.id);
    }

    // clear the cart
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        cart: {},
      },
    });

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderId: orderId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Get all orders for a user

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: PaymentMethod.COD },
          { AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }] },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
