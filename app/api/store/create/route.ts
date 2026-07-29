import { formatApiError } from "@/lib/apiError";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import imagekit from "@/config/imagekit";
import { toFile } from "@imagekit/nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const USERNAME_REGEX = /^[A-Za-z0-9_\-$#@&]+$/;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const usernameRaw = formData.get("username")?.toString();
    const description = formData.get("description")?.toString();
    const email = formData.get("email")?.toString();
    const contact = formData.get("contact")?.toString();
    const address = formData.get("address")?.toString();
    const image = formData.get("image");

    if (
      !name ||
      !usernameRaw ||
      !description ||
      !email ||
      !contact ||
      !address ||
      !image
    ) {
      return NextResponse.json(
        { error: "Missing required store info" },
        { status: 400 },
      );
    }

    const username = usernameRaw.trim();

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username can only contain letters, numbers, hyphens, underscores, $, #, @, and &",
        },
        { status: 400 },
      );
    }

    if (!(image instanceof File) || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid image file" },
        { status: 400 },
      );
    }
    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image must be smaller than 5MB" },
        { status: 400 },
      );
    }

    const existingStore = await prisma.store.findFirst({
      where: { userId },
    });

    if (existingStore) {
      return NextResponse.json(
        {
          error: "You already have a store",
          storeStatus: existingStore.status,
        },
        { status: 409 },
      );
    }

    const usernameExists = await prisma.store.findFirst({
      where: { username },
    });

    if (usernameExists) {
      return NextResponse.json(
        { error: "Store name already taken" },
        { status: 400 },
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let imageData: any;
    try {
      const fileObject = await toFile(buffer, image.name);
      imageData = await imagekit.files.upload({
        file: fileObject,
        fileName: image.name,
        folder: "stores",
      });

      const url = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
        src: imageData.filePath || "",
        transformation: [
          { width: 1024, quality: "auto", format: "webp" },
        ] as any[],
      });
      if (!url) {
        throw new Error("ImageKit did not return a URL for the uploaded file");
      }
      imageData.url = url;
    } catch (uploadErr) {
      console.error("ImageKit upload failed:", uploadErr);
      return NextResponse.json(
        { error: "Failed to upload store image" },
        { status: 502 },
      );
    }

    try {
      const newStore = await prisma.$transaction(async (tx) => {
        if (!imageData.url) {
          throw new Error(
            "ImageKit did not return a URL for the uploaded file",
          );
        }
        const store = await tx.store.create({
          data: {
            userId,
            name,
            username,
            description,
            email,
            contact,
            address,
            logo: imageData.url,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { store: { connect: { id: store.id } } },
        });

        return store;
      });

      return NextResponse.json({
        message: "Applied, waiting for approval",
        status: newStore.status,
      });
    } catch (dbErr: any) {
      console.error("Store creation failed, cleaning up upload:", dbErr);
      try {
        if (imageData?.fileId) {
          await imagekit.files.delete(imageData.fileId);
        }
      } catch (cleanupErr) {
        console.error("Failed to clean up orphaned ImageKit file:", cleanupErr);
      }

      if (dbErr.code === "P2002") {
        return NextResponse.json(
          { error: "Store name already taken" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create store" },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("Store application error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingStore = await prisma.store.findFirst({
      where: { userId },
    });

    if (existingStore) {
      return NextResponse.json({
        message: "User already has a store",
        status: existingStore.status,
      });
    }

    return NextResponse.json({
      message: "User does not have a store",
      status: "not registered",
    });
  } catch (error: any) {
    return formatApiError(error, "Failed to check store status");
  }
}

