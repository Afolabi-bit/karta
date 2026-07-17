import { auth } from "@clerk/nextjs/server";
import authSeller from "../../../../middlewares/authsellers";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// get dashboard data for sellers
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await authSeller(userId);
    if (!storeId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { storeId },
    });

    const products = await prisma.product.findMany({
      where: { storeId },
    });

    const ratings = await prisma.rating.findMany({
      where: {
        productId: {
          in: products.map((p) => p.id),
        },
      },
      include: {
        user: true,
        product: true,
      },
    });

    const dashboardData = {
      totalOrders: orders?.length || 0,
      totalProducts: products?.length || 0,
      ratings,
      totalEarnings:
        orders?.reduce((acc, order) => acc + order?.total, 0) || 0,
    };

    return NextResponse.json({ success: true, dashboardData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
