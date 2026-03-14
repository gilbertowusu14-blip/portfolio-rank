import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface VerifySuccessResponse {
  paid: true;
  sessionData: string | undefined;
}

interface VerifyFailureResponse {
  paid: false;
}

export async function GET(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { paid: false } as VerifyFailureResponse,
      { status: 200 }
    );
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId || !sessionId.trim()) {
    return NextResponse.json(
      { paid: false } as VerifyFailureResponse,
      { status: 400 }
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const sessionData = session.metadata?.sessionData;
      return NextResponse.json({
        paid: true,
        sessionData,
      } as VerifySuccessResponse);
    }

    return NextResponse.json({ paid: false } as VerifyFailureResponse);
  } catch {
    return NextResponse.json({ paid: false } as VerifyFailureResponse);
  }
}
