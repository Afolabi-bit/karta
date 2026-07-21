import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event;

    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
          { error: `Webhook Error: ${err.message}` },
          { status: 400 },
        );
      }
    } else {
      event = JSON.parse(rawBody);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderIdsString = session.metadata?.orderIds;

      if (orderIdsString) {
        const orderIds = orderIdsString.split(",");

        await prisma.order.updateMany({
          where: {
            id: {
              in: orderIds,
            },
          },
          data: {
            isPaid: true,
          },
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler error" },
      { status: 500 },
    );
  }
}
