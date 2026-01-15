import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, CheckCircle, Receipt, FileText } from "lucide-react";

type TemplateType = "new_request" | "order_confirmed" | "payment_receipt";

interface PreviewData {
  customerName: string;
  customerEmail: string;
  cakeType: string;
  eventType: string;
  eventDate: string;
  servings: number;
  budget: string;
  requestDetails: string;
  orderId: string;
  paymentAmount: number;
  paymentType: string;
  paymentMethod: string;
  totalPaid: number;
  remainingBalance: number;
}

const sampleData: PreviewData = {
  customerName: "Jane Smith",
  customerEmail: "jane@example.com",
  cakeType: "3-Tier Wedding Cake",
  eventType: "Wedding",
  eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  servings: 100,
  budget: "$500-$700",
  requestDetails: "White fondant with blush pink roses. Would love gold leaf accents if possible!",
  orderId: "abc12345",
  paymentAmount: 250,
  paymentType: "deposit",
  paymentMethod: "Venmo",
  totalPaid: 250,
  remainingBalance: 450,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function NewRequestBakerTemplate({ data }: { data: PreviewData }) {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ color: "#8B4513", borderBottom: "2px solid #D4A574", paddingBottom: 10 }}>
        🎂 New Order Request!
      </h1>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Customer Details</h2>
        <p><strong>Name:</strong> {data.customerName}</p>
        <p><strong>Email:</strong> {data.customerEmail || "Not provided"}</p>
        <p><strong>Phone:</strong> (555) 123-4567</p>
      </div>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Order Details</h2>
        <p><strong>Cake Type:</strong> {data.cakeType}</p>
        <p><strong>Event Type:</strong> {data.eventType || "Not specified"}</p>
        <p><strong>Event Date:</strong> {formatDate(data.eventDate)}</p>
        <p><strong>Servings:</strong> {data.servings || "Not specified"}</p>
        <p><strong>Budget:</strong> {data.budget || "Not specified"}</p>
      </div>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Request Details</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{data.requestDetails || "No additional details"}</p>
      </div>
      
      <p style={{ color: "#888", fontSize: 12, marginTop: 30 }}>
        Order ID: {data.orderId}
      </p>
    </div>
  );
}

function NewRequestCustomerTemplate({ data }: { data: PreviewData }) {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ color: "#8B4513", borderBottom: "2px solid #D4A574", paddingBottom: 10 }}>
        Thank You for Your Order Request!
      </h1>
      
      <p>Dear {data.customerName},</p>
      
      <p>We've received your custom cake order request and we're so excited to help make your event special!</p>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Your Request Summary</h2>
        <p><strong>Cake Type:</strong> {data.cakeType}</p>
        <p><strong>Event Type:</strong> {data.eventType || "Not specified"}</p>
        <p><strong>Event Date:</strong> {formatDate(data.eventDate)}</p>
        <p><strong>Servings:</strong> {data.servings || "Not specified"}</p>
        <p><strong>Budget:</strong> {data.budget || "Not specified"}</p>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <p>I'll review your request and get back to you within 24-48 hours with more details about pricing and availability.</p>
      
      <p>If you have any questions in the meantime, feel free to reach out!</p>
      
      <p style={{ marginTop: 30 }}>
        With love and butter,<br />
        <strong>Mahoney Makes</strong>
      </p>
      
      <p style={{ color: "#888", fontSize: 12, marginTop: 30 }}>
        Reference: {data.orderId}
      </p>
    </div>
  );
}

function OrderConfirmedBakerTemplate({ data }: { data: PreviewData }) {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ color: "#8B4513", borderBottom: "2px solid #D4A574", paddingBottom: 10 }}>
        ✅ Request Converted to Order!
      </h1>
      
      <p style={{ color: "#5D4037" }}>A customer request has been converted to an official order.</p>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Customer Details</h2>
        <p><strong>Name:</strong> {data.customerName}</p>
        <p><strong>Email:</strong> {data.customerEmail || "Not provided"}</p>
        <p><strong>Phone:</strong> (555) 123-4567</p>
      </div>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Order Details</h2>
        <p><strong>Cake Type:</strong> {data.cakeType}</p>
        <p><strong>Event Type:</strong> {data.eventType || "Not specified"}</p>
        <p><strong>Event Date:</strong> {formatDate(data.eventDate)}</p>
        <p><strong>Servings:</strong> {data.servings || "Not specified"}</p>
      </div>
      
      <p style={{ color: "#888", fontSize: 12, marginTop: 30 }}>
        Order ID: {data.orderId}
      </p>
    </div>
  );
}

function OrderConfirmedCustomerTemplate({ data }: { data: PreviewData }) {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ color: "#8B4513", borderBottom: "2px solid #D4A574", paddingBottom: 10 }}>
        🎉 Your Order is Confirmed!
      </h1>
      
      <p>Dear {data.customerName},</p>
      
      <p>Great news! Your custom cake order has been confirmed and we're excited to start working on it!</p>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Order Details</h2>
        <p><strong>Cake Type:</strong> {data.cakeType}</p>
        <p><strong>Event Type:</strong> {data.eventType || "Not specified"}</p>
        <p><strong>Event Date:</strong> {formatDate(data.eventDate)}</p>
        <p><strong>Servings:</strong> {data.servings || "Not specified"}</p>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <p>I'll be in touch soon to discuss any final details. If you have questions, don't hesitate to reach out!</p>
      
      <p style={{ marginTop: 30 }}>
        With love and butter,<br />
        <strong>Mahoney Makes</strong>
      </p>
      
      <p style={{ color: "#888", fontSize: 12, marginTop: 30 }}>
        Order Reference: {data.orderId}
      </p>
    </div>
  );
}

function PaymentReceiptBakerTemplate({ data }: { data: PreviewData }) {
  const paymentTypeLabel = data.paymentType === "deposit" ? "Deposit" : 
                           data.paymentType === "final_payment" ? "Final Payment" : "Payment";
  
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ color: "#8B4513", borderBottom: "2px solid #D4A574", paddingBottom: 10 }}>
        💰 {paymentTypeLabel} Received
      </h1>
      
      <div style={{ background: "#E8F5E9", padding: 20, borderRadius: 8, margin: "20px 0", textAlign: "center" }}>
        <p style={{ color: "#2E7D32", fontSize: 32, fontWeight: "bold", margin: 0 }}>
          ${data.paymentAmount.toFixed(2)}
        </p>
        <p style={{ color: "#4CAF50", margin: "5px 0 0 0" }}>via {data.paymentMethod}</p>
      </div>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Order Details</h2>
        <p><strong>Customer:</strong> {data.customerName}</p>
        <p><strong>Cake:</strong> {data.cakeType}</p>
        <p><strong>Event Date:</strong> {formatDate(data.eventDate)}</p>
      </div>
      
      <div style={{ background: "#F5F5F5", padding: 15, borderRadius: 8, margin: "20px 0" }}>
        <p style={{ margin: 0 }}><strong>Total Paid:</strong> ${data.totalPaid.toFixed(2)}</p>
        {data.remainingBalance > 0 ? (
          <p style={{ margin: "5px 0 0 0", color: "#F57C00" }}>
            <strong>Remaining Balance:</strong> ${data.remainingBalance.toFixed(2)}
          </p>
        ) : (
          <p style={{ margin: "5px 0 0 0", color: "#4CAF50" }}>
            <strong>✅ Paid in Full</strong>
          </p>
        )}
      </div>
      
      <p style={{ color: "#888", fontSize: 12, marginTop: 30 }}>
        Order ID: {data.orderId}
      </p>
    </div>
  );
}

function PaymentReceiptCustomerTemplate({ data }: { data: PreviewData }) {
  const paymentTypeLabel = data.paymentType === "deposit" ? "Deposit" : 
                           data.paymentType === "final_payment" ? "Final Payment" : "Payment";
  
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ color: "#8B4513", borderBottom: "2px solid #D4A574", paddingBottom: 10 }}>
        🧾 Payment Receipt
      </h1>
      
      <p>Dear {data.customerName},</p>
      
      <p>Thank you for your payment! Here's your receipt for your records.</p>
      
      <div style={{ background: "#E8F5E9", padding: 20, borderRadius: 8, margin: "20px 0", textAlign: "center" }}>
        <p style={{ color: "#666", margin: "0 0 5px 0" }}>{paymentTypeLabel}</p>
        <p style={{ color: "#2E7D32", fontSize: 32, fontWeight: "bold", margin: 0 }}>
          ${data.paymentAmount.toFixed(2)}
        </p>
        <p style={{ color: "#888", margin: "5px 0 0 0" }}>Today</p>
      </div>
      
      <div style={{ background: "#FFF8F0", padding: 20, borderRadius: 8, margin: "20px 0" }}>
        <h2 style={{ color: "#5D4037", marginTop: 0 }}>Order Summary</h2>
        <p><strong>Cake Type:</strong> {data.cakeType}</p>
        <p><strong>Event Date:</strong> {formatDate(data.eventDate)}</p>
        <p><strong>Payment Method:</strong> {data.paymentMethod}</p>
      </div>
      
      <div style={{ background: "#F5F5F5", padding: 15, borderRadius: 8, margin: "20px 0" }}>
        <p style={{ margin: 0 }}><strong>Total Paid to Date:</strong> ${data.totalPaid.toFixed(2)}</p>
        {data.remainingBalance > 0 ? (
          <p style={{ margin: "5px 0 0 0", color: "#F57C00" }}>
            <strong>Remaining Balance:</strong> ${data.remainingBalance.toFixed(2)}
          </p>
        ) : (
          <p style={{ margin: "5px 0 0 0", color: "#4CAF50" }}>
            <strong>✅ Paid in Full - Thank you!</strong>
          </p>
        )}
      </div>
      
      <p>If you have any questions about your order, please don't hesitate to reach out!</p>
      
      <p style={{ marginTop: 30 }}>
        With love and butter,<br />
        <strong>Mahoney Makes</strong>
      </p>
      
      <p style={{ color: "#888", fontSize: 12, marginTop: 30 }}>
        Order Reference: {data.orderId}
      </p>
    </div>
  );
}

export function EmailTemplatePreview() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("new_request");
  const [viewType, setViewType] = useState<"baker" | "customer">("customer");

  const templates = {
    new_request: {
      label: "New Request",
      icon: FileText,
      bakerComponent: <NewRequestBakerTemplate data={sampleData} />,
      customerComponent: <NewRequestCustomerTemplate data={sampleData} />,
    },
    order_confirmed: {
      label: "Order Confirmed",
      icon: CheckCircle,
      bakerComponent: <OrderConfirmedBakerTemplate data={sampleData} />,
      customerComponent: <OrderConfirmedCustomerTemplate data={sampleData} />,
    },
    payment_receipt: {
      label: "Payment Receipt",
      icon: Receipt,
      bakerComponent: <PaymentReceiptBakerTemplate data={sampleData} />,
      customerComponent: <PaymentReceiptCustomerTemplate data={sampleData} />,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Email Template Preview
        </CardTitle>
        <CardDescription>
          Preview how your email notifications will look to recipients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(templates).map(([key, template]) => {
            const Icon = template.icon;
            return (
              <Badge
                key={key}
                variant={selectedTemplate === key ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setSelectedTemplate(key as TemplateType)}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {template.label}
              </Badge>
            );
          })}
        </div>

        <Tabs value={viewType} onValueChange={(v) => setViewType(v as "baker" | "customer")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Customer Email
            </TabsTrigger>
            <TabsTrigger value="baker" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Your Copy
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <div className="border rounded-lg bg-white overflow-auto max-h-[500px]">
              {templates[selectedTemplate].customerComponent}
            </div>
          </TabsContent>
          <TabsContent value="baker">
            <div className="border rounded-lg bg-white overflow-auto max-h-[500px]">
              {templates[selectedTemplate].bakerComponent}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground">
          * This is a preview with sample data. Actual emails will contain real order information.
        </p>
      </CardContent>
    </Card>
  );
}