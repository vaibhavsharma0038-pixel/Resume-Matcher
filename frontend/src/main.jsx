import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Briefcase,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LoaderCircle,
  RefreshCw,
  Sun,
  Moon,
  UploadCloud,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronDown,
  X
} from 'lucide-react';
import './style.css';

const API = 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('c9_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const resultsRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('c9_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const choose = f => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  async function analyze(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) return setError('Please upload your resume PDF to begin.');
    if (jd.trim().length < 40) return setError('Please paste a full job description (at least 40 characters).');

    const body = new FormData();
    body.append('resume', file);
    body.append('job_description', jd);

    setBusy(true);
    try {
      const r = await fetch(`${API}/api/analyze`, { method: 'POST', body });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Analysis could not be completed.');
      setResult(data);
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(
        err.message +
        (err.message.includes('fetch') ? ' Backend not reachable. Ensure uvicorn is running on port 8000.' : '')
      );
    } finally {
      setBusy(false);
    }
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Strong Candidate';
    if (score >= 55) return 'Moderate Match';
    return 'Needs Optimization';
  };

  return (
    <div className="page-wrapper">
      {/* Ambient background glow */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />
      <div className="ambient-glow glow-3" />

      {/* Header */}
      <header className="top-nav">
        <div className="nav-container">
          <a className="brand" href="#">
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="7" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
                <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="14" r="2.5" fill="currentColor" />
                <path d="M12 11.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 18.5V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14.5 14H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7.5 14H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="brand-text">
              <div className="brand-title">
                Career<span className="gradient-text">Fit</span>
              </div>
              <span className="brand-subtitle">AI RESUME INTELLIGENCE</span>
            </div>
          </a>

          <div className="nav-actions">
            <div className="system-pill">
              <span className="live-dot" />
              <span>Campus & Placement Edition</span>
            </div>

            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>AI PLACEMENT REVIEWER & COACH</span>
          </div>
          <h1 className="hero-title">
            Make your resume <span className="gradient-text">match the opportunity.</span>
          </h1>
          <p className="hero-desc">
            Benchmark your resume against any job description. Get deep rubric scoring, gap analysis, and honest bullet rewrites grounded entirely in your real experience.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <ShieldCheck size={16} /> 100% Private & In-Memory
            </div>
            <div className="feature-item">
              <Target size={16} /> Placement Rubric Benchmarked
            </div>
            <div className="feature-item">
              <TrendingUp size={16} /> Bullet Point Enhancement
            </div>
          </div>
        </section>

        {/* Input Form Card */}
        <form className="glass-card workspace-card" onSubmit={analyze}>
          <div className="card-header">
            <div>
              <span className="step-tag">STEP 01</span>
              <h2 className="card-title">Upload & Compare</h2>
              <p className="card-subtitle">Provide your candidate resume PDF and the target position requirements.</p>
            </div>
            <div className="privacy-badge">
              <CheckCircle2 size={15} /> Text Analyzed Safely
            </div>
          </div>

          <div className="input-grid">
            {/* Resume Upload Box */}
            <div className="input-group">
              <label className="input-label">
                <span className="label-badge">1</span>
                <span>Your Resume</span>
                <span className="label-hint">PDF only · max 8 MB</span>
              </label>

              <label
                className={`drop-zone ${drag ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDrag(false);
                  choose(e.dataTransfer.files[0]);
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden-file-input"
                  onChange={e => choose(e.target.files[0])}
                />
                
                {file ? (
                  <div className="file-preview">
                    <div className="file-icon-wrap">
                      <FileText size={28} />
                    </div>
                    <div className="file-details">
                      <strong className="file-name">{file.name}</strong>
                      <span className="file-meta">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for analysis
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={removeFile}
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="drop-prompt">
                    <div className="upload-icon-circle">
                      <UploadCloud size={24} />
                    </div>
                    <strong>Drop your resume PDF here</strong>
                    <span>or click to browse from device</span>
                    <span className="format-badge">Text-based PDF</span>
                  </div>
                )}
              </label>
            </div>

            {/* Job Description Box */}
            <div className="input-group">
              <label className="input-label" htmlFor="jd">
                <span className="label-badge">2</span>
                <span>Job Description</span>
                <span className="label-hint">Paste full posting</span>
              </label>

              <div className="textarea-container">
                <textarea
                  id="jd"
                  className="modern-textarea"
                  value={jd}
                  onChange={e => setJd(e.target.value)}
                  placeholder="Paste the job description or role requirements here...&#10;&#10;Include required technologies, qualifications, project expectations, and responsibilities for maximum scoring accuracy."
                />
                <div className="char-count-pill">
                  {jd.length.toLocaleString()} characters
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-action-row">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle className="spin-icon" size={19} />
                  <span>Analyzing Resume with AI...</span>
                </>
              ) : (
                <>
                  <span>Evaluate Match & Recommendations</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <p className="disclaimer-text">
              Processed in memory for this session only. Never saved into persistent databases or shared publicly.
            </p>
          </div>
        </form>

        {/* Results Section */}
        {result && (
          <section className="glass-card results-section" id="results" ref={resultsRef}>
            <div className="results-header">
              <div>
                <span className="step-tag highlight">STEP 02 · EVALUATION RESULTS</span>
                <h2 className="card-title">Placement Fit Assessment</h2>
                <p className="card-subtitle">{result.score_summary}</p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <RefreshCw size={15} />
                <span>New Evaluation</span>
              </button>
            </div>

            {/* Scorecard Hero Banner */}
            <div className={`scorecard-banner ${getScoreColor(result.match_score)}`}>
              <div className="score-circle">
                <div className="score-number">{result.match_score}</div>
                <div className="score-denominator">/ 100</div>
                <div className="score-caption">MATCH SCORE</div>
              </div>

              <div className="score-info">
                <div className="score-badge-row">
                  <span className="score-tier-badge">{getScoreLabel(result.match_score)}</span>
                  <span className="rubric-badge">100-Point Placement Rubric</span>
                </div>
                <h3>Overall Opportunity Alignment</h3>
                <p>
                  Calculated against the specified job qualifications. Rubric breakdown covers skills, experience, education, evidence, and role-specific keywords.
                </p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${result.match_score}%` }} />
                </div>
              </div>
            </div>

            {/* Rubric Breakdown Grid */}
            <div className="panel-box">
              <h3 className="panel-title">
                <Target size={18} className="panel-icon" />
                <span>Weighted Scoring Breakdown</span>
              </h3>
              <div className="rubric-grid">
                {result.score_reasons.map((item, i) => (
                  <div className="rubric-card" key={i}>
                    <div className="rubric-top">
                      <span className="rubric-name">{item.category}</span>
                      <span className="rubric-points">
                        <strong>{item.points}</strong>
                        <small> / {item.maximum}</small>
                      </span>
                    </div>
                    <div className="rubric-bar-track">
                      <div
                        className="rubric-bar-fill"
                        style={{ width: `${item.maximum ? (item.points / item.maximum) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="rubric-reason">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Two-Column: Matched Skills vs Skill Gaps */}
            <div className="two-column-grid">
              {/* Matched Skills */}
              <div className="panel-box">
                <h3 className="panel-title success">
                  <CheckCircle2 size={18} className="panel-icon" />
                  <span>Demonstrated Strengths & Skills</span>
                </h3>

                <div className="skills-chip-container">
                  {result.matching_skills.length > 0 ? (
                    result.matching_skills.map((skill, i) => (
                      <span className="skill-chip matched" key={i}>
                        <Check size={12} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-notice">No verified direct matches found.</p>
                  )}
                </div>

                <div className="strengths-list">
                  {result.strengths.map((s, i) => (
                    <div className="strength-item" key={i}>
                      <span className="bullet-check">✓</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              <div className="panel-box">
                <h3 className="panel-title warning">
                  <AlertCircle size={18} className="panel-icon" />
                  <span>Identified Gaps & Action Areas</span>
                </h3>

                <div className="gaps-list">
                  {result.skill_gaps.map((gap, i) => (
                    <div className="gap-card" key={i}>
                      <div className="gap-header">
                        <strong className="gap-title">{gap.name}</strong>
                        <span className={`status-tag ${gap.status}`}>{gap.status}</span>
                      </div>
                      <p className="gap-evidence">{gap.evidence}</p>
                      <div className="gap-rec">
                        <span className="rec-prefix">Tip:</span> {gap.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bullet Point Rewrites */}
            <div className="panel-box">
              <h3 className="panel-title highlight">
                <FileText size={18} className="panel-icon" />
                <span>Targeted Resume Bullet Enhancements</span>
              </h3>
              <p className="panel-subtitle">
                Higher-impact phrasing grounded exclusively in your resume's stated experience. No false tools or achievements are invented.
              </p>

              <div className="rewrites-container">
                {result.rewritten_bullets.map((b, i) => (
                  <div className="rewrite-card" key={i}>
                    <div className="rewrite-before">
                      <span className="rewrite-badge original">ORIGINAL VERSION</span>
                      <p>{b.original}</p>
                    </div>

                    <div className="rewrite-after">
                      <div className="rewrite-after-header">
                        <span className="rewrite-badge improved">AI REFINED VERSION</span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(b.improved, i)}
                          title="Copy refined bullet"
                        >
                          {copiedIndex === i ? (
                            <>
                              <Check size={13} className="copy-check" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="improved-text">{b.improved}</p>
                      <div className="rewrite-rationale">
                        <span className="rationale-label">Strategy:</span> {b.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps Roadmap */}
            <div className="panel-box roadmap-panel">
              <h3 className="panel-title">
                <TrendingUp size={18} className="panel-icon" />
                <span>Placement Action Plan</span>
              </h3>
              <ol className="action-roadmap">
                {result.next_steps.map((step, i) => (
                  <li className="roadmap-step" key={i}>
                    <div className="step-counter">{i + 1}</div>
                    <div className="step-content">{step}</div>
                  </li>
                ))}
              </ol>

              {/* Accuracy Notice */}
              <div className="honesty-banner">
                <div className="honesty-title">
                  <ShieldCheck size={16} /> Safeguard & Accuracy Note
                </div>
                <p>{result.honesty_check}</p>
              </div>
            </div>

            {/* Developer JSON Output Accordion */}
            <details className="raw-accordion">
              <summary className="accordion-summary">
                <span>View Structured Schema Response (JSON Debug)</span>
                <ChevronDown size={14} className="accordion-icon" />
              </summary>
              <pre className="json-output">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </section>
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            <span className="footer-brand">CAREERFIT</span>
            <span>· Placement Resume Intelligence</span>
          </div>
          <div className="footer-right">
            <span>Designed to showcase genuine candidate value without hallucinations.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
