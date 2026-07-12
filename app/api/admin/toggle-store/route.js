import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "../../../../middlewares/authAdmin";
import prisma from "@/lib/db";

// toggle store isActive
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "not logged in" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: "missing store id" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 404 });
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive: !store.isActive,
      },
    });

    return NextResponse.json({
      message: "store updated (toggled) successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
