import { formatApiError } from "@/lib/apiError";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ isAdmin });
  } catch (error: any) {
    return formatApiError(error, "Failed to verify admin status");
  }
}

