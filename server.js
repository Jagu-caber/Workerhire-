 // server.js
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' })); // allow base64 photos

// env keys (set in Railway)
const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if (!KEY_ID || !KEY_SECRET) {
  console.warn('Razorpay keys NOT set. /create-order will fail in live mode.');
}

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

// simple file DB
const DATA_FILE = path.join(__dirname, 'data.json');
function readDB() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { workers: [], customers: [], bookings: [] };
  }
}
function writeDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// health
app.get('/', (req, res) => res.send('WorkerHire Backend is Running!'));

// add worker (optional, frontend may manage local-only)
app.post('/workers', (req, res) => {
  const { name, cat, rate, desc, photo, id } = req.body;
  const db = readDB();
  const worker = {
    id: id || uuidv4(),
    name, cat, rate: Number(rate) || 0, desc: desc || '', photo: photo || null,
    createdAt: Date.now(),
  };
  db.workers.push(worker);
  writeDB(db);
  res.json({ success: true, worker });
});

// list workers
app.get('/workers', (req, res) => {
  const db = readDB();
  res.json({ workers: db.workers || [] });
});

// create customer (signup)
app.post('/customers', (req, res) => {
  const { name, email } = req.body;
  const db = readDB();
  const customer = { id: uuidv4(), name, email, createdAt: Date.now() };
  db.customers.push(customer);
  writeDB(db);
  res.json({ success: true, customer });
});

// create razorpay order + save booking
app.post('/create-order', async (req, res) => {
  try {
    // Expect: { amount, currency, workerId, customerId, hours, notes, photo }
    let { amount, currency, workerId, customerId, hours, notes, photo } = req.body;
    if (!amount || !workerId || !customerId) {
      return res.status(400).json({ error: 'Missing amount/worker/customer' });
    }
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Razorpay expects amount in paise for INR
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: notes || '',
    };

    const order = await razorpay.orders.create(options);

    // Save booking
    const db = readDB();
    const booking = {
      bookingId: uuidv4(),
      razorpay_order_id: order.id,
      workerId, customerId,
      amount, currency: options.currency,
      hours: hours || 1,
      notes,
      photo: photo || null,
      status: 'created',
      createdAt: Date.now(),
    };
    db.bookings.push(booking);
    writeDB(db);

    return res.json({ success: true, order, bookingId: booking.bookingId });
  } catch (err) {
    console.error('create-order error', err);
    res.status(500).json({ error: 'Order creation failed', details: err.message });
  }
});

// confirm payment after frontend success (optional, verify signature in prod)
app.post('/confirm-payment', (req, res) => {
  // Expect { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature }
  const { bookingId, razorpay_payment_id, razorpay_order_id } = req.body;
  const db = readDB();
  const b = db.bookings.find(x => x.bookingId === bookingId || x.razorpay_order_id === razorpay_order_id);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  b.status = 'paid';
  b.razorpay_payment_id = razorpay_payment_id;
  b.paidAt = Date.now();
  writeDB(db);
  res.json({ success: true, booking: b });
});

// get bookings, filter by customerId or workerId
app.get('/bookings', (req, res) => {
  const { customerId, workerId } = req.query;
  const db = readDB();
  let list = db.bookings || [];
  if (customerId) list = list.filter(b => b.customerId === customerId);
  if (workerId) list = list.filter(b => b.workerId === workerId);
  res.json({ bookings: list });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
