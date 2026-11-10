import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noema | LĀL Literary Collection",
  description: "Explore the LĀL Literary Collection: a curated personal archive of books, ideas, and knowledge.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
