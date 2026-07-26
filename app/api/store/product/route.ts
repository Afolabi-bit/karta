import { auth } from "@clerk/nextjs/server";
import authSeller from "../../../../middlewares/authsellers";
import imagekit from "@/config/imagekit";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { toFile } from "@imagekit/nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await authSeller(userId);
    if (!storeId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const mrp = Number(formData.get("mrp"));
    const rawPrice = formData.get("price");
    const category = formData.get("category")?.toString();
    const images = formData.getAll("images") as File[];

    if (
      !name ||
      !description ||
      !mrp ||
      isNaN(mrp) ||
      mrp <= 0 ||
      !category ||
      !images ||
      images.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required product details" },
        { status: 400 },
      );
    }

    let price =
      rawPrice !== null && rawPrice !== undefined && rawPrice !== ""
        ? Number(rawPrice)
        : mrp;

    if (isNaN(price) || price <= 0) {
      price = mrp;
    }

    if (price > mrp) {
      return NextResponse.json(
        { error: "Offer price cannot be greater than actual price" },
        { status: 400 },
      );
    }

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileObject = await toFile(buffer, image.name);
        const result = await imagekit.files.upload({
          file: fileObject,
          fileName: image.name,
          folder: "products",
        });

        const url = imagekit.helper.buildSrc({
          urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
          src: result.filePath || "",
          transformation: [{ width: 1024, quality: "auto", format: "webp" }] as any[],
        });
        return url;
      }),
    );

    await prisma.product.create({
      data: {
        storeId,
        name,
        description,
        price,
        mrp,
        category,
        images: imagesUrl,
      },
    });

    return NextResponse.json(
      { message: "Product added successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
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

    const products = await prisma.product.findMany({
      where: {
        storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

