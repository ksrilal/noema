import { getBooks } from "@/lib/books";
import { LibraryClient } from "@/components/library-client";

export default async function Home() {
  const { books, error } = await getBooks();
  return <LibraryClient books={books} error={error} />;
}
