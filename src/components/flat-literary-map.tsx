"use client";
import {useEffect,useMemo,useState} from "react";
import {Minus,Plus,RotateCcw} from "lucide-react";
import type {GlobePin} from "@/components/celestial-globe";
type Topology={arcs:number[][][];transform?:{scale:[number,number];translate:[number,number]};objects:{countries:{geometries:Array<{type:string;arcs:unknown}>}}};
function worldPaths(t:Topology){
 const arcs=t.arcs.map(a=>{let x=0,y=0;return a.map(([dx,dy])=>{x+=dx;y+=dy;return [x*(t.transform?.scale[0]??1)+(t.transform?.translate[0]??0),y*(t.transform?.scale[1]??1)+(t.transform?.translate[1]??0)]})});
 const segment=(id:number)=>{const a=arcs[id<0?~id:id]||[];return id<0?[...a].reverse():a};
 const path=(ids:number[])=>ids.flatMap((id,i)=>{const p=segment(id);return i?p.slice(1):p}).map(([lon,lat],i)=>(i?"L":"M")+((lon+180)/360*1000).toFixed(1)+" "+((90-lat)/180*500).toFixed(1)).join(" ")+"Z";
 return t.objects.countries.geometries.flatMap(g=>g.type==="Polygon"?(g.arcs as number[][]).map(path):g.type==="MultiPolygon"?(g.arcs as number[][][]).flatMap(p=>p.map(path)):[]);
}
export function FlatLiteraryMap({pins,selected,onSelect}:{pins:GlobePin[];selected:string|null;onSelect:(name:string|null)=>void}){
 const [paths,setPaths]=useState<string[]>([]),[error,setError]=useState(false),[zoom,setZoom]=useState(1);
 useEffect(()=>{const controller=new AbortController();fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",{signal:controller.signal}).then(r=>{if(!r.ok)throw Error("Geography unavailable");return r.json()}).then((t:Topology)=>setPaths(worldPaths(t))).catch(e=>{if(e.name!=="AbortError")setError(true)});return()=>controller.abort()},[]);
 const markers=useMemo(()=>pins.map(p=>({...p,x:(p.lon+180)/360*1000,y:(90-p.lat)/180*500})),[pins]);
 return <section className="origin-flat-shell" aria-label="Interactive literary world map">
 <div className="origin-flat-controls"><button type="button" title="Zoom in" onClick={()=>setZoom(z=>Math.min(2,z+.2))}><Plus size={16}/></button><button type="button" title="Zoom out" onClick={()=>setZoom(z=>Math.max(1,z-.2))}><Minus size={16}/></button><button type="button" title="Reset map" onClick={()=>{setZoom(1);onSelect(null)}}><RotateCcw size={16}/></button></div>
 <div className="origin-flat-viewport"><svg viewBox="0 0 1000 500" role="img" aria-label="Flat world map with book origin pins" style={{transform:`scale(${zoom})`}}><defs><radialGradient id="atlasOcean"><stop stopColor="#0a4264"/><stop offset="1" stopColor="#031629"/></radialGradient></defs><rect width="1000" height="500" fill="url(#atlasOcean)"/>{Array.from({length:11},(_,i)=><line key={"v"+i} x1={i*100} x2={i*100} y1="0" y2="500" stroke="#44b9dd" strokeOpacity=".18"/>)}{Array.from({length:6},(_,i)=><line key={"h"+i} x1="0" x2="1000" y1={i*100} y2={i*100} stroke="#44b9dd" strokeOpacity=".18"/>)}<g fill="#4d5841" stroke="#e4b967" strokeWidth=".75">{paths.map((p,i)=><path key={i} d={p}/>)}</g>{markers.map(p=><g key={p.name} className="origin-flat-pin" transform={`translate(${p.x} ${p.y})`} role="button" tabIndex={0} aria-label={p.name+": "+p.count+" books"} onClick={()=>onSelect(selected===p.name?null:p.name)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(selected===p.name?null:p.name)}}}><circle r={selected===p.name?12:9} fill={p.suggested?"#49cce5":"#ffcb6b"} opacity=".35"/><circle r="5" fill={p.suggested?"#75e9ff":"#ffdf90"} stroke="#fff7d5" strokeWidth="1.4"/><text x="10" y="-10" fill="#fff2ca" fontSize="12" stroke="#071526" strokeWidth="3" paintOrder="stroke">{p.count}</text><title>{p.name}: {p.count} books</title></g>)}</svg></div>
 <div className="origin-flat-caption">✦ THE CELESTIAL LITERARY ATLAS ✦</div><div className="origin-flat-note">Select a glowing pin to see books from that origin. Use + / − to zoom.</div>{error?<div className="origin-map-warning">Geographic outlines could not load. Book pins are still available.</div>:null}
 </section>;
}
