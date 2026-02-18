import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const eventId = session.metadata?.event_id;
    const userId = session.metadata?.user_id;

    if (!eventId || !userId) {
      return new Response("Missing metadata", { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark payment as completed
    await supabase
      .from("event_payments")
      .update({ status: "completed" })
      .eq("stripe_session_id", session.id);

    // Auto-RSVP the user
    await supabase
      .from("event_rsvps")
      .upsert(
        { event_id: eventId, user_id: userId },
        { onConflict: "event_id,user_id" }
      );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
