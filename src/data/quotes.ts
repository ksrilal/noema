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
  { id:"jane-eyre-23", bookId:"BK-287", text:"I am no bird; and no net ensnares me; I am a free human being with an independent will", work:"Jane Eyre", author:"Charlotte Brontë", location:"Chapter XXIII", sourceUrl:"https://classicslaunch.org/works/jane-eyre/digest/", mood:"amethyst" },
  { id:"sherlock-scandal", bookId:"BK-521", text:"You see, but you do not observe. The distinction is clear.", work:"The Adventures of Sherlock Holmes", author:"Arthur Conan Doyle", location:"A Scandal in Bohemia", sourceUrl:"https://en.wikisource.org/wiki/The_Adventures_of_Sherlock_Holmes_%281892%2C_US%29/A_Scandal_in_Bohemia", mood:"ocean" },
  { id:"crime-3-5", bookId:"BK-239", text:"Pain and suffering are always inevitable for a large intelligence and a deep heart.", work:"Crime and Punishment", author:"Fyodor Dostoevsky", location:"Part III, Chapter V · Constance Garnett translation", sourceUrl:"https://redlectern.com/quotes/crime-and-punishment", mood:"amber" },
  { id:"meditations-4-3", bookId:"BK-131", text:"The universe is transformation: life is opinion.", work:"Meditations", author:"Marcus Aurelius", location:"Book IV, §3 · George Long translation", sourceUrl:"https://callsfromthepast.com/figures/marcus-aurelius", mood:"amethyst" },
  {"id":"crime-independent-error","bookId":"BK-239","text":"To go wrong in one's own way is better than to go right in someone else's.","work":"Crime and Punishment","author":"Fyodor Dostoevsky","location":"Part III, Chapter I · Constance Garnett translation","sourceUrl":"https://en.wikisource.org/wiki/Page:Crime_and_Punishment_-_Garnett_-_Neilson_-_1917.djvu/235","mood":"amber"},
  {"id":"stoic-habitual-thought","bookId":"BK-131","text":"Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.","work":"Meditations","author":"Marcus Aurelius","location":"Book V, §16 · George Long translation","sourceUrl":"https://stoicismnow.com/read/meditations/5/16","mood":"amethyst"},
  {"id":"iliad-fate","bookId":"BK-293","text":"No one can hurry me down to Hades before my time","work":"The Iliad","author":"Homer","location":"Book VI · Samuel Butler translation","sourceUrl":"https://graciousquotes.com/library/the-iliad-quotes/","mood":"amber"},
  {"id":"odyssey-achilles","bookId":"BK-294","text":"I would rather be a paid servant in a poor man's house and be above ground than king of kings among the dead.","work":"The Odyssey","author":"Homer","location":"Book XI · Samuel Butler translation · Achilles speaking","sourceUrl":"https://en.wikisource.org/wiki/The_Odyssey_(Butler)/Book_XI","mood":"ocean"},
  {"id":"sherlock-data","bookId":"BK-521","text":"It is a capital mistake to theorize before one has data.","work":"The Adventures of Sherlock Holmes","author":"Arthur Conan Doyle","location":"A Scandal in Bohemia","sourceUrl":"https://etc.usf.edu/lit2go/32/the-adventures-of-sherlock-holmes/345/adventure-1-a-scandal-in-bohemia/","mood":"ocean"},
  {"id":"sherlock-evidence","bookId":"BK-216","text":"It is a capital mistake to theorize before you have all the evidence. It biases the judgment.","work":"A Study in Scarlet","author":"Arthur Conan Doyle","location":"Part I, Chapter III","sourceUrl":"https://classicslaunch.org/quotes/a-study-in-scarlet-q1/","mood":"forest"},
  {"id":"sherlock-talent","bookId":"BK-525","text":"Mediocrity knows nothing higher than itself, but talent instantly recognises genius.","work":"The Valley of Fear","author":"Arthur Conan Doyle","location":"Part I, Chapter I","sourceUrl":"https://gutenberg.net.au/pages/doyle.html","mood":"rose"},
  {"id":"jane-independence","bookId":"BK-288","text":"I am no bird; and no net ensnares me: I am a free human being with an independent will","work":"Jane Eyre","author":"Charlotte Brontë","location":"Chapter XXIII · original English text","sourceUrl":"https://en.wikisource.org/wiki/Page:Jane_Eyre_(1st_edition),_Volume_2.djvu/218","mood":"rose"},
];
