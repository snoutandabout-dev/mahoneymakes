import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cakeType: string;
  eventType: string;
  eventDate: string;
  servings: number | null;
  budget: string;
  requestDetails: string;
}

async function sendEmail(
  resendApiKey: string,
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Mahoney Makes <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API error:", errorData);
      return { success: false, error: errorData.message || "Failed to send email" };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: NotificationRequest = await req.json();

    // Get notification email from settings
    const { data: settingsData } = await supabase
      .from("business_settings")
      .select("setting_value")
      .eq("setting_key", "notification_email")
      .single();

    const bakerEmail = settingsData?.setting_value || "jhnewsome@gmail.com";

    const eventDateFormatted = new Date(body.eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send notification to baker
    const bakerEmailHtml = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; border-bottom: 2px solid #D4A574; padding-bottom: 10px;">
          🎂 New Order Request!
        </h1>
        
        <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #5D4037; margin-top: 0;">Customer Details</h2>
          <p><strong>Name:</strong> ${body.customerName}</p>
          <p><strong>Email:</strong> ${body.customerEmail || "Not provided"}</p>
          <p><strong>Phone:</strong> ${body.customerPhone}</p>
        </div>
        
        <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #5D4037; margin-top: 0;">Order Details</h2>
          <p><strong>Cake Type:</strong> ${body.cakeType}</p>
          <p><strong>Event Type:</strong> ${body.eventType || "Not specified"}</p>
          <p><strong>Event Date:</strong> ${eventDateFormatted}</p>
          <p><strong>Servings:</strong> ${body.servings || "Not specified"}</p>
          <p><strong>Budget:</strong> ${body.budget || "Not specified"}</p>
        </div>
        
        <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #5D4037; margin-top: 0;">Request Details</h2>
          <p style="white-space: pre-wrap;">${body.requestDetails || "No additional details"}</p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Order ID: ${body.orderId}
        </p>
      </div>
    `;

    const bakerResult = await sendEmail(
      resendApiKey,
      bakerEmail,
      `New Order Request from ${body.customerName}`,
      bakerEmailHtml
    );

    if (!bakerResult.success) {
      console.error("Failed to send baker notification:", bakerResult.error);
    }

    // Send confirmation to customer if email provided
    let customerResult: { success: boolean; error?: string } = { success: true };
    if (body.customerEmail) {
      const customerEmailHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B4513; border-bottom: 2px solid #D4A574; padding-bottom: 10px;">
            Thank You for Your Order Request!
          </h1>
          
          <p>Dear ${body.customerName},</p>
          
          <p>We've received your custom cake order request and we're so excited to help make your event special!</p>
          
          <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #5D4037; margin-top: 0;">Your Request Summary</h2>
            <p><strong>Cake Type:</strong> ${body.cakeType}</p>
            <p><strong>Event Type:</strong> ${body.eventType || "Not specified"}</p>
            <p><strong>Event Date:</strong> ${eventDateFormatted}</p>
            <p><strong>Servings:</strong> ${body.servings || "Not specified"}</p>
            <p><strong>Budget:</strong> ${body.budget || "Not specified"}</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <p>I'll review your request and get back to you within 24-48 hours with more details about pricing and availability.</p>
          
          <p>If you have any questions in the meantime, feel free to reach out!</p>
          
          <p style="margin-top: 30px;">
            With love and butter,<br>
            <strong>Mahoney Makes</strong>
          </p>
          
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            Reference: ${body.orderId}
          </p>
        </div>
      `;

      customerResult = await sendEmail(
        resendApiKey,
        body.customerEmail,
        "We Received Your Cake Order Request! 🎂",
        customerEmailHtml
      );

      if (!customerResult.success) {
        console.error("Failed to send customer confirmation:", customerResult.error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        bakerNotified: bakerResult.success,
        customerNotified: customerResult.success,
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
