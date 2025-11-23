const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Razorpay keys from environment (set these in Railway variables)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// optional: create Razorpay instance if keys present
let razor = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razor = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

// Serve static frontend (assumes index.html at repo root)
app.use(express.static(path.join(__dirname, '/')));

// health
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Create order (expects { amount } in rupees)
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required (in INR)' });

    // amount rupees -> paise
    const amtPaise = Math.round(Number(amount) * 100);

    if (!razor) {
      // if Razorpay not configured, return mock order
      return res.json({
        mock: true,
        order: { id: `mock_${Date.now()}`, amount: amtPaise, currency: 'INR' }
      });
    }

    const order = await razor.orders.create({
      amount: amtPaise,
      currency: 'INR',
      payment_capture: 1
    });

    res.json({ mock: false, order });
  } catch (e) {
    console.error('create-order error', e);
    res.status(500).json({ error: e.message || 'server error' });
  }
});

// verify webhook / payment signature (optional)
app.post('/verify', (req, res) => {
  // implement if you use webhooks or verify payments server-side
  res.json({ ok: true });
});

// fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
