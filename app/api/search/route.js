import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";

    if (!query.trim()) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        store: {
          isActive: true,
        },
        OR: [
          { name: { contains: query.trim(), mode: "insensitive" } },
          { description: { contains: query.trim(), mode: "insensitive" } },
          { category: { contains: query.trim(), mode: "insensitive" } },
        ],
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
      take: 20,
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
