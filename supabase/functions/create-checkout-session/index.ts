import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the user's JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[create-checkout-session] Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", reason: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with the user's Authorization header so Supabase handles JWT internally
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    console.log("[create-checkout-session] Auth header:", authHeader.slice(0, 30) + "...");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[create-checkout-session] Auth failed:", authError?.message, "| user:", user);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          reason: authError?.message ?? "No user returned from token",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-checkout-session] Authenticated user:", user.id);

    const { event_id } = await req.json();
    const rawOrigin = req.headers.get("origin") || "http://localhost:3000";
    const origin = rawOrigin.includes("vercel.app")
      ? "https://design-harmony-git-dev-discoverakins-projects.vercel.app"
      : rawOrigin;

    // Look up the event price from DB
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, price_cents")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.price_cents <= 0) {
      return new Response(JSON.stringify({ error: "Event is free" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe Checkout Session via REST API
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[]": "card",
        mode: "payment",
        success_url: `${origin}/events/${event_id}?payment=success`,
        cancel_url: `${origin}/events/${event_id}?payment=cancel`,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": event.title,
        "line_items[0][price_data][product_data][description]": `RSVP payment for ${event.title}`,
        "line_items[0][price_data][unit_amount]": String(event.price_cents),
        "line_items[0][quantity]": "1",
        "metadata[event_id]": event.id,
        "metadata[user_id]": user.id,
      }),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("[create-checkout-session] Stripe error:", session);
      return new Response(JSON.stringify({ error: session.error?.message ?? "Stripe error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[create-checkout-session] Stripe session created:", session.id);

    // Insert a pending payment record
    await supabase.from("event_payments").insert({
      event_id: event.id,
      user_id: user.id,
      stripe_session_id: session.id,
      amount_cents: event.price_cents,
      currency: "usd",
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
