 "use client";
import {useEffect,useState} from "react";
import {BookOpen,FileText,Lightbulb,Network,Library,MessageSquare,ChevronRight,Plus,Send} from "lucide-react";
import {getSupabase} from "../../../lib/supabase";

type Msg={role:"user"|"assistant";content:string};
export default function Workspace({params}:{params:{id:string}}){
 const id=params.id; const [snapshot,setSnapshot]=useState<any>(null); const [mode,setMode]=useState("ask"); const [q,setQ]=useState(""); const [messages,setMessages]=useState<Msg[]>([]); const [evidence,setEvidence]=useState<any[]>([]); const [loading,setLoading]=useState(false); const [note,setNote]=useState("");
 async function load(){const supabase=getSupabase(); const {data,error}=await supabase.rpc("workspace_snapshot",{p_project_id:id}); if(!error)setSnapshot(data)}
 useEffect(()=>{load()},[id]);
 async function ask(){const supabase=getSupabase(); if(!q.trim()||loading)return;const question=q.trim();setQ("");setMessages(m=>[...m,{role:"user",content:question}]);setLoading(true);
  const context=JSON.stringify({project:snapshot?.project,claims:snapshot?.claims,notes:snapshot?.notes,sources:snapshot?.sources,passages:snapshot?.passages});
  const {data,error}=await supabase.functions.invoke("research-assistant-rag",{body:{project_id:id,question,mode,context}});
  setMessages(m=>[...m,{role:"assistant",content:error?.message||data?.answer||"No response returned."}]);setLoading(false);
 }
 async function saveNote(){const supabase=getSupabase(); if(!note.trim())return;const {data:u}=await supabase.auth.getUser();if(!u.user)return;await supabase.from("notes").insert({project_id:id,user_id:u.user.id,note_type:"observation",content:note});setNote("");load()}
 async function addClaim(){const supabase=getSupabase(); const {data:u}=await supabase.auth.getUser();if(!u.user)return;const text=prompt("Claim");if(!text)return;await supabase.from("claims").insert({project_id:id,author_id:u.user.id,claim_text:text,claim_type:"theological"});load()}
 const p=snapshot?.project;
 return <div className="app">
  <aside className="left"><div className="brand">TheologyLab</div><div className="nav">
   <button className="active"><BookOpen size={15}/> Research</button><button><Library size={15}/> Library</button><button><Network size={15}/> Arguments</button>
  </div>
  <div className="section"><div className="section-title">Project</div><div className="item active">{p?.title||"Loading…"}</div></div>
  <div className="section"><div className="section-title">Research objects</div>
   <div className="item"><span><BookOpen size={14}/> Passages</span><span>{snapshot?.passages?.length||0}</span></div>
   <div className="item"><span><Lightbulb size={14}/> Notes</span><span>{snapshot?.notes?.length||0}</span></div>
   <div className="item"><span><Network size={14}/> Claims</span><span>{snapshot?.claims?.length||0}</span></div>
   <div className="item"><span><FileText size={14}/> Sources</span><span>{snapshot?.sources?.length||0}</span></div>
  </div>
  </aside>
  <main className="main"><header className="top"><div><strong>{p?.title||"Research Workspace"}</strong><div className="muted small">{p?.research_question||"Build and test a defensible biblical argument."}</div></div><div className="row"><span className="tag">Draft</span><button className="btn">Export</button></div></header>
   <section className="workspace"><div className="toolbar"><button className="btn"><Plus size={14}/> Passage</button><button className="btn" onClick={addClaim}><Plus size={14}/> Claim</button><button className="btn"><Plus size={14}/> Evidence</button></div>
    <div className="passage"><div className="row"><strong>Jeremiah 31:31–34</strong><span className="tag">Text workspace</span></div>
     {["Behold, the days are coming, declares the LORD, when I will make a new covenant with the house of Israel and the house of Judah.","Not like the covenant that I made with their fathers on the day when I took them by the hand to bring them out of the land of Egypt.","This is the covenant that I will make with the house of Israel after those days, declares the LORD.","And no longer shall each one teach his neighbor and each his brother, saying, ‘Know the LORD,’ for they shall all know me."].map((v,i)=><div className="verse" key={i}><span className="verse-no">{31+i}</span><span>{v}</span></div>)}
    </div>
    <div className="card"><div className="row"><h3>Claims</h3><button className="btn" onClick={addClaim}>+ Add</button></div>{snapshot?.claims?.length?snapshot.claims.map((c:any)=><div className="claim" key={c.id}><strong>{c.claim_text}</strong><div className="muted small">{c.claim_type} · {c.status}</div></div>):<div className="muted">No claims yet. Add one when you have a proposition you want to test.</div>}</div>
    <div className="card"><h3>Quick note</h3><div className="row"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Record an observation…" style={{flex:1,padding:9,border:"1px solid #ccc",borderRadius:7}}/><button className="btn dark" onClick={saveNote}>Save</button></div></div>
    <div className="card"><h3>Recent notes</h3>{snapshot?.notes?.length?snapshot.notes.slice(0,8).map((n:any)=><div className="note" key={n.id}>{n.content}<div className="muted small">{n.note_type}</div></div>):<div className="muted">Your observations will appear here.</div>}</div>
   </section>
  </main>
  <aside className="right"><div className="right-head"><div className="row"><strong>Research Assistant</strong><MessageSquare size={16}/></div><p className="muted small">Reason from your project context. Distinguish text, evidence and interpretation.</p><div className="modes">{["ask","examine","compare","challenge","trace"].map(x=><button key={x} className={"mode "+(mode===x?"active":"")} onClick={()=>setMode(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div></div>
   <div className="chat">{messages.length?messages.map((m,i)=><div key={i} className={"bubble "+m.role}>{m.content}</div>):<div className="muted">Ask a question and TheologyLab will retrieve relevant material from this project’s source corpus before answering.</div>}{loading&&<div className="bubble assistant">Researching…</div>}</div>
   {evidence.length>0&&<div style={{borderTop:"1px solid #ddd",padding:"12px",maxHeight:220,overflow:"auto"}}><strong>Retrieved evidence</strong>{evidence.map((e:any)=><div key={e.ref} style={{marginTop:8,padding:"8px",background:"#f7f7f5",borderRadius:7,fontSize:12}}><div><strong>[{e.ref}]</strong> · p. {e.page??"?"} · similarity {Number(e.similarity||0).toFixed(3)}</div><div style={{marginTop:4,lineHeight:1.4}}>{e.content}</div></div>)}</div>}
   <div className="composer"><textarea value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}}} placeholder={`Run ${mode}…`}/><div className="row" style={{marginTop:7}}><span className="muted small">Enter to run · Shift+Enter for new line</span><button className="btn dark" onClick={ask}><Send size={14}/> Run</button></div></div>
  </aside>
 </div>
}