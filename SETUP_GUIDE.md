# Studio Pilates Staff Uniform Order — Setup Guide

Two files, three things you need to do. Nothing here needs coding — it's copy, paste, deploy.

## What's in this build

| File | What it is |
|---|---|
| `index.html` | The whole staff-facing order page — product catalog, cart, checkout form. One file, no build step. |
| `Code.gs` | The Google Apps Script backend — writes to your Google Sheet and sends the confirmation email. |

## What's now real (as of this build)

- **Sizes** are per-product, taken from your actual supplier size runs — not a uniform guess:
  - Women's tee / jumper: XS–3XL
  - Women's leggings / long sleeve tee: XS–2XL
  - Men's tee / long sleeve tee: S–5XL
  - Men's jumper: XS–5XL
  - Each card's "Size guide" also shows the real cm measurements from your supplier charts (Body Width/Length, or Half Waist/Full Length for leggings).
- **Product photos** are cropped from the screenshots you supplied, saved into `images/` alongside `index.html`, and already wired into each product's `img` field. If you get proper studio photography later, just replace the files in `images/` with the same filenames and nothing else needs to change.
- **Payment:** bank transfer, confirmed after order submission. The page and the confirmation email both say payment is by bank transfer and that the studio manager will follow up with account details — no bank account numbers are in the code, since that's the kind of detail better sent manually per staff member rather than baked into a public web page.

## Step 1 — Create the Google Sheet + backend (10 minutes)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank sheet. Name it something like **Studio Pilates — Uniform Orders**.
2. In the sheet, go to **Extensions → Apps Script**. This opens a code editor tied to this sheet.
3. Delete whatever's in the default `Code.gs` file and paste in the entire contents of the `Code.gs` file from this build.
4. Save (Ctrl/Cmd+S). Name the Apps Script project if prompted.
5. In the function dropdown at the top of the editor, select **setupSheets**, then click **Run**.
   - The first time, Google will ask you to authorize the script — click through **Review permissions → your account → Advanced → Go to [project name] (unsafe) → Allow**. This is normal for scripts you write yourself; "unsafe" just means it's not published in the store.
   - You'll get a popup confirming the four tabs were created: **Orders, Order Items, Payments, Supplier Summary**.

## Step 2 — Deploy it as a web app (5 minutes)

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**. Authorize again if asked.
5. Copy the **Web app URL** it gives you — looks like `https://script.google.com/macros/s/AKfycb.../exec`.

**Important:** any time you edit `Code.gs` later, you need to create a **new deployment** (or update the existing one via Deploy → Manage deployments → Edit → New version) for the changes to take effect. Editing the script alone doesn't update a live deployed web app.

## Step 3 — Connect the frontend

1. Open `index.html` in a text editor.
2. Find this line near the top of the `<script>` block:
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
   ```
3. Replace the placeholder with the Web app URL from Step 2.
4. Save.

## Step 4 — Host it

The spec calls for GitHub + Vercel:

1. Create a GitHub repo, add `index.html` (and your `images/` folder once you have photos).
2. Go to [vercel.com](https://vercel.com), **Add New → Project**, import that repo, deploy with default settings (it's a static site, no build command needed).
3. Vercel gives you a live URL — share that with staff.

If you'd rather test locally first, just double-click `index.html` to open it in a browser — everything works except the actual submission (it'll show a friendly message if the Apps Script URL isn't set yet).

## How the Sheet fills in

- **Orders** — one row per submitted order: order ID, timestamp, name, email, total owing, status.
- **Order Items** — one row per line item (product + size + qty), so you can filter/pivot freely.
- **Supplier Summary** — automatically recalculated on every new order: total quantity needed per SKU + size, ready to hand to your supplier.
- **Payments** — intentionally left empty by the script. This is for you or a future V2 to track who's actually paid; it's out of scope for V1 per the spec (no payment tracking dashboard).

## Known limitation worth knowing about

Google Apps Script web apps don't reliably support proper CORS preflight requests. The frontend works around this by sending the order as `text/plain` instead of `application/json` (Apps Script still parses it fine server-side) — this is the standard, well-established workaround for this exact setup and doesn't affect functionality. If you ever swap the backend to something other than Apps Script (e.g. a real API), this won't be needed.

## Things I did not build (confirmed out of scope per your spec)

Payment tracking dashboard, order editing, closing-date countdown, admin reporting. All flagged in your spec as V2.
