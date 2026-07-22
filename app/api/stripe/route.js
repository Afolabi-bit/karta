import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId } = await auth();
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

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderIds, userid, appId } = session.data[0].metadata;
      if (appId !== "karta") {
        return NextResponse.json(
          { received: true },
          { message: "Invalid application id" },
        );
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: {
                id: orderId,
              },
              data: {
                isPaid: true,
              },
            });
          }),
        );

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            cart: {},
          },
        });
      } else {
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.delete({
              where: {
                id: orderId,
              },
            });
          }),
        );
      }
    };

    if (event.type === "payment_intent.succeeded") {
      await handlePaymentIntent(event.data.object.id, true);
    } else if (event.type === "payment_intent.canceled") {
      await handlePaymentIntent(event.data.object.id, false);
    } else {
      console.log("Unhandle event type:", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler error" },
      { status: 400 },
    );
  }
}
