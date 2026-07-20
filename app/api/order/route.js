// Create new order

import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db";

export async function POST(request) {
  try {
    const { userId, has } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod } =
      await request.json();

    if (
      !addressId ||
      items.length === 0 ||
      !paymentMethod ||
      items ||
      !Array.isArray(items) ||
      items?.length == 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

      let coupon = null;

      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
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
    }
  } catch (error) {}
}
