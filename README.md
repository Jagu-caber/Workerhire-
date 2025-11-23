WorkerHire — Full package (frontend + simple backend)
====================================================

What's included
---------------
- `index.html` — Single-file frontend demo. Saves workers locally (localStorage). Supports uploading a photo (stored as base64).
- `server.js` — Tiny Express backend that can create Razorpay orders. Reads keys from environment variables.
- `package.json` — Node dependencies and start script.

How to use (quick)
------------------
Frontend-only (no backend):
1. Open `index.html` in your browser. Add workers and test booking locally. Razorpay won't open without backend.

With backend (Razorpay order creation):
1. Create a project on Railway (or any server).
2. Add env variables:
   - `RAZORPAY_KEY_ID` = your razorpay key id
   - `RAZORPAY_KEY_SECRET` = your razorpay secret
3. Deploy `server.js` using Node (install dependencies and run `npm start`).
4. Edit `index.html` and set `BACKEND_URL` to your deployed server URL (for Railway it will be like `https://yourapp.up.railway.app`).
5. Open frontend and Book & Pay — checkout will open.

Notes
-----
- Photos are saved in localStorage (demo). For production use, upload images to S3 or Cloud storage and save URLs in DB.
- Commission (10%) is calculated in `server.js` and added to order notes (example only). Integrate server-side DB & verification for real app.
- This package is a demo starter, not production-ready. Security, validation, webhooks and signature verification must be added for real payments.
