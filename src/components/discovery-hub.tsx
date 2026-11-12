"use client";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Compass, Globe2, Lightbulb, MapPinned, Moon, Shuffle, Sparkles, Sun, WandSparkles } from "lucide-react";
import type { Book } from "@/types/book";
import { LiteraryOriginMap } from "@/components/literary-origin-map";

type Mode = "grand" | "journeys" | "constellation" | "world";
type Mood = "classic" | "candle" | "moon" | "rain";
const paths = [
  {name:"Philosophy & Ideas", words:["philosophy","philosoph","දර්ශන","thinking","meditations","wisdom","මනෝ"], note:"Explore questions, arguments and ways of thinking."},
  {name:"Mythology & Epic", words:["myth","ramayana","mahabharata","iliad","odyssey","රාමායණ","මහාභාරත","ඔඩිසි","ඉලියඩ්"],note:"Stories, symbols and ancient epics."},
  {name:"Buddhist Thought",words:["buddh","dhamma","ධර්ම","බුද්ධ","සූත්‍ර","sutta"],note:"Teachings, reflection and contemplative literature."},
  {name:"Mysteries & Detectives",words:["detective","sherlock","mystery","crime","හෝම්ස්","රහස්"],note:"Follow clues, puzzles and mysteries."},
  {name:"Technology & Engineering",words:["software","technology","engineering","program","computer","security","cyber","තාක්ෂණ"],note:"Practical ideas and technical discovery."},
];
const regions = [
  {name:"South Asia",x:69,y:53,terms:["sri lanka","india","sinhala","සිංහල","ශ්‍රී ලංකා","ඉන්දියා","ramayana","mahabharata","buddh"]},
  {name:"East Asia",x:80,y:37,terms:["japan","china","korea","ජපාන","චීන","ජපන්","genji"]},
  {name:"Europe",x:48,y:31,terms:["greece","greek","england","britain","france","germany","ග්‍රීක","sherlock","iliad","odyssey"]},
  {name:"Americas",x:22,y:47,terms:["america","american","usa","united states","ඇමරිකා"]},
  {name:"Africa",x:48,y:62,terms:["africa","african","අප්‍රිකා"]},
  {name:"Oceania",x:87,y:76,terms:["australia","new zealand","ඕස්ට්‍රේලියා"]},
];
function seed(s:string){let n=0;for(const c of s)n=(Math.imul(n,31)+c.charCodeAt(0))|0;return n>>>0;}
function matches(book:Book,terms:string[]){const hay=[book.title,book.author,book.category,book.subcategory,book.subject,book.language,book.romanizedTitle].join(" ").toLocaleLowerCase();return terms.some(w=>hay.includes(w.toLocaleLowerCase()));}
function pick(books:Book[],n:number){return [...books].sort((a,b)=>seed(a.id+n.toString())-seed(b.id+n.toString()));}
export function DiscoveryHub({books,onBook,onShelf}:{books:Book[];onBook:(book:Book)=>void;onShelf:(term:string)=>void}){
 const [mode,setMode]=useState<Mode>("grand");
 const [mood,setMood]=useState<Mood>("classic");
 const [roll,setRoll]=useState(1);
 const [selectedPath,setSelectedPath]=useState(0);
 const [selectedRegion,setSelectedRegion]=useState(0);
 const [selectedNode,setSelectedNode]=useState<string|null>(null);
 const [recommend,setRecommend]=useState<Book|null>(null);
 const categoryCounts=useMemo(()=>{const counts=new Map<string,number>();books.forEach(b=>counts.set(b.category||"Uncategorized",(counts.get(b.category||"Uncategorized")||0)+1));return [...counts].sort((a,b)=>b[1]-a[1]).slice(0,14);},[books]);
 const treasure=useMemo(()=>{const counts=new Map<string,number>();books.forEach(b=>{const author=b.author.trim().toLocaleLowerCase();if(author)counts.set(author,(counts.get(author)||0)+1)});const eligible=books.filter(b=>{const author=b.author.trim().toLocaleLowerCase();return author&&counts.get(author)===1}).sort((a,b)=>seed(a.id)-seed(b.id));if(!eligible.length)return [];const start=((roll-1)*5)%eligible.length;return Array.from({length:Math.min(5,eligible.length)},(_,i)=>eligible[(start+i)%eligible.length]);},[books,roll]);
 const pathBooks=useMemo(()=>pick(books.filter(b=>matches(b,paths[selectedPath].words)),1).slice(0,18),[books,selectedPath]);
 const regionBooks=useMemo(()=>books.filter(b=>matches(b,regions[selectedRegion].terms)).slice(0,20),[books,selectedRegion]);
 const nodeBooks=useMemo(()=>selectedNode?books.filter(b=>b.category===selectedNode).slice(0,16):[],[books,selectedNode]);
 const recommendBook=()=>{if(books.length){const b=books[seed(String(Date.now())+roll)%books.length];setRecommend(b);setRoll(x=>x+1);}};
 return <div className={"noema-discovery atmosphere-"+mood}>
 <header className="discovery-header"><div><span className="section-kicker">NOEMA · THE LITERARY WORLD</span><h2>Beyond the bookshelf</h2><p>Discover stories, explore connections, and let the library surprise you.</p></div><div className="discovery-moods" aria-label="Reading atmosphere">{([{id:"classic",name:"Classic",icon:Sun},{id:"candle",name:"Candlelight",icon:Sparkles},{id:"moon",name:"Moonlight",icon:Moon},{id:"rain",name:"Rainy evening",icon:Globe2}] as const).map(item=><button key={item.id} type="button" aria-pressed={mood===item.id} title={item.name} onClick={()=>setMood(item.id)}><item.icon size={16}/><span>{item.name}</span></button>)}</div></header>
 <div className="discovery-feature-grid"><section className="discovery-feature"><div className="discovery-feature-icon"><WandSparkles size={26}/></div><div><span className="section-kicker">THE LIBRARIAN'S RECOMMENDATION</span><h3>Let the wizard choose</h3><p>One unexpected volume from the complete collection.</p><button type="button" onClick={recommendBook}><Shuffle size={16}/> Surprise me</button></div>{recommend?<div className="discovery-picked"><strong>{recommend.title}</strong><span>{recommend.author||"Unknown author"}</span><button type="button" onClick={()=>onBook(recommend)}>Open book <ArrowRight size={15}/></button></div>:null}</section><section className="discovery-feature"><div className="discovery-feature-icon"><Lightbulb size={26}/></div><div><span className="section-kicker">HIDDEN TREASURES</span><h3>Overlooked discoveries</h3><p>Works by authors represented only once in this collection.</p><button type="button" onClick={()=>setRoll(x=>x+1)}><Shuffle size={16}/> Find more</button></div><div className="discovery-treasure-list">{treasure.map(b=><button type="button" key={b.id} onClick={()=>onBook(b)}>{b.title}<ArrowRight size={13}/></button>)}{!treasure.length?<span>No matching treasures in this collection.</span>:null}</div></section></div>
 <div className="discovery-tabs" role="tablist" aria-label="Literary exploration">{([{id:"grand",name:"Grand Library",icon:BookOpen},{id:"journeys",name:"Literary Journeys",icon:Compass},{id:"constellation",name:"Constellation",icon:Sparkles},{id:"world",name:"World Map",icon:MapPinned}] as const).map(t=><button key={t.id} role="tab" type="button" aria-selected={mode===t.id} className={mode===t.id?"selected":""} onClick={()=>setMode(t.id)}><t.icon size={17}/>{t.name}</button>)}</div>
 {mode==="grand"?<section className="discovery-room"><div className="discovery-room-header"><span className="section-kicker">THE GRAND LIBRARY</span><h3>Choose a wing of the library</h3><p>Each doorway opens books matching that subject. This is a stylized interactive room rather than a 3D engine.</p></div><div className="discovery-room-wings">{paths.map((p,i)=><button type="button" key={p.name} onClick={()=>{setSelectedPath(i);setMode("journeys");}}><span className="discovery-arch"><BookOpen size={34}/><i/></span><strong>{p.name}</strong><small>{books.filter(b=>matches(b,p.words)).length} related volumes</small></button>)}</div><button className="discovery-enter-shelves" type="button" onClick={()=>onShelf("")}>Enter the full bookshelf <ArrowRight size={17}/></button></section>:null}
 {mode==="journeys"?<section className="discovery-panel"><div className="discovery-panel-heading"><span className="section-kicker">CURATED BY TOPIC</span><h3>Literary Journeys</h3><p>Suggested exploration paths generated from catalogue titles and categories; not a prescribed reading order.</p></div><div className="discovery-chip-row">{paths.map((p,i)=><button key={p.name} type="button" aria-pressed={selectedPath===i} onClick={()=>setSelectedPath(i)}>{p.name}</button>)}</div><p>{paths[selectedPath].note}</p><div className="discovery-book-grid">{pathBooks.map((b,i)=><button key={b.id} type="button" onClick={()=>onBook(b)}><span className="discovery-book-num">{String(i+1).padStart(2,"0")}</span><strong>{b.title}</strong><small>{b.author||"Unknown author"}</small><ArrowRight size={16}/></button>)}{!pathBooks.length?<p>No catalogue matches for this journey yet.</p>:null}</div></section>:null}
 {mode==="constellation"?<section className="discovery-panel"><div className="discovery-panel-heading"><span className="section-kicker">BOOKS · SUBJECTS · CONNECTIONS</span><h3>Literary Constellation</h3><p>Select a glowing subject to explore its books. Connections are based on shared catalogue categories.</p></div><div className="discovery-stars"><svg viewBox="0 0 800 350" preserveAspectRatio="none" aria-hidden="true">{categoryCounts.map((_,i)=><line key={i} x1="400" y1="175" x2={90+(i%7)*103} y2={i<7?70:285} stroke="#b7a1f0" strokeOpacity=".25" strokeWidth="1.5"/>)}</svg><span className="discovery-star-core">NOEMA</span>{categoryCounts.map(([name,count],i)=><button type="button" key={name} className={selectedNode===name?"active":""} style={{left:(10+(i%7)*13)+"%",top:(i<7?20:76)+"%"}} onClick={()=>setSelectedNode(name)} title={name+" · "+count+" books"}><span>✦</span>{name}<small>{count}</small></button>)}</div>{selectedNode?<><h4>{selectedNode}</h4><div className="discovery-book-grid">{nodeBooks.map(b=><button type="button" key={b.id} onClick={()=>onBook(b)}><strong>{b.title}</strong><small>{b.author}</small><ArrowRight size={15}/></button>)}</div></>:null}</section>:null}
 {mode==="world"?<LiteraryOriginMap books={books} onBook={onBook}/>:null}
 </div>;
}
