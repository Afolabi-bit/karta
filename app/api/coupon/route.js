import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request) {
  try {
    const { userId, has } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (coupon.forNewUser) {
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

    if (coupon.forMember) {
      const hasPlusPlan = has({ plan: "plus" });

      if (!hasPlusPlan) {
        return NextResponse.json(
          { error: "Coupon valid for members" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth();

    // Check if there is an active coupon for new users
    const activeNewUserCoupon = await prisma.coupon.findFirst({
      where: {
        forNewUser: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (
      !activeNewUserCoupon ||
      typeof activeNewUserCoupon.code !== "string" ||
      activeNewUserCoupon.code.trim().length === 0
    ) {
      return NextResponse.json({ showBanner: false, coupon: null });
    }

    // If user is logged in, check if user has existing orders
    if (userId) {
      const orderCount = await prisma.order.count({
        where: {
          userId,
        },
      });

      if (orderCount > 0) {
        return NextResponse.json({ showBanner: false, coupon: null });
      }
    }

    return NextResponse.json({
      showBanner: true,
      coupon: activeNewUserCoupon,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { showBanner: false, coupon: null },
      { status: 500 },
    );
  }
}

