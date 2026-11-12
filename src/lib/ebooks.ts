import "server-only";
import { JWT } from "google-auth-library";
import { parse } from "csv-parse/sync";
import snapshot from "@/data/ebooks.json";
import type { Book } from "@/types/book";

type EbookRow = {id:string;title:string;author:string;language:string;format:string;category:string;filename:string;driveLink:string;notes:string;origin?:string};
const SHEET_ID = process.env.EBOOK_SHEET_ID || "1EyLbrK3oB0dQOJ6qTCEV2asLsV4qJtdA2O7kBm17OmM";
const SHEET_TAB = "Ebooks";
function mapRows(rows:EbookRow[]):Book[] {
  return rows.filter(row=>row.id && row.title).map(row=>({
    id:row.id,title:row.title,author:row.author,romanizedTitle:"",translator:"",category:row.category,
    subcategory:"",subject:row.notes,origin:row.origin||"",medium:"Digital",language:row.language,availability:"Available",
    availabilityReason:"",borrowedBy:"",borrowedDate:"",lastUpdated:"",printed:false,
    format:row.format,driveLink:row.driveLink,driveId:row.driveLink.match(/\/d\/([^/]+)/)?.[1] || ""
  }));
}
async function liveRows():Promise<EbookRow[]> {
  const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key=process.env.GOOGLE_PRIVATE_KEY;
  let csv:string;
  if(email && key) {
    const jwt=new JWT({email,key:key.replace(/\\n/g,"\n"),scopes:["https://www.googleapis.com/auth/spreadsheets.readonly"]});
    const {token}=await jwt.getAccessToken();
    if(!token) throw new Error("No Google access token");
    const range=encodeURIComponent("'"+SHEET_TAB+"'!A1:ZZ");
    const res=await fetch("https://sheets.googleapis.com/v4/spreadsheets/"+SHEET_ID+"/values/"+range,{headers:{Authorization:"Bearer "+token},next:{revalidate:900}});
    if(!res.ok) throw new Error("Ebook sheet not accessible: "+res.status);
    const body=await res.json() as {values?:string[][]};
    const [headers=[],...values]=body.values||[];
    return values.map(v=>Object.fromEntries(headers.map((h,i)=>[h,v[i]||""]))).map((r:Record<string,string>)=>({
      id:r["Ebook ID"]||"",title:r["Title"]||"",author:r["Author / Creator"]||"",language:r["Language"]||"",
      format:r["Format"]||"",category:r["Category"]||"",filename:r["Filename"]||"",driveLink:r["Google Drive Link"]||"",notes:r["Notes"]||"",origin:r["Origin"]||r["Original Country"]||r["Country of Origin"]||""
    }));
  }
  const url="https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/gviz/tq?tqx=out:csv&sheet="+encodeURIComponent(SHEET_TAB);
  const res=await fetch(url,{next:{revalidate:900}});
  if(!res.ok) throw new Error("Public ebook catalogue unavailable");
  csv=await res.text();
  if(!csv.includes("Ebook ID")) throw new Error("Ebook catalogue is private");
  return (parse(csv,{columns:true,bom:true,skip_empty_lines:true}) as Record<string,string>[]).map(r=>({
    id:r["Ebook ID"]||"",title:r["Title"]||"",author:r["Author / Creator"]||"",language:r["Language"]||"",
    format:r["Format"]||"",category:r["Category"]||"",filename:r["Filename"]||"",driveLink:r["Google Drive Link"]||"",notes:r["Notes"]||"",origin:r["Origin"]||r["Original Country"]||r["Country of Origin"]||""
  }));
}
export async function getEbooks():Promise<Book[]> {
  try {const live=await liveRows();if(live.length) return mapRows(live);}
  catch(error) {console.warn("[NOEMA] Using last catalogued ebook snapshot:",error instanceof Error?error.message:"unknown");}
  return mapRows(snapshot as EbookRow[]);
}
