# WorkerHire — Full package (Frontend + Backend)

**What is inside**
- `index.html` — Premium single-file frontend (demo). Replace `{{RAZORPAY_KEY_ID}}` in file with your Razorpay key id or ensure your frontend gets it from a safe source.
- `server.js` — Express backend that creates Razorpay orders. Reads keys from environment variables.
- `package.json` — Scripts and dependencies.

## Quick deploy (Railway) — Recommended
1. Create a new Railway project and connect to this repository (or upload files).
2. In Railway Project -> Variables add:
   - `RAZORPAY_KEY_ID` = your razorpay key id (public)
   - `RAZORPAY_KEY_SECRET` = your razorpay secret (keep secret!)
3. Deploy. Railway will run `npm install` and `npm start` (package.json has start script).
4. Open `https://<your-railway-domain>/test` to verify it returns `Backend Working`.
5. If using backend only to serve everything, your site root will be same Railway domain. Alternatively host `index.html` on GitHub Pages and set `BACKEND_URL` to your Railway domain.

## Notes & Security
- **Do NOT** commit your Razorpay secret to public repo. Always use environment variables.
- The frontend currently contains a placeholder `{{RAZORPAY_KEY_ID}}`. Replace it manually or serve the key from backend.
- Commission logic (10%) should be implemented server-side when you capture payment or process post-payment events.

If you want, I can now:
- Push these 3 files into your GitHub repo (you'll need to give repo name and confirm), OR
- Give you the ZIP to download and upload yourself.

Reply 'push' to ask me to prepare for pushing, or 'download' to get the ZIP link.
