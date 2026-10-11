import React, { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BrainCircuit, Check,
  ChevronDown, CircleHelp, Clock3, Compass, Download, FileText, Heart,
  Lightbulb, LoaderCircle, LogOut, Menu, MessageSquareText, RotateCcw, Send,
  ShieldCheck, Sparkles, Target, TrendingUp, Wallet, X
} from "lucide-react";

const starterProfile = {
  age: "21",
  currentSituation: "BCA student, currently learning Java and web development.",
  monthlyIncome: "8000",
  monthlyExpenses: "5000",
  studyHours: "3",
  skills: "Java basics, HTML, CSS, JavaScript. Beginner with backend development.",
  habits: "I sometimes lose time scrolling short videos. I study more when I follow a routine.",
  goal: "Become job-ready for a junior Java developer role and build 2 strong projects.",
  timeHorizon: "3 years"
};

const starterPrompt = "Analyze my current situation and describe three possible paths over the next 3 years. Tell me what I should focus on, what risks I should avoid, and give me a realistic 30-day action plan. Do not promise a specific salary or job.";

const sampleReport = `## Snapshot
You have a clear career direction and are already learning useful skills. If the income and expense figures are monthly, ₹3,000 remains before any costs not listed here. Your biggest advantage is that you have started learning. Your biggest opportunity is to turn that learning into finished projects and a steady routine.

## Possible future scenarios
**1. Strong progress:** You keep a realistic study schedule, practise Java regularly, learn SQL and Spring Boot, and finish projects that you can explain. You may become better prepared to apply for junior roles or internships. This depends on practice quality, project work, and the opportunities available.

**2. Steady progress if your current pattern continues:** You learn new topics but sometimes pause or switch topics. You may build knowledge, but it could take longer to show employers what you can do. A weekly project goal can help turn study time into visible progress.

**3. Slower progress:** Short-video scrolling and changing learning plans often reduce focused practice. You may finish fewer projects and feel less confident applying. This is a risk to manage, not a prediction that it will happen.

## Strengths to build on
- You have a clear goal: junior Java development.
- You already know some web basics and Java fundamentals.
- Three focused study hours can be useful if you protect that time and practise actively.

## Risks and blind spots
- Watching tutorials without writing code can create a false sense of progress.
- Do not assume a certificate alone will get you a job.
- Do not plan your budget around a future salary that is not guaranteed.
- Your listed savings estimate excludes any costs or debt you did not enter.

## Recommended action plan
**Days 1–7:** Practise arrays, methods, classes, and exception handling. Solve 2 small problems each day and explain your solution in your own words.

**Days 8–14:** Learn SQL basics and connect a Java program to a small database.

**Days 15–21:** Start a Java + Spring Boot REST API project. Keep the scope small and make the core features work.

**Days 22–30:** Finish a usable version, write a clear README, add screenshots, test it, and prepare a short explanation of your design choices.

## What to track
- Focused coding hours per week
- Problems solved without copying
- Working project features completed
- Applications sent and replies received
- Monthly income, expenses, and actual savings

Review these measures every month and update your plan based on what really happened. This report is an example preview, not a live Gemini result.`;

function MarkdownLite({ text }) {
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let list = null; // { type: "ul" | "ol", items: [] }
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    out.push(<p key={out.length}>{para.map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{inlineFormat(line)}</React.Fragment>)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.type;
    out.push(<Tag key={out.length}>{list.items.map((item, i) => <li key={i}>{inlineFormat(item)}</li>)}</Tag>);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }

    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flushPara(); flushList();
      const Tag = heading[1].length === 2 ? "h3" : "h4";
      out.push(<Tag key={out.length}>{inlineFormat(heading[2])}</Tag>);
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
      list.items.push((bullet || numbered)[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara(); flushList();
  return <div className="report-copy">{out}</div>;
}

function inlineFormat(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => part.length > 4 && part.startsWith("**") && part.endsWith("**")
    ? <strong key={i}>{part.slice(2, -2)}</strong>
    : <React.Fragment key={i}>{part}</React.Fragment>);
}

function getInitials(user) {
  const source = (user?.displayName || user?.email || "FL").trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export default function App({ user = null, onLogout = () => {} }) {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Personal workspace";
  const initials = getInitials(user);
  const [profile, setProfile] = useState(starterProfile);
  const [prompt, setPrompt] = useState(starterPrompt);
  const [report, setReport] = useState(sampleReport);
  const [liveReport, setLiveReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");

  const savings = useMemo(() => {
    const income = Number(profile.monthlyIncome);
    const expenses = Number(profile.monthlyExpenses);
    return Number.isFinite(income) && Number.isFinite(expenses) ? income - expenses : null;
  }, [profile.monthlyIncome, profile.monthlyExpenses]);

  const update = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, prompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not complete analysis.");
      setReport(data.report);
      setLiveReport(true);
      setActiveTab("report");
      setToast("Your new analysis is ready.");
      window.setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    const blob = new Blob([`FutureLife AI - Personal Future Report\n\n${report}\n\nNote: Scenarios are estimates, not guarantees.`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "futurelife-ai-report.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function resetForm() {
    setProfile(starterProfile);
    setPrompt(starterPrompt);
    setError("");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img className="brand-logo" src="/logo.svg" alt="FutureLife AI logo" />
          <div><strong>FutureLife<span> AI</span></strong><small>YOUR NEXT CHAPTER</small></div>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={19}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          <button className={activeTab === "overview" ? "nav-item active" : "nav-item"} onClick={() => {setActiveTab("overview"); setMobileMenu(false);}}><Activity size={18}/> Overview</button>
          <button className={activeTab === "profile" ? "nav-item active" : "nav-item"} onClick={() => {setActiveTab("profile"); setMobileMenu(false);}}><Heart size={18}/> My life data</button>
          <button className={activeTab === "prompt" ? "nav-item active" : "nav-item"} onClick={() => {setActiveTab("prompt"); setMobileMenu(false);}}><MessageSquareText size={18}/> Analysis prompt</button>
          <button className={activeTab === "report" ? "nav-item active" : "nav-item"} onClick={() => {setActiveTab("report"); setMobileMenu(false);}}><FileText size={18}/> Future report <span className="nav-dot"/></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card"><ShieldCheck size={18}/><div><strong>Your data, your choice</strong><p>Keep your API key private. Avoid entering sensitive personal details.</p></div></div>
          <div className="user-mini"><div className="avatar">{initials}</div><div className="user-text"><strong>{displayName}</strong><small>{user?.email || "Free preview"}</small></div><button className="logout-btn" onClick={onLogout} title="Sign out" aria-label="Sign out"><LogOut size={16}/></button></div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileMenu(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="crumbs"><button className="icon-button menu-trigger" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20}/></button><span>Workspace</span><span className="crumb-slash">/</span><strong>{({overview:"Overview",profile:"My life data",prompt:"Analysis prompt",report:"Future report"})[activeTab]}</strong></div>
          <div className="topbar-right"><span className="status-pill"><span className="status-dot"/>{liveReport ? "AI report generated" : "Preview mode"}</span><div className="avatar small-avatar" title={displayName}>{initials}</div></div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL FUTURE PLANNER</div><h1>Make your next chapter <span>intentional.</span></h1><p className="welcome-sub">Understand where you are today. Explore where your choices could take you.</p></div>
            <div className="date-chip"><Clock3 size={15}/> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
          </section>

          {activeTab === "overview" && <>
            <section className="stat-grid">
              <div className="stat-card"><div className="stat-top"><span>Monthly income</span><div className="stat-icon purple"><Wallet size={18}/></div></div><div className="stat-value">₹{Number(profile.monthlyIncome || 0).toLocaleString("en-IN")}</div><div className="stat-note"><span className="note-neutral">Your current input</span></div></div>
              <div className="stat-card"><div className="stat-top"><span>Monthly expenses</span><div className="stat-icon coral"><ArrowDownRight size={18}/></div></div><div className="stat-value">₹{Number(profile.monthlyExpenses || 0).toLocaleString("en-IN")}</div><div className="stat-note"><span className="note-neutral">Your current input</span></div></div>
              <div className="stat-card"><div className="stat-top"><span>Income left</span><div className="stat-icon mint"><TrendingUp size={18}/></div></div><div className="stat-value">{savings === null ? "—" : `${savings < 0 ? "−" : ""}₹${Math.abs(savings).toLocaleString("en-IN")}`}</div><div className="stat-note"><span className={savings !== null && savings >= 0 ? "note-positive" : "note-warning"}>{savings !== null && savings >= 0 ? "Before unlisted costs" : "Expenses exceed income"}</span></div></div>
              <div className="stat-card"><div className="stat-top"><span>Daily study goal</span><div className="stat-icon blue"><Target size={18}/></div></div><div className="stat-value">{profile.studyHours || "0"} <small>hrs</small></div><div className="stat-note"><span className="note-neutral">Based on your input</span></div></div>
            </section>

            <section className="main-grid">
              <div className="panel journey-panel">
                <div className="panel-heading"><div><div className="section-kicker">YOUR DIRECTION</div><h2>Life journey snapshot</h2><p>A starting point, not a fixed destination.</p></div><button className="text-button" onClick={() => setActiveTab("profile")}>Edit data <ArrowRight size={15}/></button></div>
                <div className="journey-chart">
                  <div className="chart-legend"><span><i className="legend-dot current-dot"/> Current position</span><span><i className="legend-dot goal-dot"/> Goal direction</span></div>
                  <svg viewBox="0 0 620 220" className="journey-svg" role="img" aria-label="Illustrative life progress curve">
                    {[35,75,115,155,195].map(y => <line key={y} x1="24" y1={y} x2="600" y2={y} stroke="currentColor" opacity=".09" strokeDasharray="4 5"/> )}
                    <path d="M24 183 C105 173, 128 150, 194 151 S295 111, 354 113 S452 63, 503 70 S568 33, 600 22 L600 205 L24 205Z" fill="url(#areaFill)" opacity=".2"/>
                    <path d="M24 183 C105 173, 128 150, 194 151 S295 111, 354 113 S452 63, 503 70 S568 33, 600 22" fill="none" stroke="#9d87ff" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="24" cy="183" r="5" fill="#9d87ff" stroke="#171b25" strokeWidth="3"/>
                    <circle cx="600" cy="22" r="5" fill="#65d6b0" stroke="#171b25" strokeWidth="3"/>
                    <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9d87ff"/><stop offset="100%" stopColor="#9d87ff" stopOpacity="0"/></linearGradient></defs>
                  </svg>
                  <div className="chart-axis"><span>Today</span><span>6 months</span><span>1 year</span><span>{profile.timeHorizon || "3 years"}</span></div>
                  <div className="chart-caption"><span className="caption-icon"><Compass size={16}/></span><p>This curve is an <strong>illustration</strong>, not a prediction. Your progress depends on your choices and circumstances.</p></div>
                </div>
              </div>
              <div className="panel goal-panel">
                <div className="panel-heading"><div><div className="section-kicker">NORTH STAR</div><h2>Your main goal</h2></div><div className="stat-icon purple"><Target size={18}/></div></div>
                <div className="goal-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="goal-center"><Target size={29}/></div><div className="orbit-star star-one">✦</div><div className="orbit-star star-two">✧</div></div>
                <div className="goal-copy"><span className="goal-label">THE GOAL YOU SET</span><p>{profile.goal || "Add a goal in My life data."}</p></div>
                <button className="outline-button full-button" onClick={() => setActiveTab("profile")}>Refine your goal <ArrowRight size={16}/></button>
              </div>
            </section>

            <section className="bottom-grid">
              <div className="panel prompt-preview">
                <div className="panel-heading"><div><div className="section-kicker">AI ANALYSIS</div><h2>Ask about your future</h2><p>Give the AI your context and a clear question.</p></div><div className="stat-icon blue"><BrainCircuit size={18}/></div></div>
                <label className="field-label" htmlFor="quickPrompt">YOUR ANALYSIS PROMPT</label>
                <textarea id="quickPrompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows="4" placeholder="What would you like to understand about your future?"/>
                <div className="prompt-footer"><span><Lightbulb size={14}/> Be specific about your time frame and goal.</span><button className="primary-button" onClick={analyze} disabled={loading}>{loading ? <LoaderCircle className="spin" size={16}/> : <Sparkles size={16}/>} {loading ? "Analyzing..." : "Analyze my future"} <ArrowRight size={15}/></button></div>
                {error && <div className="error-box"><CircleHelp size={16}/>{error}</div>}
              </div>
              <div className="panel report-teaser">
                <div className="panel-heading"><div><div className="section-kicker">YOUR INSIGHTS</div><h2>Future report</h2><p>{liveReport ? "Your latest Gemini analysis is ready." : "Example report to help you preview the app."}</p></div><div className="stat-icon mint"><FileText size={18}/></div></div>
                <div className="teaser-list"><div><span className="teaser-number">01</span><div><strong>Possible scenarios</strong><small>Best case, likely path, and risks</small></div><Check size={16}/></div><div><span className="teaser-number">02</span><div><strong>Practical next steps</strong><small>A clear 30-day action plan</small></div><Check size={16}/></div><div><span className="teaser-number">03</span><div><strong>Progress signals</strong><small>What to measure each month</small></div><Check size={16}/></div></div>
                <button className="outline-button full-button" onClick={() => setActiveTab("report")}>Open full report <ArrowRight size={16}/></button>
              </div>
            </section>
          </>}

          {activeTab === "profile" && <section className="panel form-panel">
            <div className="panel-heading"><div><div className="section-kicker">YOUR CONTEXT</div><h2>My life data</h2><p>Share only details that help answer your question. These example values can be changed.</p></div><div className="stat-icon purple"><Heart size={18}/></div></div>
            <div className="form-grid">
              <Field label="Age" hint="Years"><input type="number" min="1" max="120" value={profile.age} onChange={e=>update("age",e.target.value)}/></Field>
              <Field label="Time horizon"><select value={profile.timeHorizon} onChange={e=>update("timeHorizon",e.target.value)}><option>6 months</option><option>1 year</option><option>3 years</option><option>5 years</option><option>10 years</option></select></Field>
              <Field label="Monthly income (₹)" hint="Enter 0 if none"><input type="number" min="0" value={profile.monthlyIncome} onChange={e=>update("monthlyIncome",e.target.value)}/></Field>
              <Field label="Monthly expenses (₹)"><input type="number" min="0" value={profile.monthlyExpenses} onChange={e=>update("monthlyExpenses",e.target.value)}/></Field>
              <Field label="Daily study / skill hours"><input type="number" min="0" max="24" step="0.5" value={profile.studyHours} onChange={e=>update("studyHours",e.target.value)}/></Field>
              <Field label="Current situation" wide><textarea rows="3" value={profile.currentSituation} onChange={e=>update("currentSituation",e.target.value)} placeholder="What is happening in your life right now?"/></Field>
              <Field label="Current skills" wide><textarea rows="3" value={profile.skills} onChange={e=>update("skills",e.target.value)} placeholder="Skills you have or are learning"/></Field>
              <Field label="Habits and challenges" wide><textarea rows="3" value={profile.habits} onChange={e=>update("habits",e.target.value)} placeholder="What helps you? What gets in your way?"/></Field>
              <Field label="Main goal" wide><textarea rows="3" value={profile.goal} onChange={e=>update("goal",e.target.value)} placeholder="What would you like to achieve?"/></Field>
            </div>
            <div className="form-actions"><button className="outline-button" onClick={resetForm}><RotateCcw size={16}/> Reset examples</button><button className="primary-button" onClick={()=>setActiveTab("prompt")}>Continue to prompt <ArrowRight size={16}/></button></div>
          </section>}

          {activeTab === "prompt" && <section className="panel form-panel">
            <div className="panel-heading"><div><div className="section-kicker">TELL THE AI WHAT YOU NEED</div><h2>Write your analysis prompt</h2><p>A useful prompt tells the AI what to compare, what time frame to use, and what kind of advice you want.</p></div><div className="stat-icon blue"><MessageSquareText size={18}/></div></div>
            <div className="prompt-tips"><strong><Lightbulb size={17}/> Prompt tip</strong><p>Instead of “Predict my future”, try “Compare three possible outcomes over the next year if I practise Java for two focused hours each day. Include risks and a weekly plan.”</p></div>
            <label className="field-label" htmlFor="mainPrompt">YOUR PROMPT</label>
            <textarea className="large-prompt" id="mainPrompt" rows="9" value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={3000} placeholder="Tell the AI what you want it to analyze..."/>
            <div className="prompt-footer"><span>{prompt.length}/3000 characters</span><button className="primary-button" onClick={analyze} disabled={loading}>{loading ? <LoaderCircle className="spin" size={16}/> : <Sparkles size={16}/>} {loading ? "Analyzing..." : "Generate future report"} <ArrowRight size={15}/></button></div>
            {error && <div className="error-box"><CircleHelp size={16}/>{error}</div>}
            <div className="example-prompts"><h3>Try one of these prompts</h3><button onClick={()=>setPrompt("Compare three possible career paths for me over the next 3 years. Use my current skills and study time. Give practical steps and explain the assumptions.")}>Career path <ArrowUpRight size={14}/></button><button onClick={()=>setPrompt("Review my monthly income and expenses. Suggest a careful savings plan based only on the figures I provided, and identify missing costs I should track.")}>Money habits <ArrowUpRight size={14}/></button><button onClick={()=>setPrompt("Help me build a better daily routine over the next 90 days. Use my current habits, likely obstacles, and goals. Keep the plan realistic.")}>Daily routine <ArrowUpRight size={14}/></button></div>
          </section>}

          {activeTab === "report" && <section className="report-page">
            <div className="panel report-header-panel"><div><div className="eyebrow"><Sparkles size={14}/> PERSONAL FUTURE REPORT</div><h2>Your next chapter, explored</h2><p>{liveReport ? "Generated from your current profile and prompt using Gemini." : "This is a sample report. Connect your Gemini API key and run an analysis to generate your own."}</p></div><div className="report-actions"><button className="outline-button" onClick={downloadReport}><Download size={16}/> Export .txt</button><button className="primary-button" onClick={()=>setActiveTab("prompt")}><MessageSquareText size={16}/> Edit prompt</button></div></div>
            {!liveReport && <div className="sample-banner"><Lightbulb size={17}/><span><strong>Sample preview:</strong> The text below is example content, not an AI-generated analysis of your personal situation.</span></div>}
            <div className="panel report-body-panel"><div className="report-meta"><span><FileText size={15}/> Personal outlook</span><span><Clock3 size={15}/> Horizon: {profile.timeHorizon}</span><span className={liveReport ? "live-tag" : "sample-tag"}>{liveReport ? <Check size={13}/> : <CircleHelp size={13}/>} {liveReport ? "Gemini generated" : "Example report"}</span></div><MarkdownLite text={report}/><div className="report-disclaimer"><ShieldCheck size={17}/><p><strong>Remember:</strong> These are possible scenarios, not guarantees. Use the report to plan and review your progress, not as a promise of a job, salary, or life outcome.</p></div></div>
            {error && <div className="error-box"><CircleHelp size={16}/>{error}</div>}
            <div className="report-bottom-cta"><div><h3>Ready to explore a different path?</h3><p>Change your details or ask a new question to compare scenarios.</p></div><button className="primary-button" onClick={()=>setActiveTab("prompt")}>Run another analysis <ArrowRight size={16}/></button></div>
          </section>}

          <footer className="footer"><span>© 2026 FutureLife AI</span><span><ShieldCheck size={13}/> Built for planning, not certainty.</span><button onClick={()=>setActiveTab("profile")}>Update your data</button></footer>
        </div>
      </main>
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}

function Field({ label, hint, wide, children }) {
  return <div className={`field ${wide ? "field-wide" : ""}`}><label className="field-label">{label}{hint && <span>{hint}</span>}</label>{children}</div>;
}
