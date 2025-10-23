import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { throttle } from "../../server/rateLimiter";
import { PRICE_IDS, stripe } from "../../server/stripe";

const requestSchema = z.object({
  demoId: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    throttle(`${req.socket.remoteAddress ?? "anonymous"}:subscribe`);
  } catch (throttleError) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const parseResult = requestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  if (!stripe) {
    return res
      .status(500)
      .json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." });
  }

  const successUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000"}/dashboard?checkout=success`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000"}/demo/${parseResult.data.demoId}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: PRICE_IDS.starter,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        demoId: parseResult.data.demoId,
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
