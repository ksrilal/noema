import "server-only";
import { JWT } from "google-auth-library";
import { parse } from "csv-parse/sync";
import type { Book } from "@/types/book";

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1DJh1-MP2RIXr5XUHTGtN_umeGI79egAJnjvX8a4fi1o";
const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || "Books";
const CACHE_SECONDS = 600;

type SheetRow = Record<string, string | undefined>;

function normalize(rows: SheetRow[]): Book[] {
  const seen = new Set<string>();
  return rows.flatMap((row) => {
    const id = String(row["Book ID"] || "").trim();
    const title = String(row["Title (Sinhala)"] || "").trim();
    if (!id || !title || seen.has(id)) return [];
    seen.add(id);
    return [{
      id,
      title,
      romanizedTitle: String(row["Searchable (Romanized)"] || "").trim(),
      author: String(row["Author"] || "").trim(),
      translator: String(row["Translator / Editor"] || "").trim(),
      category: String(row["Category"] || "Uncategorized").trim(),
      subcategory: String(row["Subcategory"] || "").trim(),
      subject: String(row["Subject"] || "").trim(),
      medium: String(row["Medium"] || "").trim(),
      language: String(row["Language"] || "Unspecified").trim(),
      availability: String(row["Availability"] || "Unknown").trim(),
      availabilityReason: String(row["Availability Reason"] || "").trim(),
      lastUpdated: String(row["Last Update Date"] || "").trim(),
      printed: String(row["Printed in lsit"] || "").toLowerCase() === "true",
    }];
  });
}

function fromGrid(rows: unknown[][]): SheetRow[] {
  const [headers = [], ...values] = rows;
  const keys = headers.map((header) => String(header).replace(/\uFEFF/g, "").trim());
  return values.map((cells) => Object.fromEntries(keys.map((key, index) => [key, String(cells[index] ?? "")])));
}

async function readPrivateSheet(): Promise<Book[]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) throw new Error("Google service account is not configured");
  const client = new JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Unable to authenticate Google Sheets access");
  const range = encodeURIComponent("'" + SHEET_TAB.replace(/'/g, "''") + "'!A1:N");
  const url = "https://sheets.googleapis.com/v4/spreadsheets/" + encodeURIComponent(SHEET_ID) + "/values/" + range;
  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!response.ok) throw new Error("Google Sheets API returned " + response.status);
  const result = (await response.json()) as { values?: unknown[][] };
  return normalize(fromGrid(result.values || []));
}

async function readPublicSheet(): Promise<Book[]> {
  const url = process.env.SHEETS_PUBLIC_CSV_URL ||
    "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(SHEET_ID) +
    "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(SHEET_TAB);
  const response = await fetch(url, { next: { revalidate: CACHE_SECONDS } });
  if (!response.ok) throw new Error("Public sheet returned " + response.status);
  const csv = await response.text();
  if (!csv.includes("Book ID") || !csv.includes("Title (Sinhala)")) {
    throw new Error("Sheet is not publicly readable; configure the service account");
  }
  const rows = parse(csv, { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true }) as SheetRow[];
  return normalize(rows);
}

export async function getBooks(): Promise<{ books: Book[]; error: string | null }> {
  try {
    const isPrivate = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
    const books = isPrivate ? await readPrivateSheet() : await readPublicSheet();
    return { books, error: null };
  } catch (error) {
    console.error("[Noema] Google Sheets read failed:", error instanceof Error ? error.message : "Unknown error");
    return {
      books: [],
      error: "The library is not connected yet. Configure read-only Google Sheets access in Vercel to display the collection.",
    };
  }
}
