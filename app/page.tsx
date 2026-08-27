"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../lib/supabase";

type Msg={role:"user"|"assistant";content:string};
type Project={id:string;title:string;research_question:string|null;description:string|null;status:string};

export default function Home(){
 const supabase=useMemo(()=>getSupabase(),[]);
 const [user,setUser]=useState<any>(null);
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [authMessage,setAuthMessage]=useState("");
 const [projects,setProjects]=useState<Project[]>([]); const [projectId,setProjectId]=useState(""); const [snapshot,setSnapshot]=useState<any>(null);
 const [newTitle,setNewTitle]=useState(""); const [newQuestion,setNewQuestion]=useState("");
 const [sourceTitle,setSourceTitle]=useState(""); const [sourceAuthor,setSourceAuthor]=useState(""); const [sourceText,setSourceText]=useState(""); const [sourceMessage,setSourceMessage]=useState("");
 const [mode,setMode]=useState("ask"); const [question,setQuestion]=useState(""); const [messages,setMessages]=useState<Msg[]>([]); const [evidence,setEvidence]=useState<any[]>([]); const [aiBusy,setAiBusy]=useState(false);

 useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUser(data.user);if(data.user)loadProjects()});const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{setUser(s?.user??null);if(s?.user)loadProjects()});return()=>l.subscription.unsubscribe()},[]);

 async function signIn(){setAuthMessage("Signing in...");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)return setAuthMessage("Sign in failed: "+error.message);setAuthMessage("")}
 async function signOut(){await supabase.auth.signOut();setUser(null);setProjects([]);setProjectId("");setSnapshot(null)}
 async function loadProjects(){const {data,error}=await supabase.from("projects").select("id,title,research_question,description,status").order("updated_at",{ascending:false});if(!error){setProjects((data||[]) as Project[]);if(!projectId&&data?.[0])await selectProject(data[0].id)}}
 async function selectProject(id:string){setProjectId(id);const {data,error}=await supabase.rpc("workspace_snapshot",{p_project_id:id});if(!error)setSnapshot(data)}
 async function createProject(){if(!newTitle.trim())return;const {data,error}=await supabase.rpc("create_research_project",{p_title:newTitle.trim(),p_question:newQuestion.trim()||null,p_description:null});if(error)return alert(error.message);setNewTitle("");setNewQuestion("");await loadProjects();if(data)await selectProject(data)}
 async function callEdge(name:string,body:any){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token) return {data:null,error:new Error("Your session has expired. Please sign in again.")};
  try{
   const response=await fetch("/api/edge",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${session.access_token}`},
    body:JSON.stringify({name,body})
   });
   const data=await response.json().catch(()=>({error:"Invalid server response"}));
   if(!response.ok) return {data,error:new Error(data?.error||`Request failed (${response.status})`)};
   return {data,error:null};
  }catch(error:any){
   return {data:null,error};
  }
 }
 async function ingestSource(){if(!projectId||!sourceTitle.trim()||!sourceText.trim())return;setSourceMessage("Ingesting source...");const {data,error}=await supabase.rpc("ingest_source_text",{p_project_id:projectId,p_title:sourceTitle.trim(),p_author:sourceAuthor.trim()||null,p_source_type:"article",p_text:sourceText});if(error||data?.error)return setSourceMessage("Source error: "+(data?.error||error?.message));setSourceMessage(`Source saved and chunked (${data.chunks} chunks). Embedding job queued.`);setSourceTitle("");setSourceAuthor("");setSourceText("");await selectProject(projectId)}
 async function runEmbedding(){const source=snapshot?.sources?.[0]?.source;if(!source)return setSourceMessage("Add a source first.");const {data:docs}=await supabase.from("source_documents").select("id").eq("source_id",source.id).order("created_at",{ascending:false}).limit(1);const doc=docs?.[0];if(!doc)return setSourceMessage("No source document found.");const {data:jobs}=await supabase.from("embedding_jobs").select("id,status").eq("document_id",doc.id).order("created_at",{ascending:false}).limit(1);const job=jobs?.[0];if(!job)return setSourceMessage("No embedding job found.");setSourceMessage("Running embeddings...");const {data,error}=await callEdge("embedding-worker",{job_id:job.id});if(error||data?.error)return setSourceMessage("Embedding error: "+(data?.error||error?.message));setSourceMessage(`Embedding status: ${data.status}. Remaining chunks: ${data.remaining??0}`)}
 async function askAI(){if(!projectId||!question.trim()||aiBusy)return;const q=question.trim();setQuestion("");setMessages(m=>[...m,{role:"user",content:q}]);setAiBusy(true);const {data,error}=await callEdge("research-assistant-rag",{project_id:projectId,question:q,mode});if(error||data?.error){setMessages(m=>[...m,{role:"assistant",content:"AI error: "+(data?.error||error?.message)}]);setEvidence([])}else{setMessages(m=>[...m,{role:"assistant",content:data.answer||"No answer returned."}]);setEvidence(data.evidence||[])}setAiBusy(false)}

 if(!user)return <main className="login"><h1>TheologyLab</h1><p className="muted">Sign in to your research workspace</p><div className="stack"><input className="input" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/><input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn primary" onClick={signIn}>Sign in</button>{authMessage&&<p>{authMessage}</p>}</div></main>;

 return <div className="shell">
  <aside className="left"><div className="brand">TheologyLab</div><button className="navbtn active">Research</button><button className="navbtn">Library</button><button className="navbtn">Arguments</button><hr style={{border:0,borderTop:"1px solid #ddd",margin:"18px 0"}}/><div className="row"><strong>Projects</strong><span className="badge">{projects.length}</span></div><div className="stack" style={{marginTop:10}}>{projects.map(p=><div key={p.id} className={"project "+(p.id===projectId?"active":"")} onClick={()=>selectProject(p.id)}><strong>{p.title}</strong><div className="muted small">{p.research_question||"No research question yet."}</div></div>)}</div><button className="btn" style={{marginTop:18}} onClick={signOut}>Sign out</button></aside>
  <main className="main"><header className="top"><div><strong>{snapshot?.project?.title||"Research Workspace"}</strong><div className="muted small">{snapshot?.project?.research_question||"Create or select a project."}</div></div><span className="badge">{snapshot?.project?.status||"—"}</span></header><section className="content">
   <div className="card"><h2>Create project</h2><div className="grid2"><input className="input" placeholder="Project title" value={newTitle} onChange={e=>setNewTitle(e.target.value)}/><input className="input" placeholder="Research question" value={newQuestion} onChange={e=>setNewQuestion(e.target.value)}/></div><button className="btn primary" style={{marginTop:10}} onClick={createProject}>Create project</button></div>
   {projectId&&<><div className="card"><div className="row"><h2>Source Library</h2><span className="badge">{snapshot?.sources?.length||0} sources</span></div><div className="grid2"><input className="input" placeholder="Source title" value={sourceTitle} onChange={e=>setSourceTitle(e.target.value)}/><input className="input" placeholder="Author" value={sourceAuthor} onChange={e=>setSourceAuthor(e.target.value)}/></div><textarea className="textarea" style={{marginTop:10}} placeholder="Paste source text here for the first validation version..." value={sourceText} onChange={e=>setSourceText(e.target.value)}/><div style={{marginTop:10}}><button className="btn primary" onClick={ingestSource}>Add source</button><button className="btn" style={{marginLeft:8}} onClick={runEmbedding}>Run embeddings</button></div>{sourceMessage&&<p className="small">{sourceMessage}</p>}<div className="stack">{(snapshot?.sources||[]).map((x:any)=><div className="project" key={x.source.id}><strong>{x.source.title}</strong><div className="muted small">{x.source.author||"Unknown author"}</div></div>)}</div></div><div className="card"><h2>Claims & Notes</h2><p className="muted">Backend support is active. The next UI pass will add inline claim/evidence editing and passage annotation.</p><div className="grid2"><div><strong>Claims</strong><div className="muted">{snapshot?.claims?.length||0}</div></div><div><strong>Notes</strong><div className="muted">{snapshot?.notes?.length||0}</div></div></div></div></>}
  </section></main>
  <aside className="right"><h2>Research Assistant</h2><p className="muted small">Retrieves project sources before answering.</p><div className="modebar">{["ask","examine","compare","challenge","trace"].map(m=><button key={m} className={"mode "+(m===mode?"active":"")} onClick={()=>setMode(m)}>{m}</button>)}</div><div className="chat">{messages.map((m,i)=><div key={i} className={"bubble "+m.role}>{m.content}</div>)}{aiBusy&&<div className="bubble assistant">Researching project sources…</div>}{evidence.map((e:any)=><div key={e.ref} className="evidence"><strong>[{e.ref}]</strong> p. {e.page??"?"}<div>{e.content}</div></div>)}</div><textarea className="textarea" placeholder="Ask a research question…" value={question} onChange={e=>setQuestion(e.target.value)}/><button className="btn primary" onClick={askAI}>Run {mode}</button></aside>
 </div>
}
