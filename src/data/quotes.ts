/** Curated, source-checked excerpts. Add entries only after checking the exact wording.
 * bookId must match the Books sheet. Do not store quotation content in Sheets.
 * Use short passages and record the edition/translation and direct source.
 */
export interface LiteraryQuote {
  id: string;
  bookId: string;
  text: string;
  work: string;
  author: string;
  location: string;
  sourceUrl: string;
  mood: "amethyst" | "rose" | "ocean" | "forest" | "amber";
}
export const literaryQuotes: LiteraryQuote[] = [
  { id:"jane-eyre-38", bookId:"BK-287", text:"Reader, I married him.", work:"Jane Eyre", author:"Charlotte Brontë", location:"Chapter XXXVIII", sourceUrl:"https://victorianweb.org/authors/bronte/cbronte/janeeyre/38.html", mood:"rose" },
  { id:"jane-eyre-23", bookId:"BK-287", text:"I am no bird; and no net ensnares me; I am a free human being with an independent will", work:"Jane Eyre", author:"Charlotte Brontë", location:"Chapter XXIII", sourceUrl:"https://classicslaunch.org/works/jane-eyre/digest/", mood:"amethyst" },
  { id:"wuthering-9", bookId:"BK-320", text:"Whatever our souls are made of, his and mine are the same", work:"Wuthering Heights", author:"Emily Brontë", location:"Chapter IX", sourceUrl:"https://www.gutenberg.org/files/768/768-h/768-h", mood:"forest" },
  { id:"sherlock-scandal", bookId:"BK-521", text:"You see, but you do not observe. The distinction is clear.", work:"The Adventures of Sherlock Holmes", author:"Arthur Conan Doyle", location:"A Scandal in Bohemia", sourceUrl:"https://en.wikisource.org/wiki/The_Adventures_of_Sherlock_Holmes_%281892%2C_US%29/A_Scandal_in_Bohemia", mood:"ocean" },
  { id:"crime-3-5", bookId:"BK-239", text:"Pain and suffering are always inevitable for a large intelligence and a deep heart.", work:"Crime and Punishment", author:"Fyodor Dostoevsky", location:"Part III, Chapter V · Constance Garnett translation", sourceUrl:"https://redlectern.com/quotes/crime-and-punishment", mood:"amber" },
  { id:"meditations-4-3", bookId:"BK-131", text:"The universe is transformation: life is opinion.", work:"Meditations", author:"Marcus Aurelius", location:"Book IV, §3 · George Long translation", sourceUrl:"https://callsfromthepast.com/figures/marcus-aurelius", mood:"amethyst" },
];
