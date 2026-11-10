import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noema | LAL Literary Collection",
  description: "Explore the LAL Literary Collection: a curated personal archive of books, ideas, and knowledge.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
