 // server.js
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use env vars (set these in Railway -> Variables)
const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

// basic check
if (!KEY_ID || !KEY_SECRET) {
  console.warn("Razorpay keys are NOT set. /create-order will not work in live mode.");
}

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

// health check
app.get("/", (req, res) => {
  res.send("WorkerHire Backend is Running!");
});

/**
 * Create an order
 * Expects JSON body: { amount: 50000, currency: "INR", receipt: "rcpt_123", notes: {...} }
 * amount should be in paise (amount*100 if amount given in rupees)
 */
app.post("/create-order", async (req, res) => {
  try {
    let { amount, currency, receipt, notes } = req.body;

    // basic validation
    if (!amount) return res.status(400).json({ error: "Missing amount" });

    // ensure integer paise
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    // if user sent rupees and you want paise, multiply here:
    // amount = Math.round(amount * 100); // uncomment if sending rupees from frontend
    // For safety, expect already paise.

    const options = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // auto capture
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    return res.json({ success: true, order });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ error: "Order creation failed", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
