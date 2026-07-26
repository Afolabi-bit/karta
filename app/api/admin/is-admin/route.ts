import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    return NextResponse.json({ isAdmin });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
