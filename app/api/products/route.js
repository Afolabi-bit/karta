import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    let products = await prisma.product.findMany({
      where: {
        inStock: true,
      },
      include: {
        rating: {
          select: {
            createdAt: true,
            rating: true,
            review: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        store: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Remove products with store inactive

    products = products.filter((p) => p.store.isActive);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
