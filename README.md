# NOEMA
### LAL Literary Collection

A read-only personal library, dashboard, and insights explorer powered directly by Google Sheets.

## Features
- Elegant responsive dashboard with collection KPIs, category distribution, authors, language and availability.
- Searchable catalogue with pagination and book details.
- Insights explorer with cross-filtered charts, author explorer, category comparisons.
- **Read-only by design**: no create/update/delete endpoints or write access to your spreadsheet.
- 10-minute Google Sheets fetch cache. All interactive filters run against the fetched dataset.
- No book data is committed to this repository.

## Run locally
Requires Node.js 22+.

\`\`\`sh
npm install
cp .env.example .env.local
npm run dev
\`\`\`

## Connect Google Sheets

The canonical source is the \`Books\` tab of your Google Sheet.

### Option A — private sheet (recommended)
1. In Google Cloud, enable **Google Sheets API** and create a service account with a JSON key.
2. Share your existing spreadsheet with the service account's email as **Viewer** (not Editor).
3. Add these server-side environment variables to Vercel (Production and Preview), without committing secrets:
   - \`GOOGLE_SHEET_ID\` — default is your existing catalogue's spreadsheet ID.
   - \`GOOGLE_SERVICE_ACCOUNT_EMAIL\` — \`client_email\` from the JSON key.
   - \`GOOGLE_PRIVATE_KEY\` — \`private_key\` from the JSON key; preserve newlines.
   - \`GOOGLE_SHEET_TAB\` — optional, default \`Books\`.
4. Redeploy from Vercel so the environment variables take effect.

Google authorization uses the **spreadsheets.readonly** scope. Your spreadsheet remains unchanged.

### Option B — public sheet
If the Sheet is set to **Anyone with the link can view**, the server attempts a public read-only CSV request. Alternatively, configure \`SHEETS_PUBLIC_CSV_URL\` with a published CSV URL. **This method makes the sheet data publicly readable**, so prefer Option A for a personal collection.

If the sheet cannot be fetched, the website shows a connection notice and does not display invented sample records.

## Schema
The app maps these existing columns and does **not** modify them:
\`Book ID\`, \`Title (Sinhala)\`, \`Author\`, \`Translator / Editor\`, \`Category\`, \`Subcategory\`, \`Subject\`, \`Medium\`, \`Language\`, \`Availability\`, \`Availability Reason\`, \`Last Update Date\`, \`Printed in lsit\`.

Derived tabs like Available, Unavailable and Library Order are not counted again.

## Technology
Next.js App Router, TypeScript, React, Recharts, Lucide, Google Sheets API, CSV parser.

© Noema — LAL Literary Collection.
