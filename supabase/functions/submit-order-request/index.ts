import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRequestData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  cake_type: string;
  event_type: string;
  event_date: string;
  servings: number | null;
  budget: string;
  request_details: string;
  honeypot?: string; // Honeypot field for spam detection
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP address
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";

    // Create Supabase client with service role for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit (3 requests per hour per IP)
    const { data: isAllowed, error: rateLimitError } = await supabase
      .rpc("check_rate_limit", {
        p_ip_address: clientIp,
        p_endpoint: "order_request",
        p_max_requests: 3,
        p_window_minutes: 60,
      });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      // Allow request if rate limit check fails (fail open for UX)
    } else if (!isAllowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter: 3600, // 1 hour in seconds
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" },
        }
      );
    }

    // Parse request body
    const body: OrderRequestData = await req.json();

    // Check honeypot - if filled, silently "succeed" to fool bots
    if (body.honeypot) {
      console.log("Honeypot triggered - bot detected");
      return new Response(
        JSON.stringify({ 
          success: true, 
          id: "fake-" + crypto.randomUUID(),
          message: "Order request submitted successfully" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    const requiredFields = ["customer_name", "customer_phone", "cake_type", "event_date", "request_details"];
    for (const field of requiredFields) {
      if (!body[field as keyof OrderRequestData]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate field lengths
    if (body.customer_name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Customer name must be 100 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.customer_phone.length > 20) {
      return new Response(
        JSON.stringify({ error: "Phone number must be 20 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.request_details && body.request_details.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Request details must be 2000 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format if provided
    if (body.customer_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.customer_email)) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate event date is in the future
    const eventDate = new Date(body.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      return new Response(
        JSON.stringify({ error: "Event date must be in the future" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate servings range if provided
    if (body.servings !== null && (body.servings < 6 || body.servings > 500)) {
      return new Response(
        JSON.stringify({ error: "Servings must be between 6 and 500" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert order request
    const { data: requestData, error: insertError } = await supabase
      .from("order_requests")
      .insert({
        customer_name: body.customer_name.trim().substring(0, 100),
        customer_email: body.customer_email?.trim().substring(0, 255) || null,
        customer_phone: body.customer_phone.trim().substring(0, 20),
        cake_type: body.cake_type.trim().substring(0, 100),
        event_type: body.event_type?.trim().substring(0, 50) || null,
        event_date: body.event_date,
        servings: body.servings,
        budget: body.budget?.trim().substring(0, 50) || null,
        request_details: body.request_details?.trim().substring(0, 2000) || null,
        status: "new",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit order request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email notifications asynchronously
    try {
      const notificationPayload = {
        orderId: requestData.id,
        customerName: body.customer_name,
        customerEmail: body.customer_email || "",
        customerPhone: body.customer_phone,
        cakeType: body.cake_type,
        eventType: body.event_type || "",
        eventDate: body.event_date,
        servings: body.servings,
        budget: body.budget || "",
        requestDetails: body.request_details || "",
      };

      // Call the notification edge function
      const notificationResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-order-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify(notificationPayload),
        }
      );

      if (!notificationResponse.ok) {
        console.error("Notification send failed:", await notificationResponse.text());
      } else {
        console.log("Notifications sent successfully");
      }
    } catch (notificationError) {
      // Don't fail the request if notifications fail
      console.error("Notification error:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: requestData.id,
        message: "Order request submitted successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
