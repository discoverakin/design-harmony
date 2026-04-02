import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const sig = parts["v1"];

  if (!timestamp || !sig) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${body}`)
  );

  const expectedSig = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === sig;
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("[stripe-webhook] Missing stripe-signature header");
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.text();

  try {
    const valid = await verifyStripeSignature(body, signature, endpointSecret);
    if (!valid) {
      console.error("[stripe-webhook] Signature verification failed");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    console.log("[stripe-webhook] Event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const eventId = session.metadata?.event_id;
      const userId = session.metadata?.user_id;

      console.log("[stripe-webhook] session.id:", session.id, "eventId:", eventId, "userId:", userId);

      if (!eventId || !userId) {
        console.error("[stripe-webhook] Missing metadata");
        return new Response(JSON.stringify({ error: "Missing metadata" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Mark payment as completed
      const { error: paymentError } = await supabase
        .from("event_payments")
        .update({ status: "completed" })
        .eq("stripe_session_id", session.id);

      if (paymentError) {
        console.error("[stripe-webhook] Payment update error:", paymentError.message);
      } else {
        console.log("[stripe-webhook] Payment marked completed for session:", session.id);
      }

      // Auto-RSVP the user
      const { error: rsvpError } = await supabase
        .from("event_rsvps")
        .upsert(
          { event_id: eventId, user_id: userId },
          { onConflict: "event_id,user_id" }
        );

      if (rsvpError) {
        console.error("[stripe-webhook] RSVP upsert error:", rsvpError.message);
      } else {
        console.log("[stripe-webhook] RSVP created for user:", userId, "event:", eventId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-webhook] Unexpected error:", (err as Error).message);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
