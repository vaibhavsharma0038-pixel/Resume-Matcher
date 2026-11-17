import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FileText, UploadCloud, Sparkles, CheckCircle2, AlertCircle, Target, ArrowRight, LoaderCircle, RefreshCw } from 'lucide-react';
import './style.css';

const API = 'http://localhost:8000';
function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const choose = f => { if (f && f.type === 'application/pdf') { setFile(f); setError(''); } else setError('Please choose a PDF resume.'); };
  async function analyze(e) {
    e.preventDefault(); setError(''); setResult(null);
    if (!file) return setError('Upload your resume PDF first.');
    if (jd.trim().length < 40) return setError('Paste a complete job description (at least 40 characters).');
    const body = new FormData(); body.append('resume', file); body.append('job_description', jd);
    setBusy(true);
    try { const r = await fetch(`${API}/api/analyze`, { method: 'POST', body }); const data = await r.json(); if (!r.ok) throw new Error(data.detail || 'Something went wrong.'); setResult(data); }
    catch (err) { setError(err.message + (err.message.includes('fetch') ? ' Make sure the backend is running at localhost:8000.' : '')); }
    finally { setBusy(false); }
  }
  return <div className="page"><header className="top"><a className="brand" href="#"><span className="brandmark">C9</span><span>CareerFit <small>RESUME INTELLIGENCE</small></span></a><span className="topnote"><span className="dot"/> Built for placement season</span></header>
    <main><section className="hero"><div className="eyebrow"><Sparkles size={14}/> YOUR NEXT OPPORTUNITY STARTS HERE</div><h1>Make your resume<br/><em>match the opportunity.</em></h1><p>Compare your resume with a job description and get a clear match score, skill gaps, and stronger bullet points — grounded in your real experience.</p></section>
    <form className="workspace" onSubmit={analyze}><div className="formhead"><div><span className="step">STEP 01</span><h2>Add your details</h2><p>Start with your resume and the role you're targeting.</p></div><div className="secure"> <CheckCircle2 size={15}/> Private by design</div></div>
      <div className="fields"><div className="field"><label><span className="num">1</span> Your resume <span className="muted">PDF only · max 8 MB</span></label><label className={`drop ${drag?'drag':''}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);choose(e.dataTransfer.files[0])}}><input type="file" accept="application/pdf" onChange={e=>choose(e.target.files[0])}/><span className="uploadicon"><UploadCloud size={22}/></span><strong>{file ? file.name : 'Drop your resume here'}</strong><span>{file ? `${(file.size/1024/1024).toFixed(2)} MB · Ready to analyze` : 'or click to browse files'}</span>{file && <span className="fileok"><CheckCircle2 size={14}/> PDF attached</span>}</label></div>
      <div className="field"><label htmlFor="jd"><span className="num">2</span> Job description</label><textarea id="jd" value={jd} onChange={e=>setJd(e.target.value)} placeholder={'Paste the job description here...\n\nInclude responsibilities, required skills, qualifications, and experience.'}/><div className="under">{jd.length.toLocaleString()} characters</div></div></div>
      {error && <div className="error"><AlertCircle size={17}/>{error}</div>}
      <button className="primary" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18}/> Reviewing your resume...</> : <>Analyze my resume <ArrowRight size={18}/></>}</button><p className="fine">Your resume is processed for this analysis and is not saved by this demo app. Avoid uploading documents containing information you do not want to share with an AI service.</p>
    </form>
    {result && <section className="results" id="results"><div className="resulthead"><div><span className="step">STEP 02 · YOUR REVIEW</span><h2>Your resume, decoded.</h2><p>{result.score_summary}</p></div><button className="secondary" onClick={()=>{setResult(null);window.scrollTo({top:0,behavior:'smooth'})}}><RefreshCw size={15}/> New review</button></div>
      <div className="scorecard"><div className="score"><strong>{result.match_score}</strong><span>/100</span><small>OVERALL MATCH</small></div><div className="scoretext"><h3>Here's how you line up</h3><p>A useful guide to alignment, not a hiring decision or a guarantee of an interview.</p><div className="bar"><i style={{width:`${result.match_score}%`}}/></div></div></div>
      <div className="panel"><h3><Target size={19}/> Score breakdown</h3><div className="breakdown">{result.score_reasons.map((x,i)=><div className="reason" key={i}><div><b>{x.category}</b><p>{x.reason}</p></div><strong>{x.points}<small> / {x.maximum}</small></strong></div>)}</div></div>
      <div className="two"><div className="panel"><h3><CheckCircle2 size={19}/> Skills you already show</h3><div className="chips">{result.matching_skills.length ? result.matching_skills.map((s,i)=><span className="chip good" key={i}>{s}</span>) : <p>No clear matches identified yet.</p>}</div>{result.strengths.map((s,i)=><p className="bullet" key={i}>✓ {s}</p>)}</div><div className="panel"><h3><AlertCircle size={19}/> Skill gaps to work on</h3>{result.skill_gaps.map((s,i)=><div className="gap" key={i}><div className="gapline"><b>{s.name}</b><span className={`tag ${s.status}`}>{s.status}</span></div><p>{s.evidence}</p><small>{s.recommendation}</small></div>)}</div></div>
      <div className="panel"><h3><FileText size={19}/> Stronger resume bullet points</h3><p className="panelintro">These edits improve clarity while staying within the experience in your resume.</p>{result.rewritten_bullets.map((b,i)=><div className="rewrite" key={i}><div><small>YOUR ORIGINAL</small><p>{b.original}</p></div><div className="improved"><small> SUGGESTED VERSION</small><p>{b.improved}</p><span>{b.note}</span></div></div>)}</div>
      <div className="panel next"><h3><ArrowRight size={19}/> Your next steps</h3><ol>{result.next_steps.map((s,i)=><li key={i}>{s}</li>)}</ol><div className="honesty"><b>Accuracy note</b><p>{result.honesty_check}</p></div></div>
      <details className="raw"><summary>View structured JSON output (for project demonstration)</summary><pre>{JSON.stringify(result,null,2)}</pre></details>
    </section>}
    <footer><span>C9 · CAREERFIT</span><span>Designed to help students present their real strengths.</span></footer></main></div>
}

createRoot(document.getElementById('root')).render(<App/>);
