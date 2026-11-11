import { getEbooks } from "@/lib/ebooks";
import { getBooks } from "@/lib/books";
import { LibraryClient } from "@/components/library-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { books, error } = await getBooks();
  const ebooks = await getEbooks();
  return <LibraryClient books={books} ebooks={ebooks} error={error} />;
}
