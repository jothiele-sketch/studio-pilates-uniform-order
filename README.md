# Studio Pilates Staff Uniform Group Order

This is a simple static website designed for GitHub + Vercel.

## Files

- `index.html` — page structure
- `style.css` — styling
- `script.js` — products, cart and Google Apps Script submission
- `google-apps-script-code.gs` — backend code for your Google Sheet

## Your Apps Script URL is already inserted

```txt
https://script.google.com/macros/s/AKfycbyvgwsJntrPHyQXsXtpUHRD_FwuwAY8RuaE7aSOpcVErk5EcnYJvggqDP58C4eAqf4o/exec
```

## Google Sheet tabs required

- Orders
- Order Items
- Payments

The Apps Script code will create these tabs if they do not already exist.

## How to deploy

1. Create a GitHub repository.
2. Upload these files to the repository.
3. In Vercel, import the GitHub repository.
4. Deploy as a static site.

## Important

Because this page submits to Google Apps Script using `no-cors`, the site will show success after the request is sent.
Check your Google Sheet after a test order to confirm rows are appearing.

## Product images

This version uses clean CSS placeholders rather than the supplier screenshots. That makes deployment easier for Version 1.
We can add real hosted product images later.
