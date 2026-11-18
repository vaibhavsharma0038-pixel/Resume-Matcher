import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Briefcase,
  Target,
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
const RESULT_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'skills', label: 'Skills & Gaps' },
  { id: 'education', label: 'Education & Experience' },
  { id: 'rewrites', label: 'Resume Review' },
  { id: 'action-plan', label: 'Action Plan' },
];

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [result, setResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('overview');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('careerfit_history') || '[]');
    } catch {
      return [];
    }
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('careerfit_theme') || localStorage.getItem('c9_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const resultsRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('careerfit_theme', theme);
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
    body.append('job_title', jobTitle);
    body.append('company', company);

    setBusy(true);
    try {
      const r = await fetch(`${API}/api/analyze`, { method: 'POST', body });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Analysis could not be completed.');
      setResult(data);
      setActiveResultTab('overview');
      const historyEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        created_at: new Date().toISOString(),
        job_title: jobTitle.trim(),
        company: company.trim(),
        resume_name: file.name,
        analysis: data,
      };
      setAnalysisHistory(previous => {
        const updated = [historyEntry, ...previous].slice(0, 10);
        localStorage.setItem('careerfit_history', JSON.stringify(updated));
        return updated;
      });
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

  async function downloadReport() {
    if (!result) return;
    try {
      const response = await fetch(`${API}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: result,
          job_title: jobTitle,
          company,
        }),
      });
      if (!response.ok) throw new Error('The PDF report could not be generated.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'careerfit-analysis.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  const restoreHistoryEntry = entry => {
    setJobTitle(entry.job_title || '');
    setCompany(entry.company || '');
    setResult(entry.analysis);
    setShowHistory(false);
    setActiveResultTab('overview');
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const clearAnalysisHistory = () => {
    setAnalysisHistory([]);
    localStorage.removeItem('careerfit_history');
  };

  const openHistory = () => {
    setShowHistory(value => !value);
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
    <div className={`page-wrapper ${result ? 'results-page' : 'landing-page'}`}>
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
              className="history-header-btn"
              onClick={openHistory}
              aria-label={`Open analysis history (${analysisHistory.length} saved)`}
              title="Analysis history"
            >
              <RefreshCw size={15} />
              <span>History</span>
              {analysisHistory.length > 0 && <b>{analysisHistory.length}</b>}
            </button>

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

      {showHistory && (
        <div className="history-overlay" role="dialog" aria-modal="true" aria-label="Analysis history">
          <button
            type="button"
            className="history-backdrop"
            aria-label="Close history"
            onClick={() => setShowHistory(false)}
          />
          <aside className="history-drawer">
            <div className="history-drawer-header">
              <div>
                <span className="step-tag">SAVED LOCALLY</span>
                <h2>Analysis History</h2>
              </div>
              <button type="button" className="history-close" onClick={() => setShowHistory(false)} aria-label="Close history">
                <X size={18} />
              </button>
            </div>
            {analysisHistory.length > 0 ? (
              <div className="history-drawer-list">
                {analysisHistory.map(entry => (
                  <button
                    type="button"
                    className="history-drawer-item"
                    key={entry.id}
                    onClick={() => restoreHistoryEntry(entry)}
                  >
                    <span className="history-drawer-main">
                      <strong>{entry.job_title || 'Untitled role'}{entry.company ? ` · ${entry.company}` : ''}</strong>
                      <small>{entry.resume_name}</small>
                      <small>{new Date(entry.created_at).toLocaleString()}</small>
                    </span>
                    <b>{entry.analysis.match_score}/100</b>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="history-empty">No saved analyses yet.</p>
            )}
            {analysisHistory.length > 0 && (
              <button type="button" className="btn-secondary history-clear" onClick={clearAnalysisHistory}>
                Clear history
              </button>
            )}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <h1 className="hero-title">
            Make your resume <span className="hero-title-lens">match the opportunity.</span>
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

              <div className="job-meta-grid">
                <label className="job-meta-field">
                  <span>Job title <em>optional</em></span>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                  />
                </label>
                <label className="job-meta-field">
                  <span>Company <em>optional</em></span>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Acme Labs"
                  />
                </label>
              </div>

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
              <div className="results-actions">
                <button type="button" className="btn-secondary" onClick={downloadReport}>
                  <FileText size={15} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setResult(null);
                    setActiveResultTab('overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <RefreshCw size={15} />
                  <span>New Evaluation</span>
                </button>
              </div>
            </div>

            <nav className="results-tabs" aria-label="Evaluation result sections">
              {RESULT_TABS.map((tab, index) => (
                <button
                  type="button"
                  className="results-tab"
                  key={tab.id}
                  aria-pressed={activeResultTab === tab.id}
                  aria-controls="results-content"
                  onClick={() => setActiveResultTab(tab.id)}
                >
                  <span className="results-tab-number">0{index + 1}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div id="results-content">
              {activeResultTab === 'overview' && (
                <>
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
                </>
              )}

              {/* Two-Column: Matched Skills vs Skill Gaps */}
              {activeResultTab === 'skills' && (
                <>
                  <div className="skill-status-grid">
                    <div className="skill-status-card matched">
                      <span>Matched</span>
                      <strong>{result.matching_skills.length}</strong>
                    </div>
                    <div className="skill-status-card partial">
                      <span>Partial</span>
                      <strong>{result.skill_gaps.filter(gap => gap.status === 'partial').length}</strong>
                    </div>
                    <div className="skill-status-card missing">
                      <span>Missing</span>
                      <strong>{result.skill_gaps.filter(gap => gap.status === 'missing').length}</strong>
                    </div>
                  </div>
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
                </>
              )}

              {/* Education and Experience Match */}
              {activeResultTab === 'education' && (
                <div className="education-grid">
                  {[result.education_match, result.experience_match].map((match, i) => (
                    <div className="panel-box education-card" key={i}>
                      <h3 className="panel-title">
                        {i === 0 ? <Award size={18} className="panel-icon" /> : <Briefcase size={18} className="panel-icon" />}
                        <span>{i === 0 ? 'Education Match' : 'Experience Match'}</span>
                      </h3>
                      <span className={`status-tag ${match.status}`}>{match.status}</span>
                      <p className="education-summary">{match.summary}</p>
                      <div className="detail-row">
                        <strong>Evidence</strong>
                        <p>{match.evidence}</p>
                      </div>
                      <div className="detail-row">
                        <strong>Role requirement</strong>
                        <p>{match.role_requirement}</p>
                      </div>
                    </div>
                  ))}

                  <div className="panel-box education-card education-full">
                    <h3 className="panel-title warning">
                      <AlertCircle size={18} className="panel-icon" />
                      <span>Education Gaps & Alternatives</span>
                    </h3>
                    {result.education_gaps.length > 0 ? (
                      <div className="gaps-list">
                        {result.education_gaps.map((gap, i) => (
                          <div className="gap-card" key={i}>
                            <div className="gap-header">
                              <strong className="gap-title">{gap.name}</strong>
                              <span className={`status-tag ${gap.status}`}>{gap.status}</span>
                            </div>
                            <p className="gap-evidence">{gap.evidence}</p>
                            <div className="gap-rec">{gap.recommendation}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-notice">No explicit education gap was found.</p>
                    )}
                    {result.education_alternatives.length > 0 && (
                      <div className="alternatives-list">
                        <strong>Realistic alternatives</strong>
                        {result.education_alternatives.map((item, i) => (
                          <p key={i}>• {item}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bullet Point Rewrites */}
              {activeResultTab === 'rewrites' && (
                <>
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

                    {result.rewrite_warnings.length > 0 && (
                      <div className="warning-list">
                        <strong>Honest rewrite warnings</strong>
                        {result.rewrite_warnings.map((warning, i) => (
                          <p key={i}><AlertCircle size={14} /> {warning}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="panel-box">
                    <h3 className="panel-title">
                      <FileText size={18} className="panel-icon" />
                      <span>Section-by-Section Resume Feedback</span>
                    </h3>
                    <div className="section-feedback-grid">
                      {result.resume_section_feedback.map((feedback, i) => (
                        <div className="section-feedback-card" key={i}>
                          <span className="section-name">{feedback.section}</span>
                          <p><strong>Assessment:</strong> {feedback.assessment}</p>
                          <p><strong>Recommendation:</strong> {feedback.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Next Steps Roadmap */}
              {activeResultTab === 'action-plan' && (
                <div className="panel-box roadmap-panel">
                  <h3 className="panel-title warning">
                    <TrendingUp size={18} className="panel-icon" />
                    <span>Top Five Priority Improvements</span>
                  </h3>
                  <ol className="priority-list">
                    {result.priority_improvements.slice(0, 5).map((item, i) => (
                      <li key={i}>
                        <span>{i + 1}</span>
                        <p>{item}</p>
                      </li>
                    ))}
                  </ol>

                  <h3 className="panel-title">
                    <CheckCircle2 size={18} className="panel-icon" />
                    <span>Next Application Checklist</span>
                  </h3>
                  <div className="application-checklist">
                    {result.application_checklist.map((item, i) => (
                      <label className="checklist-item" key={i}>
                        <input type="checkbox" checked={item.completed} readOnly />
                        <span className="custom-checkbox" aria-hidden="true"></span>
                        <span className="checklist-text">{item.item}</span>
                        <span className={`priority-tag ${item.priority}`}>{item.priority}</span>
                      </label>
                    ))}
                  </div>

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
              )}

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
