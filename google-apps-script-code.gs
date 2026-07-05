/**
 * Studio Pilates Uniform Order backend
 * Paste this into Google Apps Script attached to your Google Sheet.
 *
 * Required tabs:
 * Orders
 * Order Items
 * Payments
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var result = saveUniformOrder(data);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("Studio Pilates Uniform Order backend is live.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function saveUniformOrder(order) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var ordersSheet = getOrCreateSheet_(ss, "Orders", [
    "Order ID", "Timestamp", "Name", "Email", "Total", "Status", "Paid"
  ]);

  var itemsSheet = getOrCreateSheet_(ss, "Order Items", [
    "Order ID", "Product", "Size", "Quantity", "Unit Price", "Line Total"
  ]);

  var paymentsSheet = getOrCreateSheet_(ss, "Payments", [
    "Order ID", "Name", "Email", "Total", "Paid", "Payment Date"
  ]);

  var orderId = "SP-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  var timestamp = new Date();

  ordersSheet.appendRow([
    orderId,
    timestamp,
    order.name,
    order.email,
    Number(order.total),
    "Awaiting Payment",
    "No"
  ]);

  order.items.forEach(function(item) {
    itemsSheet.appendRow([
      orderId,
      item.product,
      item.size,
      Number(item.quantity),
      Number(item.price),
      Number(item.quantity) * Number(item.price)
    ]);
  });

  paymentsSheet.appendRow([
    orderId,
    order.name,
    order.email,
    Number(order.total),
    false,
    ""
  ]);

  sendConfirmationEmail_(orderId, order);

  return {
    success: true,
    orderId: orderId,
    total: Number(order.total)
  };
}

function sendConfirmationEmail_(orderId, order) {
  var lines = order.items.map(function(item) {
    return item.product + " - " + item.size + " x " + item.quantity +
      " = $" + (Number(item.price) * Number(item.quantity)).toFixed(2);
  }).join("\n");

  var body =
"Hi " + order.name + ",\n\n" +
"Thanks for joining the Studio Pilates staff uniform group order.\n\n" +
"Order number: " + orderId + "\n\n" +
lines + "\n\n" +
"Total owing: $" + Number(order.total).toFixed(2) + "\n\n" +
"The studio will cover the shipping cost as part of the bulk order.\n" +
"Payment will be arranged separately.\n\n" +
"Thank you,\nStudio Pilates";

  MailApp.sendEmail(order.email, "Your Studio Pilates Uniform Order", body);
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}
