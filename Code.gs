/**
 * Studio Pilates — Staff Uniform Order
 * Google Apps Script backend
 *
 * SETUP (see SETUP_GUIDE.md for full walkthrough):
 * 1. Create a Google Sheet. Open Extensions > Apps Script and paste this file in as Code.gs.
 * 2. Run `setupSheets` once from the Apps Script editor (Run menu) to create the four tabs
 *    with headers. Approve the permissions prompt when asked.
 * 3. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Copy the Web App URL and paste it into APPS_SCRIPT_URL in index.html.
 */

const SHEET_ORDERS = "Orders";
const SHEET_ORDER_ITEMS = "Order Items";
const SHEET_PAYMENTS = "Payments";
const SHEET_SUPPLIER_SUMMARY = "Supplier Summary";

const STUDIO_NAME = "Studio Pilates";
const PAYMENT_INSTRUCTIONS = "Payment is by bank transfer. Your studio manager will send you the account details and confirm the amount owing shortly.";

/* ================= One-time setup ================= */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const ordersHeaders = ["Order ID", "Timestamp", "Name", "Email", "Total Owing", "Status"];
  const itemsHeaders = ["Order ID", "Timestamp", "Name", "Email", "SKU", "Product", "Size", "Qty", "Unit Price", "Line Total"];
  const paymentsHeaders = ["Order ID", "Name", "Email", "Amount Owing", "Amount Paid", "Payment Date", "Payment Method", "Notes"];
  const summaryHeaders = ["SKU", "Product", "Size", "Total Qty"];

  createOrResetSheet(ss, SHEET_ORDERS, ordersHeaders);
  createOrResetSheet(ss, SHEET_ORDER_ITEMS, itemsHeaders);
  createOrResetSheet(ss, SHEET_PAYMENTS, paymentsHeaders);
  createOrResetSheet(ss, SHEET_SUPPLIER_SUMMARY, summaryHeaders);

  SpreadsheetApp.getUi().alert("Sheet structure created: Orders, Order Items, Payments, Supplier Summary.");
}

function createOrResetSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

/* ================= Web app entry point ================= */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const result = recordOrder(payload);
    return jsonResponse({ ok: true, orderId: result.orderId });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================= Core order recording ================= */
function recordOrder(payload) {
  const name = (payload.name || "").toString().trim();
  const email = (payload.email || "").toString().trim();
  const items = payload.items || [];
  const total = Number(payload.total || 0);

  if (!name || !email) throw new Error("Missing name or email.");
  if (!items.length) throw new Error("No items in order.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(SHEET_ORDERS);
  const itemsSheet = ss.getSheetByName(SHEET_ORDER_ITEMS);
  if (!ordersSheet || !itemsSheet) {
    throw new Error("Sheet tabs not found — run setupSheets() first.");
  }

  const orderId = generateOrderId();
  const timestamp = new Date();

  ordersSheet.appendRow([orderId, timestamp, name, email, total, "Submitted"]);

  const rows = items.map(function (item) {
    return [
      orderId, timestamp, name, email,
      item.sku || "", item.product || "", item.size || "",
      Number(item.qty) || 0, Number(item.unitPrice) || 0, Number(item.lineTotal) || 0
    ];
  });
  itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

  updateSupplierSummary();
  sendConfirmationEmail(name, email, orderId, items, total);

  return { orderId: orderId };
}

function generateOrderId() {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Australia/Adelaide", "yyMMdd-HHmmss");
  const rand = Math.floor(Math.random() * 900 + 100); // 3-digit
  return "SP-" + stamp + "-" + rand;
}

/* ================= Supplier summary (pivot by product + size) ================= */
function updateSupplierSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName(SHEET_ORDER_ITEMS);
  const summarySheet = ss.getSheetByName(SHEET_SUPPLIER_SUMMARY);
  if (!itemsSheet || !summarySheet) return;

  const lastRow = itemsSheet.getLastRow();
  if (lastRow < 2) return;

  const data = itemsSheet.getRange(2, 1, lastRow - 1, 10).getValues();
  // columns: OrderID, Timestamp, Name, Email, SKU, Product, Size, Qty, UnitPrice, LineTotal
  const totals = {}; // key: sku|size -> {sku, product, size, qty}

  data.forEach(function (row) {
    const sku = row[4], product = row[5], size = row[6], qty = Number(row[7]) || 0;
    if (!sku) return;
    const key = sku + "|" + size;
    if (!totals[key]) totals[key] = { sku: sku, product: product, size: size, qty: 0 };
    totals[key].qty += qty;
  });

  const rows = Object.values(totals)
    .sort(function (a, b) {
      return a.sku.localeCompare(b.sku) || a.size.localeCompare(b.size);
    })
    .map(function (t) { return [t.sku, t.product, t.size, t.qty]; });

  // Clear existing data rows (keep header) then write fresh summary.
  if (summarySheet.getLastRow() > 1) {
    summarySheet.getRange(2, 1, summarySheet.getLastRow() - 1, 4).clearContent();
  }
  if (rows.length) {
    summarySheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
}

/* ================= Confirmation email ================= */
function sendConfirmationEmail(name, email, orderId, items, total) {
  const lines = items.map(function (i) {
    return i.qty + " x " + i.product + " (" + i.size + ") — $" + Number(i.lineTotal).toFixed(2);
  }).join("\n");

  const body =
    "Hi " + name + ",\n\n" +
    "Your " + STUDIO_NAME + " uniform order has been received.\n\n" +
    "Order reference: " + orderId + "\n\n" +
    lines + "\n\n" +
    "Total owing: $" + Number(total).toFixed(2) + "\n\n" +
    PAYMENT_INSTRUCTIONS + "\n\n" +
    "This order will ship as part of a single studio-wide bulk order, so there's no individual shipping charge.\n\n" +
    "Thanks,\n" + STUDIO_NAME;

  MailApp.sendEmail({
    to: email,
    subject: STUDIO_NAME + " — Uniform Order Confirmation (" + orderId + ")",
    body: body
  });
}
