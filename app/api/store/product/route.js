import { auth } from "@clerk/nextjs/server";
import authSeller from "../../../../middlewares/authsellers";
import imagekit from "@/config/imagekit";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    //Require auth before doing anything else
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await authSeller(userId);
    if (!storeId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = Number(formData.get("price"));
    const mrp = Number(formData.get("mrp"));
    const category = formData.get("category");
    const images = formData.getAll("images");

    if (!name || !description || !price || !mrp || !category || !images)
      return NextResponse.json(
        { error: "Missing required product details" },
        { status: 400 },
      );

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await imagekit.files.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        const url = imagekit.url({
          path: result.filePath,
          transformation: [
            { width: 1024 },
            { quality: "auto" },
            { format: "webp" },
          ],
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
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}

// Get all products for a seller
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await authSeller(userId);
    if (!storeId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const products = await prisma.product.findMany({
      where: { storeId },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
