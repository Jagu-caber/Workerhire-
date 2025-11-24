 const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "./data.json";

function loadDB() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { workers: [], customers: [], bookings: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

app.get("/", (req, res) => {
  res.send("WorkerHire Backend is Running!");
});

// Add customer
app.post("/customers", (req, res) => {
  const { name, phone } = req.body;
  const db = loadDB();
  const newC = { id: uuid(), name, phone };
  db.customers.push(newC);
  saveDB(db);
  res.json(newC);
});

// Add worker
app.post("/workers", (req, res) => {
  const { name, category, rate, desc } = req.body;
  const db = loadDB();
  const w = { id: uuid(), name, category, rate, desc };
  db.workers.push(w);
  saveDB(db);
  res.json(w);
});

// Get all workers
app.get("/workers", (req, res) => {
  const db = loadDB();
  res.json(db.workers);
});

// Create order
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razor.orders.create({
      amount: amount * 100,
      currency: "INR",
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// Confirm payment
app.post("/confirm-payment", (req, res) => {
  const { workerId, customerId, hours, amount, paymentId } = req.body;

  const db = loadDB();
  const booking = {
    id: uuid(),
    workerId,
    customerId,
    hours,
    amount,
    paymentId,
    status: "paid",
  };

  db.bookings.push(booking);
  saveDB(db);

  res.json({ success: true, booking });
});

// Bookings filter
app.get("/bookings", (req, res) => {
  const { workerId, customerId } = req.query;
  const db = loadDB();

  let b = db.bookings;
  if (workerId) b = b.filter((x) => x.workerId === workerId);
  if (customerId) b = b.filter((x) => x.customerId === customerId);

  res.json(b);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
