import { NextResponse } from "next/server";

/**
 * Sanitizes backend API errors so that raw database codes (e.g. Prisma P2002),
 * stack traces, or technical error strings are logged on the server but never
 * returned in the response payload to the frontend.
 */
export function formatApiError(
  error: unknown,
  defaultMessage: string = "An error occurred. Please try again later.",
  statusCode: number = 400
): NextResponse {
  console.error("[API_ERROR]", error);

  let message = defaultMessage;

  if (error && typeof error === "object") {
    const err = error as any;
    if (typeof err.message === "string" && err.message.trim().length > 0) {
      const msg = err.message.trim();
      const isPrismaError =
        msg.includes("PrismaClient") ||
        msg.includes("Invalid `prisma.") ||
        msg.includes("ConnectorError") ||
        /^P2\d{3}/.test(msg);
      const isTechnicalError =
        msg.includes("ERR_") ||
        msg.includes("Request failed with status code") ||
        msg.includes("ECONNREFUSED");

      if (!isPrismaError && !isTechnicalError) {
        message = msg;
      }
    }
  } else if (typeof error === "string" && error.trim().length > 0) {
    if (!/^P2\d{3}/.test(error) && !error.includes("ERR_")) {
      message = error;
    }
  }

  return NextResponse.json({ error: message }, { status: statusCode });
}
