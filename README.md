# NOEMA
### LĀL Literary Collection

**A personal library of books, ideas, and literary discoveries.**

[![Live website](https://img.shields.io/badge/Live%20website-NOEMA-8064b6?style=for-the-badge)](https://noema-one-dusky.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-171225?style=flat-square)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Read--only-34a853?style=flat-square)](https://developers.google.com/workspace/sheets/api)

**Live:** https://noema-one-dusky.vercel.app/

NOEMA is a responsive, read-only digital companion to the **LĀL Literary Collection**. It brings a personally maintained Google Sheets book catalogue into a thoughtfully designed reading and discovery experience, with searchable volumes, collection analytics, author exploration, and curated quotations from books on the shelves.

## Features

| Area | What it offers |
| --- | --- |
| **Literary home** | A rotating collection of 100 book-linked literary passages, a quiet editorial layout, and an animated open-book illustration. |
| **Book catalogue** | Responsive grid and list views, searchable titles and authors, filtering, pagination, and detailed volume information. |
| **Sinhala + Romanized search** | Search Sinhala titles and their romanized aliases, alongside authors, translators, and metadata. |
| **Collection overview** | Summary statistics for volumes, authors, categories, languages, formats, and availability. |
| **Collection insights** | Category comparisons, author distribution, borrowing summaries, and catalogue metadata coverage. |
| **Author explorer** | Discover the authors represented in the collection. |
| **Borrowing information** | Availability reasons, borrower details and dates where recorded; unknown values remain unknown. |
| **Appearance** | System, light, and dark themes; responsive layout and reduced-motion support. |

### Literary quotations

Quotations are stored **in the web project**, not in the spreadsheet, at [`src/data/quotes.ts`](src/data/quotes.ts). Each entry associates a short excerpt with a catalogue `Book ID`, work, author, passage reference, source URL, and visual theme. The homepage can open the corresponding volume.

The curated collection currently contains **100 passages**. Source references are included for review, but **not every excerpt has completed a final edition-by-edition verification**. For translated books, wording may differ between the cited English edition and the physical copy. Some copyrighted works are represented by brief excerpts rather than full passages.

## How it works

```text
Google Sheets · Books tab (catalogue source of truth)
                  │
                  │ read-only server-side fetch
                  ▼
         Next.js application
          ├── Literary home ← src/data/quotes.ts
          ├── Overview & insights
          ├── Searchable book catalogue
          └── Author explorer
```

Book data is fetched on the server using the Google Sheets API with a **read-only scope**, or via a public CSV endpoint when configured. Requests use `cache: "no-store"` so the app can reflect sheet edits on subsequent page loads without a code deployment. The application has **no book editing or spreadsheet write endpoints**.

**Privacy note:** Borrower names and dates, if populated in the spreadsheet, can be displayed on the website. Do not publish personal borrowing information unless you intend visitors to see it.

## Technology

- **Next.js 16** App Router, **React 19**, **TypeScript**
- **Recharts** for data visualizations
- **Lucide React** icons
- **Google Sheets API** with service-account authentication, or read-only public CSV
- Custom CSS, responsive themes, and CSS-driven book animation
- Deployment on **Vercel**

## Run locally

Requires **Node.js 22+**.

```bash
git clone https://github.com/ksrilal/noema.git
cd noema
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

To check types or produce a production build:

```bash
npm run typecheck
npm run build
```

### Google Sheets configuration

The source of truth is the `Books` tab in the Google Sheet. The reader resolves fields **by header name**, so column order can change without requiring application changes, provided the expected headers remain intact.

**Recommended: private spreadsheet**

1. Enable the **Google Sheets API** in Google Cloud and create a service account.
2. Share the spreadsheet with the service account as **Viewer** only.
3. Set these environment variables in `.env.local` and Vercel:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_SHEET_ID` | Spreadsheet ID; optional if using the configured default |
| `GOOGLE_SHEET_TAB` | Tab name (defaults to `Books`) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Service account private key; preserve newline formatting |

Never commit credentials or your `.env.local` file.

**Alternative: public spreadsheet**

The app can read a publicly accessible Google Sheets CSV endpoint. You can optionally provide `SHEETS_PUBLIC_CSV_URL`. This exposes the published catalogue data publicly, so private service-account access is preferable.

If the sheet is inaccessible, NOEMA shows a connection message instead of inventing catalogue records.

### Catalogue fields

The app currently supports these spreadsheet headers:

`Book ID`, `Title (Sinhala)`, `Author`, `Translator / Editor`, `Category`, `Subcategory`, `Subject`, `Searchable (Romanized)`, `Medium`, `Language`, `Availability`, `Availability Reason`, `Borrowed By`, `Borrowed Date`, `Last Update Date`, `Printed in lsit`.

Other derived sheet tabs are not counted again. The book catalogue itself is **not committed** to this repository.

## Project structure

```text
src/
├── app/
│   ├── globals.css             # Responsive design and themes
│   ├── layout.tsx              # Application shell and metadata
│   └── page.tsx                # Server-rendered entry point
├── components/
│   └── library-client.tsx      # Homepage, catalogue and insights UI
├── data/
│   └── quotes.ts               # Curated, Book ID-linked passages
├── lib/
│   └── books.ts                # Read-only Google Sheets integration
└── types/
    └── book.ts                 # Book and view types
```

## Design principles

- **The spreadsheet remains the source of truth** for book records.
- **No invented data**: missing catalogue information is left missing or marked unknown.
- **Thoughtful discovery**: typography, accessible controls, and visualizations support reading rather than distracting from it.
- **Independent literary curation**: quotations live in version-controlled source files, separate from book metadata.

---

**NOEMA — LĀL Literary Collection** · [Visit the live library](https://noema-one-dusky.vercel.app/)
