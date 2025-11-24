// server.js
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if(!KEY_ID || !KEY_SECRET) {
  console.warn('Razorpay keys not set — /create-order will not work in live mode (demo fallback will run).');
}

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET
});

app.get('/', (req,res)=> res.send('WorkerHire Backend is Running!'));

app.post('/create-order', async (req,res)=>{
  try{
    let { amount, currency } = req.body;
    if(!amount) return res.status(400).json({ success:false, error:'Missing amount' });
    // ensure integer paise if rupees passed; assume caller passes paise already if >=100
    if(amount < 1000) {
      // treat as rupees — convert to paise
      amount = Math.round(Number(amount) * 100);
    }
    const options = {
      amount: Number(amount),
      currency: currency || 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    };
    const order = await razorpay.orders.create(options);
    return res.json({ success:true, order, key: KEY_ID });
  } catch(err){
    console.error('create-order error', err);
    return res.status(500).json({ success:false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server listening on', PORT));
