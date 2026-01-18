const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

if (!admin.apps.length) {
  admin.initializeApp();
}

const mailConfig = functions.config().mail || {};

const transporter = nodemailer.createTransport({
  host: mailConfig.server,
  port: Number(mailConfig.port || 587),
  secure: String(mailConfig.use_tls || "true").toLowerCase() === "true",
  auth: {
    user: mailConfig.username,
    pass: mailConfig.password,
  },
});

exports.sendOrderNotification = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    cakeType,
    eventType,
    eventDate,
    servings,
    budget,
    requestDetails,
    notificationType,
  } = req.body || {};

  if (!orderId || !customerName) {
    return res.status(400).json({ error: "Missing orderId or customerName" });
  }

  const to = mailConfig.alert_to || mailConfig.default_sender;
  if (!to) {
    return res.status(500).json({ error: "mail.alert_to not configured" });
  }

  const subject = notificationType === "order_confirmed"
    ? `Order confirmed: ${customerName}`
    : `Order update: ${customerName}`;

  const text = [
    `Order ID: ${orderId}`,
    `Customer: ${customerName}`,
    `Email: ${customerEmail || "N/A"}`,
    `Phone: ${customerPhone || "N/A"}`,
    `Cake: ${cakeType || ""}`,
    `Event: ${eventType || ""}`,
    `Date: ${eventDate || ""}`,
    `Servings: ${servings ?? ""}`,
    `Budget: ${budget || ""}`,
    `Details: ${requestDetails || ""}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: mailConfig.default_sender || mailConfig.username,
      to,
      subject,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});
