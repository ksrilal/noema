import { getEbooks } from "@/lib/ebooks";
import { getBooks, getLibraryOrder } from "@/lib/books";
import { LibraryClient } from "@/components/library-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ books, error }, ebooks, libraryOrder] = await Promise.all([getBooks(), getEbooks(), getLibraryOrder()]);
  return <LibraryClient books={books} ebooks={ebooks} libraryOrder={libraryOrder} error={error} />;
}
