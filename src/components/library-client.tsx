"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, BookCopy,
  BookMarked, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Filter, LayoutDashboard, LibraryBig, Menu, Search, SlidersHorizontal,
  Sparkles, UsersRound, X, Grid2X2, List, Sun, Moon, Monitor, Bookmark, ExternalLink, Maximize2, Minimize2,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import type { Book, LibraryView } from "@/types/book";
import { literaryQuotes } from "@/data/quotes";

const COLORS = ["#8B78E6", "#56B6A6", "#D99B6C", "#719DE2", "#C27DAE", "#A4B96C", "#D3B565", "#8C9EBD"];
const PAGE_SIZE = 12;
const nav: { id: LibraryView; label: string; icon: typeof BookOpen }[] = [
  { id: "home", label: "Home", icon: Sparkles },
  { id: "catalogue", label: "Books", icon: BookOpen },
  { id: "rack", label: "Book Rack", icon: LibraryBig },
  { id: "ebooks", label: "Ebooks", icon: BookMarked },
];
const sectionNav = [
  { id: "collection" as const, label: "Collection", icon: BookOpen },
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "insights" as const, label: "Insights", icon: BarChart3 },
  { id: "authors" as const, label: "Authors", icon: UsersRound },
];

function tally(books: Book[], field: keyof Book) {
  const counts = new Map<string, number>();
  books.forEach((book) => {
    const name = String(book[field] || "Unspecified").trim() || "Unspecified";
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return [...counts].map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}
function normalizeSearch(value: string) {
  return value.toLocaleLowerCase().normalize("NFKC").replace(/[\p{P}\p{S}\s]+/gu, "");
}
function compact(value: number) { return new Intl.NumberFormat("en-US").format(value); }
function shortLabel(text: string, limit = 22) { return text.length > limit ? text.slice(0, limit - 1) + "…" : text; }
function initial(text: string) { return (text.trim()[0] || "B").toUpperCase(); }
function pct(value: number, total: number) { return total ? Math.round((value / total) * 100) : 0; }

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={"panel chart-panel " + className}>
    <div className="panel-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div><span className="heading-mark"><ArrowUpRight size={16} /></span></div>
    {children}
  </section>;
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><BookCopy size={31} strokeWidth={1.4}/><h3>{title}</h3><p>{description}</p></div>;
}
function Donut({ data, total }: { data: { name: string; value: number }[]; total: number }) {
  return <div className="donut-layout">
    <div className="donut-chart">
      <ResponsiveContainer width="100%" height={230}>
        <PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={96} stroke="none" paddingAngle={2}>
          {data.map((item, i) => <Cell key={item.name} fill={COLORS[i % COLORS.length]} />)}
        </Pie><Tooltip formatter={(value) => compact(Number(value ?? 0))}/></PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><strong>{compact(total)}</strong><span>books</span></div>
    </div>
    <div className="legend">{data.slice(0, 8).map((item, i) => <div className="legend-row" key={item.name}>
      <span className="legend-name"><i style={{ backgroundColor: COLORS[i % COLORS.length] }} />{item.name}</span><span className="legend-value">{pct(item.value, total)}%</span>
    </div>)}</div>
  </div>;
}
function CategoryBars({ data }: { data: { name: string; value: number }[] }) {
  return <div className="bars">
    {data.slice(0, 8).map((item, index) => <div className="bar-line" key={item.name}>
      <div className="bar-header"><span title={item.name}>{shortLabel(item.name, 35)}</span><strong>{item.value}</strong></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: (data[0] ? item.value / data[0].value * 100 : 0) + "%", background: COLORS[index % COLORS.length] }}/></div>
    </div>)}
  </div>;
}
function StatusTag({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  return <span className={"status-tag " + (normalized === "available" ? "status-available" : normalized === "ordered" ? "status-ordered" : "status-missing")}>
    <i />{value}
  </span>;
}
const COVER_PALETTES = [
  ["#5B3CC4", "#9875F1"], ["#315D86", "#78A8DA"],
  ["#1F7778", "#6DC3B7"], ["#975475", "#D99AB8"],
  ["#835A35", "#D6A66B"], ["#495B9A", "#929FE4"],
  ["#556A48", "#A3BC80"], ["#7C4F9B", "#BA91D5"],
  ["#9B555A", "#D88B8F"], ["#396D86", "#7CC3CE"],
  ["#765C9B", "#AD98DC"], ["#846A46", "#C5AC80"],
] as const;
function coverPalette(id: string) {
  // Stable per-book color, so sorting and filtering never changes its cover.
  let hash = 0;
  for (const char of id) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return COVER_PALETTES[(hash >>> 0) % COVER_PALETTES.length];
}
function BookTile({ book, onClick }: { book: Book; onClick: () => void }) {
  return <button type="button" className="book-tile" onClick={onClick}>
    <span className="book-cover patterned-cover" style={{ background: `linear-gradient(135deg, ${coverPalette(book.id)[0]}, ${coverPalette(book.id)[1]})` }}><span className="cover-books" aria-hidden="true"><BookOpen size={56} strokeWidth={1.15}/></span><span className="cover-foot">NOEMA</span></span>
    <span className="book-tile-content"><span className="book-id">{book.id} · {book.driveLink ? book.format || "Ebook" : "Physical"}</span><strong className="book-title">{book.title}</strong><span className="book-author">{book.author || "Author not listed"}</span><StatusTag value={book.availability} /></span>
    <ArrowUpRight size={16} className="book-tile-arrow"/>
  </button>;
}

export function LibraryClient({ books, ebooks = [], error }: { books: Book[]; ebooks?: Book[]; error: string | null }) {
  const [view, setView] = useState<LibraryView>("home");
  const [section, setSection] = useState<"rack" | "ebooks">("rack");
  const [expanded, setExpanded] = useState<Record<"rack" | "ebooks", boolean>>({rack: true, ebooks: false});
  const [reading, setReading] = useState<Book | null>(null);
  const [readerFullscreen, setReaderFullscreen] = useState(false);
  const allBooks = useMemo(() => [...books, ...ebooks], [books, ebooks]);
  const visibleBooks = view === "catalogue" ? allBooks : (view === "ebooks" || (["overview", "insights", "collection", "authors"].includes(view) && section === "ebooks")) ? ebooks : books;
  const [query, setQuery] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [category, setCategory] = useState("All categories");
  const [language, setLanguage] = useState("All languages");
  const [availability, setAvailability] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Book | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catalogueMode, setCatalogueMode] = useState<"grid" | "list">("grid");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  useEffect(() => { setQuoteIndex(Math.floor(Math.random() * literaryQuotes.length)); }, []);
  useEffect(() => {
    const saved = window.localStorage.getItem("noema-theme");
    if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved);
    const savedMode = window.localStorage.getItem("noema-catalogue-mode");
    if (savedMode === "grid" || savedMode === "list") setCatalogueMode(savedMode);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { document.documentElement.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme; };
    apply();
    media.addEventListener("change", apply);
    window.localStorage.setItem("noema-theme", theme);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  const chooseCatalogueMode = (mode: "grid" | "list") => {
    setCatalogueMode(mode);
    window.localStorage.setItem("noema-catalogue-mode", mode);
  };

  const categories = useMemo(() => tally(visibleBooks, "category").map((x) => x.name), [visibleBooks]);
  const languages = useMemo(() => tally(visibleBooks, "language").map((x) => x.name), [visibleBooks]);
  const statuses = useMemo(() => tally(visibleBooks, "availability").map((x) => x.name), [visibleBooks]);
  const filtered = useMemo(() => visibleBooks.filter((book) => {
    const term = normalizeSearch(query.trim());
    // Search each original field and every Romanized alias independently.
    // Tokenized matching lets "martin madol" find a title by its author and title.
    const searchableFields = [
      book.id, book.title, book.author, book.translator,
      book.category, book.subcategory, book.subject,
      ...book.romanizedTitle.split("|"),
    ].map(normalizeSearch).filter(Boolean);
    const words = query.trim().split(/\s+/).map(normalizeSearch).filter(Boolean);
    const joined = normalizeSearch(searchableFields.join(" "));
    const matches = !term || searchableFields.some(field => field.includes(term)) ||
      joined.includes(term) || words.every(word => searchableFields.some(field => field.includes(word)));
    return matches &&
      (category === "All categories" || category === book.category) &&
      (language === "All languages" || language === book.language) &&
      (availability === "All statuses" || availability === book.availability);
  }), [visibleBooks, query, category, language, availability]);
  const categoryData = useMemo(() => tally(filtered, "category"), [filtered]);
  const languageData = useMemo(() => tally(filtered, "language"), [filtered]);
  const statusData = useMemo(() => tally(filtered, "availability"), [filtered]);
  const unavailableBooks = useMemo(() => filtered.filter(book => book.availability.toLowerCase() === "unavailable"), [filtered]);
  const borrowerRecorded = unavailableBooks.filter(book => book.borrowedBy && !/^(unknown|n\/a|not known|\?)$/i.test(book.borrowedBy)).length;
  const borrowingDatesRecorded = unavailableBooks.filter(book => book.borrowedDate && !/^(unknown|n\/a|not known|\?)$/i.test(book.borrowedDate)).length;
  const authors = useMemo(() => tally(filtered.filter((b) => b.author), "author"), [filtered]);
  const totalAuthors = useMemo(() => new Set(allBooks.map((b) => b.author).filter(Boolean)).size, [allBooks]);
  const homeCategories = useMemo(() => tally(allBooks, "category").slice(0,5), [allBooks]);
  const homeLanguages = useMemo(() => tally(allBooks, "language").slice(0,4), [allBooks]);
  const homeAvailable = useMemo(() => allBooks.filter(b => b.availability.trim().toLowerCase() === "available").length, [allBooks]);
  const shownBooks = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activeFilters = query !== "" || category !== "All categories" || language !== "All languages" || availability !== "All statuses";
  const clear = () => { setQuery(""); setCategory("All categories"); setLanguage("All languages"); setAvailability("All statuses"); setPage(1); };
  const chooseView = (next: LibraryView) => { if(next === "rack" || next === "ebooks"){setSection(next);setExpanded(current=>({...current,[next]:true}));} setView(next === "rack" || next === "ebooks" ? "collection" : next); setSidebarOpen(false); setPage(1); setQuery(""); setCategory("All categories"); setLanguage("All languages"); setAvailability("All statuses"); };
  const chooseSectionPage = (parent: "rack" | "ebooks", next: "overview" | "insights" | "collection" | "authors") => { setSection(parent); setExpanded(current=>({...current,[parent]:true})); chooseView(next); };
  const activeSection = view === "rack" || view === "ebooks" ? view : ["collection", "overview", "insights", "authors"].includes(view) ? section : null;
  const bookCount = (status: string) => filtered.filter((b) => b.availability.toLowerCase() === status).length;
  const uniqueSubcategories = new Set(filtered.map((b) => b.subcategory).filter(Boolean)).size;
  const quote = literaryQuotes[quoteIndex % literaryQuotes.length];
  const quoteBook = allBooks.find(book => book.id === quote.bookId);
  const nextQuote = () => setQuoteIndex(index => (index + 1 + Math.floor(Math.random() * (literaryQuotes.length - 1))) % literaryQuotes.length);
  const subtitle = ({ rack: "Your physical collection and its stories.", ebooks: "Your digital shelves, ready to explore.", home: "A place where every page opens a new world.", overview: "A living portrait of your personal library.", catalogue: "Every format, one thoughtful collection.", insights: "Discover the patterns behind your collection.", collection: "Explore every volume in this collection.", authors: "The voices that shape your shelves." } as Record<LibraryView, string>)[view];

  return <div className="app-shell">
    <aside className={"sidebar " + (sidebarOpen ? "sidebar-open" : "")}>
      <div className="sidebar-top"><div className="brand-symbol"><BookOpen size={24} strokeWidth={2.2}/></div><div><div className="brand-name">NOEMA</div><div className="brand-subtitle">LĀL LITERARY COLLECTION</div></div></div>
      <div className="sidebar-caption">YOUR LIBRARY</div>
      <nav aria-label="Primary navigation">{nav.map(({ id, label, icon: Icon }) => <div key={id} className="nav-group"><button type="button" className={"nav-link " + ((view === id || activeSection === id) ? "nav-link-active" : "")} onClick={() => {if(id === "rack" || id === "ebooks"){setExpanded(current=>({...current,[id]:!current[id]}));}else{chooseView(id);}}}><Icon size={19} strokeWidth={1.7}/><span>{label}</span>{id === "rack" || id === "ebooks" ? <ChevronDown size={15} className={"nav-chevron "+(expanded[id]?"nav-chevron-open":"")}/> : null}{(view === id || activeSection === id) ? <span className="nav-indicator" /> : null}</button>{(id === "rack" || id === "ebooks") && expanded[id] ? <div className="nav-submenu">{sectionNav.map(({id:child,label:childLabel,icon:ChildIcon})=><button type="button" key={child} className={"nav-sublink "+(view===child && section===id?"nav-sublink-active":"")} onClick={()=>chooseSectionPage(id,child)}><ChildIcon size={16}/><span>{childLabel}</span></button>)}</div> : null}</div>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-footer"><span className="live-dot" /> READ-ONLY COLLECTION <span>v1.0</span></div></div>
    </aside>
    {sidebarOpen ? <button className="mobile-scrim" aria-label="Close menu" onClick={() => setSidebarOpen(false)} /> : null}
    <main className="main">
      <header className="topbar"><button className="menu-toggle icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={22}/></button><div className="breadcrumb">Collection <ChevronRight size={14}/><span>{["collection","overview","insights","authors"].includes(view) ? (section === "rack" ? "Book Rack" : "Ebooks") + " / " + sectionNav.find(n=>n.id===view)?.label : nav.find((n) => n.id === view)?.label}</span></div><div className="topbar-right"><div className="theme-control"><button type="button" className="theme-trigger" aria-label="Select color theme" aria-expanded={themeMenuOpen} onClick={() => setThemeMenuOpen(!themeMenuOpen)}>{theme === "light" ? <Sun size={18}/> : theme === "dark" ? <Moon size={18}/> : <Monitor size={18}/>}<span>{theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}</span><ChevronDown size={14}/></button>{themeMenuOpen ? <div className="theme-menu" role="group" aria-label="Color theme">{([["system","System",Monitor],["light","Light",Sun],["dark","Dark",Moon]] as const).map(([value,label,Icon])=><button type="button" key={value} className={theme === value ? "theme-option selected" : "theme-option"} onClick={()=>{setTheme(value);setThemeMenuOpen(false);}}><Icon size={16}/>{label}{theme === value ? <Check size={14}/> : null}</button>)}</div> : null}</div><div className="avatar">L</div></div></header>
      <div className="page">
        <div className="intro"><div><div className="eyebrow"><span className="eyebrow-line"/> THE ART OF COLLECTING KNOWLEDGE</div><h1>{view === "home" ? <>Where words <em>remain.</em></> : view === "overview" ? <>{section === "rack" ? "Book Rack" : "Ebooks"} <em>overview.</em></> : view === "catalogue" ? <>All <em>books.</em></> : view === "collection" ? <>{section === "rack" ? "Book Rack" : "Ebooks"} <em>collection.</em></> : view === "rack" ? <>Your <em>book rack.</em></> : view === "ebooks" ? <>Digital <em>library.</em></> : view === "insights" ? <>{section === "rack" ? "Book Rack" : "Ebooks"} <em>insights.</em></> : <>{section === "rack" ? "Book Rack" : "Ebooks"} <em>authors.</em></>}</h1><p>{subtitle}</p></div><div className="intro-mark"><LibraryBig size={28} strokeWidth={1.2}/></div></div>
        {error ? <div role="alert" className="setup-notice"><CircleHelp size={21}/><div><strong>Your collection is temporarily unavailable</strong><p>Please try again later.</p></div></div> : null}
        {view !== "home" ? <section className="filter-panel" aria-label="Library filters">
          <div className="search-wrap"><Search size={18}/><input aria-label="Search books" placeholder="Search title, author, translator, editor or book ID…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}/></div>
          <div className="select-wrap"><Filter size={16}/><select aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option>All categories</option>{categories.map((x) => <option key={x}>{x}</option>)}</select><ChevronDown size={15}/></div>
          <div className="select-wrap"><select aria-label="Filter by language" value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }}><option>All languages</option>{languages.map((x) => <option key={x}>{x}</option>)}</select><ChevronDown size={15}/></div>
          <div className="select-wrap"><select aria-label="Filter by availability" value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }}><option>All statuses</option>{statuses.map((x) => <option key={x}>{x}</option>)}</select><ChevronDown size={15}/></div>
          {activeFilters ? <button type="button" className="clear-button" onClick={clear}><X size={15}/> Clear</button> : null}
        </section> : null}
        {view !== "home" ? <div className="result-strip"><span><SlidersHorizontal size={15}/> Showing <strong>{compact(filtered.length)}</strong> of <strong>{compact(visibleBooks.length)}</strong> volumes</span></div> : null}

        {view === "home" ? <>
          <section className={"literary-hero literary-"+quote.mood} aria-label="Featured literary quotation">
            <div className="literary-glow literary-glow-one"/><div className="literary-glow literary-glow-two"/>
            <div className="literary-book-art" aria-hidden="true"><div className="literary-book-aura"/><div className="literary-floating-glyph glyph-one">✧</div><div className="literary-floating-glyph glyph-two">✦</div><div className="literary-floating-glyph glyph-three">·</div><div className="literary-book"><div className="literary-book-shadow"/><div className="literary-book-cover left-cover"/><div className="literary-book-cover right-cover"/><div className="literary-book-page page-left"/><div className="literary-book-page page-right"/><div className="literary-book-page page-turn-one"/><div className="literary-book-page page-turn-two"/><div className="literary-book-spine"/></div></div>
            <div className="literary-hero-inner">
              <div className="literary-eyebrow">WORDS FROM YOUR COLLECTION</div>
              
              <blockquote className="literary-quote" key={quote.id}><span className="literary-quote-open" aria-hidden="true">“</span>{quote.text}<span className="literary-quote-close" aria-hidden="true">”</span></blockquote>
              <div className="literary-attribution"><div className="literary-rule"/><div><strong>{quote.work}</strong><span>{quote.author} · {quote.location}</span></div></div>
              <div className="literary-actions"><button type="button" className="literary-next" onClick={nextQuote}>Another passage <ArrowRight size={18}/></button>{quoteBook ? <button type="button" className="literary-outline" onClick={()=>setSelected(quoteBook)}>Explore this volume <BookOpen size={17}/></button> : null}</div>
            </div>
            <div className="literary-side-text" aria-hidden="true">NOEMA · LĀL LITERARY COLLECTION</div>
          </section>
          <div className="literary-bottom"><div><span className="section-kicker">YOUR COMPLETE LIBRARY</span><h2>More than a collection.<br/><em>A world of thought.</em></h2><p>Explore the complete archive, bringing together physical books and digital reading in one place.</p><button className="literary-browse" type="button" onClick={()=>chooseView("catalogue")}>Explore {compact(allBooks.length)} volumes <ArrowRight size={17}/></button></div><div className="literary-bottom-stats"><div><strong>{compact(allBooks.length)}</strong><span>Total volumes</span></div><div><strong>{compact(books.length)}</strong><span>Physical books</span></div><div><strong>{compact(ebooks.length)}</strong><span>Ebooks</span></div><div><strong>{compact(totalAuthors)}</strong><span>Distinct authors</span></div></div></div>
          <section className="home-collections" aria-label="Explore collections"><div className="section-heading"><div><span className="section-kicker">TWO WAYS TO READ</span><h2>Explore your collections</h2></div></div><div className="home-collection-grid"><button type="button" className="home-collection-card" onClick={()=>chooseSectionPage("rack","collection")}><span className="home-collection-icon"><LibraryBig size={27}/></span><span className="home-collection-copy"><small>PHYSICAL COLLECTION</small><strong>Book Rack</strong><span>{compact(books.length)} volumes · {compact(books.filter(b=>b.availability.trim().toLowerCase()==="available").length)} available</span></span><ArrowUpRight size={22}/></button><button type="button" className="home-collection-card" onClick={()=>chooseSectionPage("ebooks","collection")}><span className="home-collection-icon"><BookMarked size={27}/></span><span className="home-collection-copy"><small>DIGITAL COLLECTION</small><strong>Ebooks</strong><span>{compact(ebooks.length)} volumes · {compact(ebooks.filter(b=>(b.format || "").toLowerCase()==="pdf").length)} PDFs · {compact(ebooks.filter(b=>(b.format || "").toLowerCase()==="epub").length)} EPUBs</span></span><ArrowUpRight size={22}/></button></div></section>
          <section className="home-discovery" aria-label="Combined collection insights"><div className="section-heading"><div><span className="section-kicker">THE BIGGER PICTURE</span><h2>Your library at a glance</h2></div></div><div className="home-discovery-grid"><div className="home-discovery-panel"><h3>Collection mix</h3><div className="home-mix-track"><span style={{width:(allBooks.length?books.length/allBooks.length*100:0)+"%"}}/></div><div className="home-mix-legend"><span><i/> Physical {pct(books.length,allBooks.length)}%</span><span><i/> Digital {pct(ebooks.length,allBooks.length)}%</span></div><p>{compact(homeAvailable)} volumes marked available across both formats.</p></div><div className="home-discovery-panel"><h3>Leading categories</h3>{homeCategories.map((item,index)=><div className="home-category-row" key={item.name}><span title={item.name}>{item.name}</span><div><i style={{width:(homeCategories[0]?item.value/homeCategories[0].value*100:0)+"%",background:COLORS[index%COLORS.length]}}/></div><strong>{item.value}</strong></div>)}</div><div className="home-discovery-panel"><h3>Reading languages</h3>{homeLanguages.map((item,index)=><div className="home-category-row" key={item.name}><span>{item.name}</span><div><i style={{width:(homeLanguages[0]?item.value/homeLanguages[0].value*100:0)+"%",background:COLORS[index%COLORS.length]}}/></div><strong>{item.value}</strong></div>)}</div></div></section>
        </> : null}

        {view === "overview" ? <>
          <div className="kpi-grid">
            <div className="kpi-card"><div className="kpi-top"><span>Total volumes</span><BookCopy size={18}/></div><strong>{compact(filtered.length)}</strong><p><ArrowUpRight size={14}/> Across {categoryData.length} categories</p></div>
            <div className="kpi-card"><div className="kpi-top"><span>On your shelves</span><BookMarked size={18}/></div><strong>{compact(bookCount("available"))}</strong><p><ArrowUpRight size={14}/> {pct(bookCount("available"), filtered.length)}% of collection</p></div>
            <div className="kpi-card"><div className="kpi-top"><span>Distinct authors</span><UsersRound size={18}/></div><strong>{compact(authors.length)}</strong><p><Activity size={14}/> {compact(totalAuthors)} across full library</p></div>
            <div className="kpi-card"><div className="kpi-top"><span>Awaiting arrival</span><BookOpen size={18}/></div><strong>{compact(bookCount("ordered"))}</strong><p><ArrowDownRight size={14}/> {compact(bookCount("unavailable"))} currently unavailable</p></div>
          </div>
          <div className="dashboard-grid">
            <ChartCard title="Collection composition" subtitle="Distribution by subject category"><Donut data={categoryData} total={filtered.length}/></ChartCard>
            <ChartCard title="Category landscape" subtitle="Where your collection is concentrated"><CategoryBars data={categoryData}/></ChartCard>
            <ChartCard title="Most collected authors" subtitle="The leading voices on your shelves"><div className="author-list">{authors.slice(0, 6).map((author, index) => <div className="author-row" key={author.name}><span className="author-rank">{String(index + 1).padStart(2,"0")}</span><span className="author-name" title={author.name}>{author.name}</span><strong>{author.value}</strong><span className="author-unit">books</span></div>)}{!authors.length ? <EmptyState title="No authors yet" description="Author insights will appear when your sheet is connected."/> : null}</div></ChartCard>
            <ChartCard title="Language & availability" subtitle="A closer look at your library"><div className="mini-heading">Languages represented <strong>{languageData.length}</strong></div><div className="language-list">{languageData.slice(0,5).map((item,i)=><div key={item.name}><span>{item.name}</span><div className="language-track"><span style={{width:pct(item.value,filtered.length)+"%",background:COLORS[i%COLORS.length]}}/></div><strong>{pct(item.value,filtered.length)}%</strong></div>)}</div><div className="mini-heading availability-heading">Collection status</div><div className="status-summary">{statusData.map((item)=><div key={item.name}><StatusTag value={item.name}/><strong>{item.value}</strong></div>)}</div></ChartCard>
          </div>
          <div className="section-heading"><div><span className="section-kicker">DISCOVER</span><h2>Explore your collection</h2></div><button onClick={() => chooseView("catalogue")} className="text-link">View all books <ArrowRight size={17}/></button></div>
          {filtered.length ? <div className="book-grid">{filtered.slice(0,4).map((book)=><BookTile key={book.id} book={book} onClick={() => setSelected(book)}/>)}</div> : <EmptyState title="Your library awaits" description="Try changing your filters to discover more books."/>}
        </> : null}

        {(view === "catalogue" || view === "rack" || view === "ebooks" || view === "collection") ? <>
          <div className="section-heading catalogue-heading"><div><span className="section-kicker">THE ARCHIVE</span><h2>{filtered.length} curated volumes</h2></div><div className="catalogue-actions"><span className="muted-note">Select a volume to explore or read</span><div className="view-switch" role="group" aria-label="Catalogue layout"><button type="button" aria-label="Grid view" aria-pressed={catalogueMode === "grid"} className={catalogueMode === "grid" ? "active" : ""} onClick={()=>chooseCatalogueMode("grid")}><Grid2X2 size={17}/></button><button type="button" aria-label="List view" aria-pressed={catalogueMode === "list"} className={catalogueMode === "list" ? "active" : ""} onClick={()=>chooseCatalogueMode("list")}><List size={18}/></button></div></div></div>
          {filtered.length ? <>{catalogueMode === "grid" ? <div className="book-grid catalogue-grid">{shownBooks.map((book)=><BookTile key={book.id} book={book} onClick={() => setSelected(book)}/>)}</div> : <div className="catalogue-list"><div className="list-head"><span>BOOK</span><span>AUTHOR</span><span>CATEGORY</span><span>STATUS</span><span></span></div>{shownBooks.map(book=><button type="button" key={book.id} className="list-book" onClick={()=>setSelected(book)}><span className="list-book-primary"><span className="list-book-icon"><BookOpen size={19}/></span><span><strong>{book.title}</strong><small>{book.id} · {book.language}</small></span></span><span className="list-author">{book.author || "Not specified"}</span><span className="list-category">{book.category}</span><span><StatusTag value={book.availability}/></span><ArrowUpRight size={17}/></button>)}</div>}<div className="pagination"><span>Page {page} of {pages}</span><div><button aria-label="Previous page" disabled={page===1} onClick={()=>setPage((p)=>Math.max(1,p-1))}><ChevronLeft size={18}/></button><button aria-label="Next page" disabled={page>=pages} onClick={()=>setPage((p)=>Math.min(pages,p+1))}><ChevronRight size={18}/></button></div></div></> : <EmptyState title="No books found" description="Try a broader search or clear the active filters."/>}
        </> : null}

        {view === "insights" ? <>
          <div className="kpi-grid insight-stats"><div className="kpi-card"><div className="kpi-top"><span>Categories</span><LibraryBig size={18}/></div><strong>{categoryData.length}</strong><p>Distinct subject areas</p></div><div className="kpi-card"><div className="kpi-top"><span>Subcategories</span><Filter size={18}/></div><strong>{uniqueSubcategories}</strong><p>Areas of specialization</p></div><div className="kpi-card"><div className="kpi-top"><span>Languages</span><BookOpen size={18}/></div><strong>{languageData.length}</strong><p>Unique language labels</p></div><div className="kpi-card"><div className="kpi-top"><span>Availability rate</span><Activity size={18}/></div><strong>{pct(bookCount("available"),filtered.length)}<small>%</small></strong><p>Currently on your shelves</p></div></div>
          <div className="dashboard-grid"><ChartCard title="Categories, compared" subtitle="Ranked by volume count"><div className="category-comparison">{categoryData.slice(0,8).map((item,index)=><div className="category-comparison-row" key={item.name}><div className="category-comparison-label"><span title={item.name}>{item.name}</span><strong>{compact(item.value)}</strong></div><div className="category-comparison-track"><div className="category-comparison-fill" style={{width: (categoryData[0] ? item.value/categoryData[0].value*100 : 0)+"%",backgroundColor:COLORS[index%COLORS.length]}}/></div></div>)}</div></ChartCard>{section === "ebooks" ? <ChartCard title="Digital formats" subtitle="File formats across your ebook collection"><div className="borrowing-insights"><div className="borrowing-stats"><div><span>PDF documents</span><strong>{filtered.filter(book=>(book.format||"").toLowerCase()==="pdf").length}</strong></div><div><span>EPUB books</span><strong>{filtered.filter(book=>(book.format||"").toLowerCase()==="epub").length}</strong></div><div><span>Other formats</span><strong>{filtered.filter(book=>!["pdf","epub"].includes((book.format||"").toLowerCase())).length}</strong></div><div><span>Files with links</span><strong>{filtered.filter(book=>Boolean(book.driveLink)).length}</strong></div></div><p className="muted-note">Formats and file links are based on the ebook catalogue metadata.</p></div></ChartCard> : <ChartCard title="Borrowing & missing volumes" subtitle="Unavailable volumes and known borrowing records">
  <div className="borrowing-insights">
    <div className="borrowing-stats">
      <div><span>Unavailable</span><strong>{unavailableBooks.length}</strong></div>
      <div><span>Borrower known</span><strong>{borrowerRecorded}</strong></div>
      <div><span>Borrower unknown</span><strong>{unavailableBooks.length-borrowerRecorded}</strong></div>
      <div><span>Dates recorded</span><strong>{borrowingDatesRecorded}</strong></div>
    </div>
    <div className="borrowing-records">
      {unavailableBooks.length ? unavailableBooks.map(book => <button type="button" className="borrowing-record" key={book.id} onClick={() => setSelected(book)}>
        <span className="borrowing-record-main"><small>{book.id}</small><strong>{book.title}</strong><span>{book.borrowedBy && !/^(unknown|n\/a|not known|\?)$/i.test(book.borrowedBy) ? "Borrowed by: "+book.borrowedBy : "Borrower: Unknown"}</span></span>
        <span className="borrowing-record-date">{book.borrowedDate && !/^(unknown|n\/a|not known|\?)$/i.test(book.borrowedDate) ? book.borrowedDate : "Date unknown"}</span>
      </button>) : <p className="muted-note">No unavailable volumes match the current filters.</p>}
    </div>
  </div>
</ChartCard>}<ChartCard title="Language distribution" subtitle="Represented reading languages"><Donut data={languageData} total={filtered.length}/></ChartCard><ChartCard title="Availability breakdown" subtitle="Available, ordered and missing"><Donut data={statusData} total={filtered.length}/></ChartCard><ChartCard title="Top authors" subtitle="Most represented creators"><CategoryBars data={authors.slice(0,8)}/></ChartCard><ChartCard title="Catalogue completeness" subtitle="Metadata coverage across the current selection">
  <div className="metadata-coverage">
    {([
      {label:"Author identified",count:filtered.filter(book => book.author.trim()).length,color:COLORS[0]},
      {label:"Translator / editor recorded",count:filtered.filter(book => book.translator.trim()).length,color:COLORS[1]},
      {label:"Romanized search indexed",count:filtered.filter(book => book.romanizedTitle.trim()).length,color:COLORS[3]},
      {label:"Language specified",count:filtered.filter(book => book.language.trim() && book.language !== "Unspecified").length,color:COLORS[4]},
      {label:"Medium specified",count:filtered.filter(book => book.medium.trim() && book.medium !== "Unspecified").length,color:COLORS[5]},
    ]).map(item => <div className="metadata-row" key={item.label}>
      <div className="metadata-label"><span>{item.label}</span><strong>{pct(item.count,filtered.length)}%</strong></div>
      <div className="metadata-track"><div style={{width:pct(item.count,filtered.length)+"%",backgroundColor:item.color}}/></div>
      <small>{compact(item.count)} of {compact(filtered.length)} volumes</small>
    </div>)}
    <p className="metadata-hint">Translator / editor details may legitimately be blank for original works. Percentages measure coverage, not errors.</p>
  </div>
</ChartCard></div>
          <div className="insight-note"><Sparkles size={20}/><div><strong>Explore interactively</strong><p>Use the filters above to compare a category, language, or availability status. Every chart and metric updates together as you explore your collection.</p></div></div>
        </> : null}

        {view === "authors" ? <><div className="section-heading catalogue-heading"><div><span className="section-kicker">CREATORS & THINKERS</span><h2>{authors.length} distinct authors</h2></div><span className="muted-note">Based on currently filtered volumes</span></div>{authors.length ? <div className="author-grid">{authors.map((author,index)=><button type="button" className="author-card" key={author.name} onClick={()=>{setQuery(author.name);setCategory("All categories");setLanguage("All languages");setAvailability("All statuses");chooseView("catalogue");}}><span className="author-monogram">{initial(author.name)}</span><span className="author-detail"><small>{String(index+1).padStart(2,"0")} / AUTHOR</small><strong>{author.name}</strong><span>{author.value} {author.value===1?"volume":"volumes"}</span></span><ArrowUpRight size={17}/></button>)}</div> : <EmptyState title="No authors found" description="Clear the active filters to see more authors."/>}</> : null}
        <footer className="site-footer"><span>© NOEMA · LĀL Literary Collection</span><span>Read only. Thoughtfully curated.</span></footer>
      </div>
    </main>
    {reading ? <div className={"reader-layer " + (readerFullscreen ? "reader-fullscreen" : "")} role="dialog" aria-modal="true" aria-label={"Reading "+reading.title}><div className="reader-toolbar"><div><small>NOEMA READER · {reading.id}</small><strong>{reading.title}</strong></div><div className="reader-actions"><a title="Open original" target="_blank" rel="noopener noreferrer" href={reading.driveLink}><ExternalLink size={18}/></a><button aria-label="Toggle reader size" onClick={()=>setReaderFullscreen(!readerFullscreen)}>{readerFullscreen?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button><button aria-label="Close reader" onClick={()=>{setReading(null);setReaderFullscreen(false);}}><X size={19}/></button></div></div><div className="reader-body">{reading.format === "PDF" && reading.driveId ? <iframe title={"Reading "+reading.title} src={"https://drive.google.com/file/d/"+encodeURIComponent(reading.driveId)+"/preview"} allow="autoplay" referrerPolicy="no-referrer"/> : <div className="reader-fallback"><BookOpen size={54}/><h2>Open this EPUB in Google Drive</h2><p>In-browser EPUB rendering requires a downloadable file endpoint. Your original ebook is available through the link below.</p><a href={reading.driveLink} target="_blank" rel="noopener noreferrer">Open ebook <ExternalLink size={16}/></a></div>}</div></div> : null}
    {selected ? <div className="modal-layer" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setSelected(null);}}><section className="book-dialog" role="dialog" aria-modal="true" aria-label={"Book details: "+selected.title}><div className="dialog-top"><span>VOLUME DETAILS · {selected.id}</span><button className="icon-button" aria-label="Close book details" onClick={()=>setSelected(null)}><X size={19}/></button></div><div className="dialog-cover"><BookOpen size={48} strokeWidth={1.1}/><span>NOEMA COLLECTION</span></div><h2>{selected.title}</h2><p className="dialog-author">{selected.author || "Author not listed"}</p><StatusTag value={selected.availability}/>{selected.driveLink ? <div className="ebook-dialog-actions"><button type="button" onClick={()=>{setReading(selected);setSelected(null);}}>Read ebook <BookOpen size={17}/></button><a href={selected.driveLink} target="_blank" rel="noopener noreferrer">Open in Drive <ExternalLink size={16}/></a></div> : null}<div className="book-facts">{([["Category",selected.category],["Subcategory",selected.subcategory],["Subject",selected.subject],["Translator / Editor",selected.translator],["Language",selected.language],["Medium",selected.medium],["Format",selected.format || ""],["Availability reason",selected.availabilityReason],...(selected.availability.toLowerCase() === "unavailable" ? [["Borrowed by",selected.borrowedBy || "Unknown"],["Borrowed date",selected.borrowedDate || "Unknown"]] as [string,string][] : []),["Last updated",selected.lastUpdated]] as const).filter((x)=>x[1]).map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section></div> : null}
  </div>;
}
