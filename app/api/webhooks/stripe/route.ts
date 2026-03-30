import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[WEBHOOK] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Subscription created or updated
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: subscription.status, // "active" | "past_due" etc.
            subscriptionId: subscription.id,
          },
        });
        break;
      }

      // Subscription canceled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: "canceled",
            subscriptionId: null,
          },
        });
        break;
      }

      // Checkout completed — ensure user is marked active immediately
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.metadata?.userId) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await prisma.user.update({
            where: { id: session.metadata.userId },
            data: {
              subscriptionStatus: subscription.status,
              subscriptionId: subscription.id,
              stripeCustomerId: session.customer as string,
            },
          });
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK] Handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
