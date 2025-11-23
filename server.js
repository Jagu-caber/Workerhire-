const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // serve index.html and assets

// Example simple API to save orders (in memory or file)
let orders = [];

app.post('/api/order', (req, res) => {
  const order = req.body || {};
  order.time = Date.now();
  orders.push(order);
  // optionally write to file
  try {
    fs.writeFileSync(path.join(__dirname, 'orders.json'), JSON.stringify(orders, null, 2));
  } catch (e) {
    console.warn('write failed', e);
  }
  return res.json({ ok: true, orderId: orders.length });
});

app.get('/api/orders', (req, res) => {
  return res.json({ orders });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
