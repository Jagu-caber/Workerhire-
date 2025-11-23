import express from "express";
import cors from "cors";
import Razorpay from "razorpay";

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// test route
app.get("/", (req, res) => {
  res.send("WorkerHire Backend is Running!");
});

// Order create route
app.post("/create-order", async (req, res) => {
  try {
    const { amount, name } = req.body;

    const options = {
      amount: Number(amount), // in paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
      notes: { worker: name || "Unknown worker" }
    };

    const order = await razorpay.orders.create(options);
    return res.json(order);

  } catch (err) {
    console.error("Order Error:", err);
    return res.status(500).json({ error: "Order creation failed!" });
  }
});

// start server
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
