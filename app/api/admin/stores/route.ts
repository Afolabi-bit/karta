import { formatApiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import authAdmin from "../../../../middlewares/authAdmin";
import prisma from "@/lib/db";

// get all approved stores
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: {
        status: "approved",
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ stores });
  } catch (error: any) {
    return formatApiError(error, "Failed to fetch stores");
  }
}

