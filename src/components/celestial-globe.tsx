"use client";
import {useEffect,useRef,useState} from "react";
import {Minus,Plus,RotateCcw,Pause,Play} from "lucide-react";
type Feature={geometry:{type:string;coordinates:unknown}|null};
export type GlobePin={name:string;lat:number;lon:number;count:number;suggested:boolean};
const RAD=Math.PI/180;
const TARGET_FRAME_MS=1000/24;
function simplifyRing(ring:number[][]){const stride=Math.max(1,Math.ceil(ring.length/450));return ring.filter((_,i)=>i%stride===0||i===ring.length-1)}
function xyz(lon:number,lat:number,rotation:number,tilt:number){const a=(lon-rotation)*RAD,b=lat*RAD,t=tilt*RAD;const x=Math.cos(b)*Math.sin(a),z=Math.cos(b)*Math.cos(a),y=Math.sin(b);return [x,y*Math.cos(t)-z*Math.sin(t),y*Math.sin(t)+z*Math.cos(t)];}
function rings(g:Feature["geometry"]){if(!g)return [] as number[][][];if(g.type==="Polygon")return g.coordinates as number[][][];if(g.type==="MultiPolygon")return (g.coordinates as number[][][][]).flat();return [] as number[][][];}
export function CelestialGlobe({pins,selected,onSelect}:{pins:GlobePin[];selected:string|null;onSelect:(name:string|null)=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),data=useRef<number[][][]>([]),motion=useRef({rotation:10,tilt:-12,zoom:1,spinning:true,drag:false,lastX:0,lastY:0,moved:false,dirty:true}),clicks=useRef<{name:string;x:number;y:number}[]>([]);
 const [spinning,setSpinning]=useState(true),[zoom,setZoom]=useState(1),[error,setError]=useState(false);
 useEffect(()=>{let active=true;fetch("https://cdn.jsdelivr.net/gh/datasets/geo-countries@master/data/countries.geojson").then(r=>{if(!r.ok)throw Error("Geography unavailable");return r.json()}).then((v:{features:Feature[]})=>{if(active)data.current=v.features.flatMap(f=>rings(f.geometry)).map(simplifyRing);motion.current.dirty=true}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[]);
 useEffect(()=>{let frame=0,last=0,lastDraw=0;let visible=true;const onVisibility=()=>{visible=!document.hidden;motion.current.dirty=true};document.addEventListener("visibilitychange",onVisibility);const draw=(time:number)=>{frame=requestAnimationFrame(draw);if(!visible||time-lastDraw<TARGET_FRAME_MS)return;const m=motion.current;if(!m.spinning&&!m.drag&&!m.dirty)return;lastDraw=time;m.dirty=false;const node=canvas.current,ctx=node?.getContext("2d");if(!node||!ctx)return;const box=node.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,1.5),w=box.width,h=box.height;if(!w||!h)return;if(node.width!==Math.round(w*dpr)||node.height!==Math.round(h*dpr)){node.width=Math.round(w*dpr);node.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(m.spinning&&!m.drag&&last)m.rotation=(m.rotation+(time-last)*.003)%360;last=time;const cx=w/2,cy=h/2,r=Math.min(w*.46,h*.46)*m.zoom;const bg=ctx.createRadialGradient(cx-r*.3,cy-r*.4,r*.05,cx,cy,r*1.2);bg.addColorStop(0,"#0b5373");bg.addColorStop(.6,"#052840");bg.addColorStop(1,"#020e20");ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();ctx.clip();
 const line=(points:number[][],color:string,width:number,close=false)=>{ctx.beginPath();let prev:number[]|null=null,started=false;for(const p of points){const [x,y,z]=xyz(p[0],p[1],m.rotation,m.tilt);if(z<=0){prev=null;continue}const pos=[cx+x*r,cy-y*r];if(!prev){ctx.moveTo(pos[0],pos[1]);started=true}else{ctx.lineTo(pos[0],pos[1])}prev=pos}if(started){if(close)ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}};
 for(let lat=-75;lat<=75;lat+=15){const points=Array.from({length:181},(_,i)=>[-180+i*2,lat]);line(points,"#1ac9e044",.6)}for(let lon=-180;lon<180;lon+=15){const points=Array.from({length:91},(_,i)=>[lon,-90+i*2]);line(points,"#1ac9e044",.6)}
 // Fill the visible hemisphere's land, then draw luminous country coastlines.
 // A polygon crossing the horizon is split into front-facing runs to avoid
 // drawing long artificial chords across the globe.
 ctx.shadowBlur=0;
 for(const ring of data.current){
   if(ring.length>10000)continue;
   const projected=ring.map(p=>{const [x,y,z]=xyz(p[0],p[1],m.rotation,m.tilt);return {x:cx+x*r,y:cy-y*r,z}});
   const allFront=projected.every(p=>p.z>=0);
   const visible=projected.filter(p=>p.z>=0);
   if(visible.length<3)continue;
   ctx.beginPath();
   if(allFront){ctx.moveTo(visible[0].x,visible[0].y);for(let i=1;i<visible.length;i++)ctx.lineTo(visible[i].x,visible[i].y);ctx.closePath()}
   else{
     let started=false;
     for(let i=0;i<projected.length;i++){
       const p=projected[i],prev=projected[(i+projected.length-1)%projected.length];
       if(p.z>=0){if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}
       else if(prev.z>=0){ctx.lineTo(p.x,p.y);started=false}
     }
   }
   ctx.fillStyle="#526044";ctx.fill();
   ctx.strokeStyle="#f1ce82";ctx.lineWidth=1.15;ctx.stroke();
 }

 clicks.current=[];for(const pin of pins){const [x,y,z]=xyz(pin.lon,pin.lat,m.rotation,m.tilt);if(z<=0)continue;const px=cx+x*r,py=cy-y*r,active=selected===pin.name;ctx.beginPath();ctx.arc(px,py,active?11:8,0,Math.PI*2);ctx.fillStyle=pin.suggested?"#64e1ff44":"#ffd37c55";ctx.fill();ctx.beginPath();ctx.arc(px,py,active?6:4.5,0,Math.PI*2);ctx.fillStyle=pin.suggested?"#6ee7ff":"#ffd47c";ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=15;ctx.fill();ctx.shadowBlur=0;ctx.font="bold 12px sans-serif";ctx.lineWidth=3;ctx.strokeStyle="#071529";ctx.strokeText(String(pin.count),px+9,py-10);ctx.fillStyle="#fff0bc";ctx.fillText(String(pin.count),px+9,py-10);if(active||r>145){ctx.font=active?"bold 13px sans-serif":"11px sans-serif";const label=pin.name;const lx=px+12,ly=py+15;ctx.lineWidth=3.5;ctx.strokeStyle="#061222";ctx.strokeText(label,lx,ly);ctx.fillStyle=active?"#fff4c5":"#e5d9b9";ctx.fillText(label,lx,ly)}clicks.current.push({name:pin.name,x:px,y:py})}
 ctx.restore();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle="#e5bd6c";ctx.lineWidth=2;ctx.shadowColor="#16b9e8";ctx.shadowBlur=22;ctx.stroke();ctx.shadowBlur=0};frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);document.removeEventListener("visibilitychange",onVisibility)}},[pins,selected]);
 const updateZoom=(delta:number)=>{const next=Math.max(.65,Math.min(1.75,motion.current.zoom+delta));motion.current.zoom=next;motion.current.dirty=true;setZoom(next)};
 return <div className="origin-globe-shell"><canvas ref={canvas} className="origin-globe-canvas" aria-label="Interactive rotating globe with clickable literary origin pins" role="img" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);Object.assign(motion.current,{drag:true,lastX:e.clientX,lastY:e.clientY,moved:false})}} onPointerMove={e=>{const m=motion.current;if(!m.drag)return;const dx=e.clientX-m.lastX,dy=e.clientY-m.lastY;if(Math.abs(dx)+Math.abs(dy)>1)m.moved=true;m.rotation-=dx*.35;m.tilt=Math.max(-80,Math.min(80,m.tilt+dy*.25));m.lastX=e.clientX;m.lastY=e.clientY;m.dirty=true}} onPointerUp={e=>{const m=motion.current;m.drag=false;m.dirty=true;if(!m.moved){const rect=e.currentTarget.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;const hit=clicks.current.find(p=>Math.hypot(p.x-x,p.y-y)<20);if(hit)onSelect(selected===hit.name?null:hit.name)}}} onPointerCancel={()=>{motion.current.drag=false;motion.current.dirty=true}} onWheel={e=>{e.stopPropagation();updateZoom(e.deltaY>0?-.08:.08)}}/>
 <div className="origin-globe-controls"><button type="button" title={spinning?"Pause rotation":"Resume rotation"} onClick={()=>{motion.current.spinning=!motion.current.spinning;motion.current.dirty=true;setSpinning(motion.current.spinning)}}>{spinning?<Pause size={17}/>:<Play size={17}/>}</button><button type="button" title="Zoom in" onClick={()=>updateZoom(.12)}><Plus size={17}/></button><button type="button" title="Zoom out" onClick={()=>updateZoom(-.12)}><Minus size={17}/></button><button type="button" title="Reset globe" onClick={()=>{Object.assign(motion.current,{rotation:10,tilt:-12,zoom:1,spinning:true,dirty:true});setZoom(1);setSpinning(true);onSelect(null)}}><RotateCcw size={17}/></button></div>
 <div className="origin-globe-hint">Drag to spin · Scroll or pinch to zoom · Click a glowing pin</div><div className="origin-globe-label">✦ THE CELESTIAL LITERARY GLOBE ✦</div>{error?<div className="origin-map-warning">Country outlines could not load; origin pins remain available.</div>:null}<span className="origin-globe-sr">Zoom {Math.round(zoom*100)}%</span></div>
}
