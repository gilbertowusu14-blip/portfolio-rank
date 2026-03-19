import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface CheckoutRequestBody {
  sessionData: string;
  reportKey?: string;
}

const STRIPE_METADATA_VALUE_MAX_LENGTH = 500;

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!secretKey || !priceId || !baseUrl) {
    const missing = [
      !secretKey && "STRIPE_SECRET_KEY",
      !priceId && "STRIPE_PRICE_ID",
      !baseUrl && "NEXT_PUBLIC_BASE_URL",
    ].filter(Boolean);
    const message =
      process.env.NODE_ENV === "development"
        ? `Checkout is not configured. Missing: ${missing.join(", ")}`
        : "Checkout is not configured";
    console.error("Checkout 503:", message);
    return NextResponse.json({ error: message }, { status: 503 });
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON body";
    console.error("Checkout body parse error:", err);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { sessionData, reportKey } = body;
  if (typeof sessionData !== "string" || !sessionData.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid sessionData" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    // Stripe metadata values are limited to 500 chars; truncate to avoid API error
    const metadataSessionData =
      sessionData.length > STRIPE_METADATA_VALUE_MAX_LENGTH
        ? sessionData.slice(0, STRIPE_METADATA_VALUE_MAX_LENGTH)
        : sessionData;

    const metadata: Record<string, string> = { sessionData: metadataSessionData };
    const reportKeyTrimmed = typeof reportKey === "string" && reportKey.trim() ? reportKey.trim() : null;
    if (reportKeyTrimmed) {
      metadata.reportKey = reportKeyTrimmed;
    }

    const successUrl = reportKeyTrimmed
      ? `${baseUrl}/result/premium?session_id={CHECKOUT_SESSION_ID}&analysis_id=${encodeURIComponent(reportKeyTrimmed)}`
      : `${baseUrl}/result/premium?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 249,
            product_data: {
              name: "Rankfolio Premium",
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: `${baseUrl}/result`,
      metadata,
    });

    const url = session.url;
    if (!url) {
      console.error("Stripe session created but url is missing", session.id);
      return NextResponse.json(
        { error: "Could not create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe checkout error:", err);
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { error: isDev ? message : "Checkout failed" },
      { status: 503 }
    );
  }
}
