import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event;

    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
          { error: `Webhook Error: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      event = JSON.parse(rawBody);
    }

    const processOrderPayment = async (orderIds, targetUserId, isPaid) => {
      if (!orderIds) return;
      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: { id: orderId },
              data: { isPaid: true },
            });
          })
        );

        if (targetUserId) {
          await prisma.user.update({
            where: { id: targetUserId },
            data: { cart: {} },
          });
        }
      } else {
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.delete({
              where: { id: orderId },
            });
          })
        );
      }
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { orderIds, userId, userid, appId } = session.metadata || {};
      if (appId === "karta" || appId === "gocart") {
        await processOrderPayment(orderIds, userId || userid, true);
      }
    } else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });
      if (sessions.data && sessions.data.length > 0) {
        const { orderIds, userId, userid, appId } = sessions.data[0].metadata || {};
        if (appId === "karta" || appId === "gocart") {
          await processOrderPayment(orderIds, userId || userid, true);
        }
      }
    } else if (event.type === "payment_intent.canceled") {
      const paymentIntent = event.data.object;
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });
      if (sessions.data && sessions.data.length > 0) {
        const { orderIds, userId, userid, appId } = sessions.data[0].metadata || {};
        if (appId === "karta" || appId === "gocart") {
          await processOrderPayment(orderIds, userId || userid, false);
        }
      }
    } else {
      console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler error" },
      { status: 400 }
    );
  }
}

