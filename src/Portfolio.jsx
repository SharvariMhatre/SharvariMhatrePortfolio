import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:"#FFF8F9", surface:"#ffffff", surfaceAlt:"#FFF0F7",
  nav:"rgba(255,248,249,0.92)", navBorder:"#FFD0E5",
  text:"#1A1A1A", textSub:"#555555", textMuted:"#999999",
  dot:"#FFB3D1",
  blob1:"radial-gradient(circle at 40% 40%, #FFD0E5 0%, #FF6B9D18 70%)",
  blob2:"radial-gradient(circle, #C9B8FF 0%, transparent 70%)",
  cardBorder:"#FFD0E5", skillCard:"#ffffff", skillBorder:"#E8D5FF",
  catCard:"#ffffff", catBorder:"#FFD0E5",
  contactBg:"#1A1A1A", contactText:"#ffffff", contactSub:"#aaaaaa",
  contactLink:"#888888", contactLinkBorder:"#444444",
  photoGrad:"linear-gradient(135deg, #FFD0E5 0%, #E8D5FF 100%)",
  expCard:"#ffffff", expBorder:"#FFD0E5",
  statCard:"#ffffff", statBorder:"#FFD0E5",
};
const DARK = {
  bg:"#0D0812", surface:"#160F1E", surfaceAlt:"#1C1428",
  nav:"rgba(13,8,18,0.92)", navBorder:"#3D2050",
  text:"#F2ECFF", textSub:"#B8A8D0", textMuted:"#6B5A80",
  dot:"#3D2050",
  blob1:"radial-gradient(circle at 40% 40%, #3D1A4A 0%, #FF6B9D08 70%)",
  blob2:"radial-gradient(circle, #2A1A4A 0%, transparent 70%)",
  cardBorder:"#2E1A40", skillCard:"#1C1428", skillBorder:"#2E1A40",
  catCard:"#1C1428", catBorder:"#2E1A40",
  contactBg:"#080510", contactText:"#F2ECFF", contactSub:"#7A6A90",
  contactLink:"#6B5A80", contactLinkBorder:"#2E1A40",
  photoGrad:"linear-gradient(135deg, #2A1040 0%, #1A0A30 100%)",
  expCard:"#1C1428", expBorder:"#2E1A40",
  statCard:"#1C1428", statBorder:"#2E1A40",
};

const DARK_PROJECT_BG = {
  "#FFE4F0":"#2A0F1E","#F3E8FF":"#1E1030",
  "#E8F8EF":"#0A2018","#FFF3E0":"#221508","#FEEFEF":"#220A0A",
};

// ─── SOUND ENGINE ─────────────────────────────────────────────────────────
function useSounds() {
  const ctx = useRef(null);
  const supported = useRef(typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext));
  const getCtx = () => {
    if (!supported.current) return null;
    try {
      if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.current.state === "suspended") ctx.current.resume();
      return ctx.current;
    } catch {
      supported.current = null;
      return null;
    }
  };
  const softClick = useCallback(() => {
    const ac = getCtx(); if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination); o.type = "sine";
    o.frequency.setValueAtTime(880, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(660, ac.currentTime + 0.08);
    g.gain.setValueAtTime(0.18, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    o.start(); o.stop(ac.currentTime + 0.12);
  }, []);
  const whoosh = useCallback(() => {
    const ac = getCtx(); if (!ac) return;
    const buf = ac.createBuffer(1, ac.sampleRate * 0.25, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*(1-i/data.length);
    const src = ac.createBufferSource(), filter = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, ac.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3200, ac.currentTime + 0.2);
    filter.Q.value = 0.8; src.connect(filter); filter.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.12, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    src.start(); src.stop(ac.currentTime + 0.25);
  }, []);
  const chime = useCallback(() => {
    const ac = getCtx(); if (!ac) return;
    [1047,1319,1568].forEach((freq,i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination); o.type = "sine"; o.frequency.value = freq;
      const t = ac.currentTime + i*0.1;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.1,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.6); o.start(t); o.stop(t+0.6);
    });
  }, []);
  const popClose = useCallback(() => {
    const ac = getCtx(); if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination); o.type = "sine";
    o.frequency.setValueAtTime(660, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(330, ac.currentTime + 0.1);
    g.gain.setValueAtTime(0.12, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    o.start(); o.stop(ac.currentTime + 0.12);
  }, []);
  const modeToggle = useCallback((toDark) => {
    const ac = getCtx(); if (!ac) return;
    const freqs = toDark ? [1568,1319,1047,784] : [784,1047,1319,1568];
    freqs.forEach((freq,i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination); o.type = "sine"; o.frequency.value = freq;
      const t = ac.currentTime + i*0.07;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.09,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.35); o.start(t); o.stop(t+0.35);
    });
  }, []);
  return { softClick, whoosh, chime, popClose, modeToggle };
}

// ─── HOOKS ────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }});
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal:not(.revealed)").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useTyping(phrases, speed=55, pause=1800) {
  const [display, setDisplay] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = phrases[phraseIdx]; let t;
    if (!deleting && charIdx < current.length)        t = setTimeout(() => setCharIdx(c=>c+1), speed);
    else if (!deleting && charIdx === current.length) t = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0)                 t = setTimeout(() => setCharIdx(c=>c-1), speed/2);
    else { setDeleting(false); setPhraseIdx(i=>(i+1)%phrases.length); }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);
  return display;
}

// Smoothly scroll to an anchor while accounting for the sticky nav.
const NAV_OFFSET = 72;
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

// ─── DATA ─────────────────────────────────────────────────────────────────
const projects = [
  {
    id:1, emoji:"🤖", title:"AI Interview Intelligence System",
    tag:"AI + CLOUD", year:"2025",
    tools:["React","AWS Lambda","DynamoDB","S3","API Gateway","Bedrock","Amplify"],
    desc:"Built a serverless full-stack AI system at the Mays Hackathon. Amplify-hosted React frontend accepts company name and document uploads; Lambda functions generate an Interviewer Brief and Pre-Interview Packet via Amazon Bedrock (Claude). Architected S3 with /raw, /cleaned, /briefs partitions and DynamoDB session tracking.",
    panel:"☁️", bg:"#F3E8FF", border:"#9B59B6",
  },
  {
    id:2, emoji:"🔗", title:"Aggie-to-Aggie Connect",
    tag:"FULL-STACK + AI", year:"2025",
    tools:["Next.js","n8n","GPT-4o-mini","Google Sheets API","Gmail API"],
    desc:"End-to-end platform for event registration, mentor matching, and AI-driven communication. Capacity-aware matching achieves ~92% industry-fit with ~45s turnaround. Integrated GPT-4o-mini with prompt templates, output validation, and error logging for a 24/7 intelligent chatbot.",
    panel:"🎓", bg:"#FFE4F0", border:"#FF6B9D",
  },
  {
    id:3, emoji:"📉", title:"Telco Customer Churn Analysis",
    tag:"DATA SCIENCE", year:"2026",
    tools:["Python","Pandas","SciPy","Matplotlib","Seaborn"],
    desc:"End-to-end data pipeline on IBM Telco dataset (7,032 subscribers, 15 variables). Produced 13 EDA visualizations and conducted hypothesis testing — Welch's t-test and Pearson correlation identified that churned subscribers pay $13.17 more per month (p<0.001).",
    panel:"📊", bg:"#E8F8EF", border:"#2ECC71",
  },
  {
    id:4, emoji:"🛒", title:"Big Mart Sales Prediction",
    tag:"MACHINE LEARNING", year:"2022",
    tools:["Python","Random Forest","XGBoost","Pandas","Scikit-learn"],
    desc:"Trained Random Forest and XGBoost models achieving 91% forecast accuracy. Engineered 14 domain features (+23% performance, –18% MAE). Grid search with time-aware cross-validation (+7% R²). Published in IJREAM and IJITEE (2022).",
    panel:"🏆", bg:"#FFF3E0", border:"#E67E22",
  },
];

const skillCategories = [
  {
    label:"AI & Automation", icon:"🤖", color:"#9B59B6",
    items:["LLMs (GPT-4o, Bedrock)","AI Agents","Prompt Engineering","n8n (Certified)","Workflow Automation","AWS Bedrock"],
  },
  {
    label:"Frontend", icon:"🎨", color:"#FF6B9D",
    items:["React","Next.js","Android SDK","Jetpack Compose","MVVM / MVC","Android Studio"],
  },
  {
    label:"Backend & Cloud", icon:"☁️", color:"#2980B9",
    items:["Node.js","REST APIs","AWS Lambda","DynamoDB","S3 / API Gateway","PostgreSQL","Serverless"],
  },
  {
    label:"Data & ML", icon:"📊", color:"#2ECC71",
    items:["Python","Pandas / NumPy","Scikit-learn","XGBoost","TensorFlow","Matplotlib / Seaborn"],
  },
  {
    label:"Languages", icon:"💻", color:"#E67E22",
    items:["JavaScript","Kotlin","Java","SQL","HTML / CSS"],
  },
  {
    label:"Tools & Practices", icon:"🔧", color:"#E74C3C",
    items:["Git / GitHub","Postman","Jupyter","Agile / Scrum","CI/CD","Automated Testing"],
  },
];

const experience = [
  {
    role:"Software Development Engineer",
    company:"Jio Platforms Ltd.",
    location:"Mumbai, India",
    period:"Jul 2022 – Jul 2025",
    color:"#FF6B9D",
    bullets:[
      "Shipped 6 high-impact features across CloudXP, JioAssist & Ajio apps — serving millions of users, +28% retention, +19% daily engagement",
      "Designed a reusable custom Android library adopted team-wide, cutting feature dev time by 18%",
      "Owned UAT end-to-end — resolved 93 critical pre-launch issues (97% post-release satisfaction) and built an automated regression testing framework",
    ],
  },
  {
    role:"Data Science & Business Analytics Intern",
    company:"The Sparks Foundation",
    location:"Remote",
    period:"Feb 2021 – Apr 2021",
    color:"#9B59B6",
    bullets:[
      "Built a full-stack inventory management system (SQL, PHP, JS) processing 10K+ product records with optimized query performance",
      "Engineered real-time dashboards for order tracking, reducing delays by 20%",
    ],
  },
];

const education = [
  {
    degree:"M.S. Management Information Systems",
    school:"Texas A&M University · Mays Business School",
    location:"College Station, TX",
    period:"Aug 2025 – May 2027 (Expected)",
    color:"#FF6B9D",
    notes:["Focus: AI for Business, Cloud Architecture, Data Strategy","Mays Hackathon — AI Interview Intelligence System"],
  },
  // TODO: replace with your actual undergraduate details
  {
    degree:"B.E. Computer Engineering",
    school:"University of Mumbai",
    location:"Mumbai, India",
    period:"Aug 2018 – Jul 2022",
    color:"#9B59B6",
    notes:["Capstone published in IJREAM & IJITEE (2022)","Coursework: DSA, OS, DBMS, Machine Learning"],
  },
];

const stats = [
  { value:"3+",     label:"Years Building Products",  color:"#FF6B9D" },
  { value:"1M+",    label:"Users Reached",             color:"#9B59B6" },
  { value:"6",      label:"Features Shipped",          color:"#2ECC71" },
  { value:"1000/1000", label:"AWS Cert Score",         color:"#E67E22" },
];

const TYPING_PHRASES = [
  "Full-stack builder. AI thinker. Data storyteller.",
  "I build systems that scale and models that matter.",
  "From Android to AWS — I ship things that work.",
  "AWS Certified. Hackathon winner. Grad student.",
  "Builder & strategist at the intersection of code + data.",
];

const CERTS = [
  { label:"AWS Certified AI Practitioner", detail:"Score: 1000/1000 ✦ Perfect", color:"#E67E22" },
  { label:"n8n Certified", detail:"Workflow Automation", color:"#9B59B6" },
  { label:"AI for Project Managers", detail:"LinkedIn Learning", color:"#2980B9" },
];

const NAV_LINKS = ["About","Stats","Projects","Experience","Education","Skills","Contact"];

// ─── TOGGLE ───────────────────────────────────────────────────────────────
function ModeToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"} style={{
      position:"relative", width:64, height:32, borderRadius:999,
      border:`2px solid ${dark ? "#3D2050" : "#FFD0E5"}`,
      background: dark ? "#2A1040" : "#FFE4F0",
      cursor:"pointer", padding:0,
      transition:"background 0.4s, border-color 0.4s",
      display:"flex", alignItems:"center",
      boxShadow: dark ? "0 0 12px #FF6B9D30" : "none",
    }}>
      <span aria-hidden="true" style={{ position:"absolute", left:7, fontSize:13, opacity: dark ? 0.4 : 1, transition:"opacity 0.3s" }}>☀️</span>
      <span aria-hidden="true" style={{ position:"absolute", right:7, fontSize:12, opacity: dark ? 1 : 0.4, transition:"opacity 0.3s" }}>🌙</span>
      <div aria-hidden="true" style={{
        position:"absolute",
        left: dark ? "calc(100% - 28px)" : 4,
        width:24, height:24, borderRadius:"50%",
        background: dark ? "#FF6B9D" : "#fff",
        boxShadow: dark ? "0 0 8px #FF6B9D80" : "0 2px 6px rgba(0,0,0,0.15)",
        transition:"left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:11,
      }}>{dark ? "🌙" : "☀️"}</div>
    </button>
  );
}

// ─── PROFILE PHOTO ────────────────────────────────────────────────────────
function ProfilePhoto({ T, dark }) {
  const [loaded, setLoaded] = useState(true);
  return (
    <div className="profile-photo" style={{
      width:260, height:320, borderRadius:24,
      border:`4px solid ${dark?"#3D2050":"#1A1A1A"}`,
      boxShadow:`8px 8px 0 #FF6B9D, 14px 14px 0 ${dark?"#3D2050":"#1A1A1A"}`,
      overflow:"hidden", background:T.photoGrad,
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"float 5s ease-in-out infinite",
    }}>
      {loaded ? (
        <img
          src={`${import.meta.env.BASE_URL}profile.jpg`}
          alt="Sharvari Mhatre"
          onError={() => setLoaded(false)}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", fontSize:80 }}>
          👩🏻‍💻
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:12, color:T.textMuted, margin:"10px 0 0", fontStyle:"italic", textAlign:"center", padding:"0 12px" }}>
            drop your photo at <code>public/profile.jpg</code>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── COMIC POPUP ──────────────────────────────────────────────────────────
function ComicPopup({ project, onClose, sounds, dark }) {
  const darkBg = DARK_PROJECT_BG[project.bg] || "#1A0F2E";
  const closeBtnRef = useRef(null);
  const handleClose = useCallback(() => { sounds.popClose(); onClose(); }, [sounds, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [handleClose]);

  return (
    <div onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="popup-title" style={{
      position:"fixed", inset:0, zIndex:1000,
      background: dark ? "rgba(5,2,10,0.85)" : "rgba(20,10,30,0.65)",
      display:"flex", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(8px)", animation:"overlayIn 0.25s ease",
      padding:"clamp(12px, 4vw, 24px)",
      overflowY:"auto",
    }}>
      <div onClick={e => e.stopPropagation()} className="popup-inner" style={{
        background: dark ? darkBg : project.bg,
        border:`4px solid ${project.border}`,
        borderRadius:24, maxWidth:560, width:"100%",
        padding:"20px 36px 44px", position:"relative",
        boxShadow:`8px 8px 0px ${project.border}, 16px 16px 0px rgba(0,0,0,${dark?0.4:0.1})`,
        animation:"popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275)",
        maxHeight:"calc(100vh - 48px)", overflowY:"auto",
      }}>
        {/* Banner row: year badge left, PROJECT SPOTLIGHT right — all inside the card */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:8 }}>
          <div style={{
            background: project.border, color:"#fff",
            fontFamily:"'Bangers',cursive", fontSize:13, letterSpacing:2,
            padding:"2px 12px", borderRadius:999,
          }}>{project.year}</div>

          <div style={{
            background:"#FFD700", color:"#1A1A1A",
            fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:2,
            padding:"4px 16px", borderRadius:999,
            border:"3px solid #1A1A1A", boxShadow:"3px 3px 0 #1A1A1A",
            transform:"rotate(2deg)", whiteSpace:"nowrap",
          }}>✨ PROJECT SPOTLIGHT</div>

          <button
            ref={closeBtnRef}
            onClick={handleClose}
            aria-label="Close project details"
            style={{
              background:"#1A1A1A", color:"#fff", border:"none",
              borderRadius:"50%", width:34, height:34, fontSize:20,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              transition:"transform 0.2s", flexShrink:0,
            }}
            onMouseEnter={e => e.currentTarget.style.transform="rotate(90deg)"}
            onMouseLeave={e => e.currentTarget.style.transform="rotate(0deg)"}
          >×</button>
        </div>

        <div style={{ fontSize:52, textAlign:"center", marginBottom:12 }}>{project.panel}</div>

        <div style={{
          display:"inline-block", background:project.border, color:"#fff",
          fontFamily:"'Bangers',cursive", fontSize:12, letterSpacing:2,
          padding:"3px 14px", borderRadius:999, marginBottom:12,
        }}>{project.tag}</div>

        <h2 id="popup-title" className="popup-title" style={{
          fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800,
          color: dark ? "#F2ECFF" : "#1A1A1A", margin:"0 0 14px", lineHeight:1.2,
          wordBreak:"break-word",
        }}>{project.title}</h2>

        <p style={{ fontSize:15, color: dark ? "#B8A8D0" : "#444", lineHeight:1.8, margin:"0 0 22px" }}>{project.desc}</p>

        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {project.tools.map(t => (
            <span key={t} style={{
              background: dark ? "#0D0812" : "#fff",
              border:`2px solid ${project.border}`,
              color: dark ? "#D0B8FF" : "#333",
              borderRadius:999, fontSize:12, fontWeight:600, padding:"3px 14px",
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [dark, setDark]     = useState(false);
  const [active, setActive] = useState(null);
  const sounds = useSounds();
  const typed  = useTyping(TYPING_PHRASES);
  const T = dark ? DARK : LIGHT;

  useScrollReveal();

  // Honour the OS preference on first paint.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, []);

  const toggleDark   = () => { sounds.modeToggle(!dark); setDark(d => !d); };
  const openProject  = (p) => { sounds.whoosh(); setActive(p); };
  const handleNav    = (e, id) => {
    e.preventDefault();
    sounds.chime();
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:T.bg, minHeight:"100vh", color:T.text, transition:"background 0.4s, color 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Bangers&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes overlayIn { from{opacity:0}to{opacity:1} }
        @keyframes popIn     { from{transform:scale(0.7) rotate(-3deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1} }
        @keyframes float     { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
        @keyframes wiggle    { 0%,100%{transform:rotate(0)}25%{transform:rotate(-2deg)}75%{transform:rotate(2deg)} }
        @keyframes cursorBlink { 0%,100%{opacity:1}50%{opacity:0} }

        html { scroll-behavior: smooth; }
        section { scroll-margin-top: 80px; }

        .reveal          { opacity:0; transform:translateY(26px); transition:opacity 0.6s ease, transform 0.6s ease; }
        .reveal.delay-1  { transition-delay:0.08s; }
        .reveal.delay-2  { transition-delay:0.16s; }
        .reveal.delay-3  { transition-delay:0.24s; }
        .reveal.delay-4  { transition-delay:0.32s; }
        .reveal.delay-5  { transition-delay:0.40s; }
        .reveal.delay-6  { transition-delay:0.48s; }
        .reveal.revealed { opacity:1; transform:translateY(0); }

        .nav-link        { transition:color 0.2s; }
        .nav-link:hover  { color:#FF6B9D !important; }
        .nav-link:focus-visible,
        a:focus-visible,
        button:focus-visible {
          outline: 3px solid #FF6B9D;
          outline-offset: 3px;
          border-radius: 4px;
        }
        .project-card    { transition:transform 0.22s ease, box-shadow 0.22s ease; cursor:pointer; }
        .project-card:hover { transform:translateY(-6px) rotate(-0.8deg); }
        .cta-btn         { transition:transform 0.15s, box-shadow 0.15s; }
        .cta-btn:hover   { transform:translateY(-2px); }
        .cta-btn:active  { transform:translateY(1px); }
        .cursor          { display:inline-block; animation:cursorBlink 0.85s step-end infinite; color:#FF6B9D; }
        .clamp-3         { display:-webkit-box; -webkit-line-clamp:3; line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
          .reveal { opacity:1; transform:none; }
        }

        @media (max-width: 640px) {
          h1 { font-size: clamp(36px, 9vw, 56px) !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
          .nav-inner { gap: 12px !important; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
          .nav-link  { font-size: 11px !important; white-space: nowrap; }
          .hero-inner { gap: 28px !important; justify-content: center !important; }
          .hero-text  { min-width: 0 !important; }
          .profile-photo { width: 200px !important; height: 240px !important; }
          .popup-inner   { padding: 16px 16px 28px !important; }
          .popup-title   { font-size: clamp(15px, 5vw, 22px) !important; }
        }
        @media (max-width: 420px) {
          .nav-link { display: none !important; }
        }

        * { box-sizing:border-box; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background:T.nav, backdropFilter:"blur(14px)",
        borderBottom:`2px solid ${T.navBorder}`,
        padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64,
      }}>
        <a href="#about" onClick={e => handleNav(e, "about")}
          style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"#FF6B9D", letterSpacing:1, textDecoration:"none" }}>
          S.M. ✦
        </a>
        <div className="nav-inner" style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
          {NAV_LINKS.map(l => {
            const id = l.toLowerCase();
            return (
              <a key={l} className="nav-link" href={`#${id}`}
                onClick={e => handleNav(e, id)}
                style={{ color:T.textSub, fontWeight:600, fontSize:13, textDecoration:"none", letterSpacing:0.5 }}
              >{l}</a>
            );
          })}
          <ModeToggle dark={dark} onToggle={toggleDark} />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="about" style={{ minHeight:"92vh", display:"flex", alignItems:"center", padding:"60px clamp(20px,5vw,48px)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, zIndex:0, backgroundImage:`radial-gradient(circle, ${T.dot} 1px, transparent 1px)`, backgroundSize:"28px 28px", opacity: dark?0.15:0.28 }}/>
        <div style={{ position:"absolute", top:60, right:"8%", width:340, height:340, background:T.blob1, borderRadius:"60% 40% 70% 30%/40% 60% 40% 60%", animation:"float 6s ease-in-out infinite", zIndex:0 }}/>
        <div style={{ position:"absolute", bottom:40, left:"5%", width:200, height:200, background:T.blob2, borderRadius:"50%", animation:"float 8s ease-in-out infinite reverse", zIndex:0 }}/>

        <div className="hero-inner" style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:60, maxWidth:1100, margin:"0 auto", width:"100%", flexWrap:"wrap" }}>
          <div className="hero-text" style={{ flex:1, minWidth:300 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"#FFD700", color:"#1A1A1A",
              fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:2,
              padding:"5px 20px", borderRadius:999, border:"2.5px solid #1A1A1A",
              boxShadow:"3px 3px 0 #1A1A1A", marginBottom:24,
            }}>⚡ TEXAS A&M · MS-MIS · CLASS OF 2027</div>

            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(44px,5.5vw,72px)", fontWeight:900, lineHeight:1.08, margin:"0 0 16px", color:T.text }}>
              Hi, I'm<br/>
              <span style={{ color:"#FF6B9D" }}>Sharvari</span><br/>
              <span style={{ fontStyle:"italic", fontSize:"0.85em" }}>Mhatre.</span>
            </h1>

            <p style={{ fontSize:18, color:T.textSub, lineHeight:1.6, maxWidth:480, margin:"0 0 32px", minHeight:56 }}>
              {typed}<span className="cursor" aria-hidden="true">|</span>
            </p>

            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:32 }}>
              {CERTS.map(c => (
                <div key={c.label} style={{
                  background: dark ? "#1C1428" : "#fff",
                  border:`2px solid ${c.color}`,
                  borderRadius:999, padding:"5px 14px",
                  display:"flex", alignItems:"center", gap:7,
                  boxShadow:`2px 2px 0 ${c.color}40`,
                }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:c.color, flexShrink:0 }}/>
                  <span style={{ fontSize:12, fontWeight:700, color:T.text }}>{c.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <a href="#projects" className="cta-btn" onClick={e => handleNav(e, "projects")} style={{
                background:"#FF6B9D", color:"#fff", fontWeight:700, fontSize:15,
                padding:"14px 32px", borderRadius:999, border:"3px solid #1A1A1A",
                boxShadow:"4px 4px 0 #1A1A1A", textDecoration:"none",
              }}>See My Work 💼</a>
              <a href="#contact" className="cta-btn" onClick={e => handleNav(e, "contact")} style={{
                background:"transparent", color:T.text, fontWeight:700, fontSize:15,
                padding:"14px 32px", borderRadius:999,
                border:`3px solid ${dark?"#3D2050":"#1A1A1A"}`,
                boxShadow:`4px 4px 0 ${dark?"#3D2050":"#1A1A1A"}`,
                textDecoration:"none",
              }}>Say Hello 👋</a>
            </div>
          </div>

          <div style={{ flex:"0 0 auto", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{
              background: dark?"#1C1428":"#fff",
              border:`3px solid ${dark?"#3D2050":"#1A1A1A"}`,
              borderRadius:16, padding:"10px 20px",
              fontFamily:"'Bangers',cursive", fontSize:16, letterSpacing:1,
              color:"#FF6B9D", boxShadow:`3px 3px 0 ${dark?"#3D2050":"#1A1A1A"}`,
              marginBottom:8, position:"relative",
              animation:"wiggle 3.5s ease-in-out infinite",
            }}>
              Builder. Strategist. Creator. ✨
              <div style={{ position:"absolute", bottom:-14, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"12px solid transparent", borderRight:"12px solid transparent", borderTop:`14px solid ${dark?"#3D2050":"#1A1A1A"}` }}/>
              <div style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"10px solid transparent", borderRight:"10px solid transparent", borderTop:`12px solid ${dark?"#1C1428":"#fff"}` }}/>
            </div>
            <ProfilePhoto T={T} dark={dark} />
            <div style={{ display:"flex", gap:8, marginTop:18, flexWrap:"wrap", justifyContent:"center" }}>
              {["🚀 Full-Stack","🤖 AI Builder","📊 Data Strategist"].map(b => (
                <span key={b} style={{
                  background:dark?"#1C1428":"#fff", fontSize:12, fontWeight:600,
                  padding:"5px 14px", borderRadius:999,
                  border:`2px solid ${T.cardBorder}`, color:T.textSub,
                  boxShadow:`2px 2px 0 ${T.cardBorder}`,
                }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ padding:"60px 48px", background:T.surfaceAlt, borderTop:`3px solid ${T.navBorder}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:3, color:"#FF6B9D", marginBottom:6 }}>✦ BY THE NUMBERS ✦</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, margin:0, color:T.text }}>
              Receipts <span style={{ fontStyle:"italic", color:"#FF6B9D" }}>not promises.</span>
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
            {stats.map((s,i) => (
              <div key={s.label} className={`reveal delay-${i+1}`} style={{
                background:T.statCard, border:`3px solid ${T.statBorder}`,
                borderTop:`4px solid ${s.color}`, borderRadius:18,
                padding:"22px 18px", textAlign:"center",
                boxShadow:`3px 3px 0 ${T.statBorder}`,
              }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:900, color:s.color, lineHeight:1, marginBottom:8 }}>{s.value}</div>
                <div style={{ fontSize:13, fontWeight:600, color:T.textSub, letterSpacing:0.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding:"80px 48px", background:T.surface, borderTop:`3px solid ${T.navBorder}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="reveal" style={{ marginBottom:48, display:"flex", alignItems:"flex-end", gap:20, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:3, color:"#FF6B9D", marginBottom:6 }}>✦ SELECTED WORK ✦</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900, margin:0, lineHeight:1.1, color:T.text }}>
                Projects<br/><span style={{ fontStyle:"italic", color:"#FF6B9D" }}>& Case Files</span>
              </h2>
            </div>
            <div style={{
              background:"#FFD700", border:"3px solid #1A1A1A", boxShadow:"4px 4px 0 #1A1A1A",
              borderRadius:12, fontFamily:"'Bangers',cursive", fontSize:14,
              padding:"8px 20px", color:"#1A1A1A", letterSpacing:1, marginLeft:"auto",
            }}>👆 CLICK A CARD</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:24 }}>
            {projects.map((p,i) => {
              const cardBg = dark ? (DARK_PROJECT_BG[p.bg]||"#1A0F2E") : p.bg;
              return (
                <button key={p.id}
                  className={`project-card reveal delay-${i+1}`}
                  onClick={() => openProject(p)}
                  onMouseEnter={() => sounds.softClick()}
                  aria-label={`View details for ${p.title}`}
                  style={{
                    background:cardBg, border:`3px solid ${p.border}`, borderRadius:20,
                    padding:"28px 24px", boxShadow:`4px 4px 0 ${p.border}`,
                    position:"relative", overflow:"hidden", textAlign:"left",
                    color:"inherit", font:"inherit",
                  }}
                >
                  <div style={{ position:"absolute", bottom:-20, right:-20, width:100, height:100, backgroundImage:`radial-gradient(circle, ${p.border}44 1.5px, transparent 1.5px)`, backgroundSize:"14px 14px" }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:40 }}>{p.emoji}</span>
                    <span style={{ background:dark?"#0D0812":"#fff", color:p.border, border:`1.5px solid ${p.border}`, borderRadius:999, fontSize:11, fontWeight:700, padding:"2px 10px" }}>{p.year}</span>
                  </div>
                  <div style={{ display:"inline-block", background:p.border, color:"#fff", fontFamily:"'Bangers',cursive", fontSize:11, letterSpacing:2, padding:"2px 12px", borderRadius:999, marginBottom:10 }}>{p.tag}</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, margin:"0 0 10px", lineHeight:1.3, color:T.text }}>{p.title}</h3>
                  <p className="clamp-3" style={{ fontSize:13, color:T.textSub, lineHeight:1.6, margin:0 }}>{p.desc}</p>
                  <div style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:6, color:p.border, fontWeight:700, fontSize:13, fontFamily:"'Bangers',cursive", letterSpacing:1 }}>OPEN CASE FILE →</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" style={{ padding:"80px 48px", background:T.surfaceAlt, borderTop:`3px solid ${T.navBorder}` }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div className="reveal" style={{ marginBottom:48 }}>
            <div style={{ fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:3, color:"#9B59B6", marginBottom:6 }}>✦ WHERE I'VE BEEN ✦</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900, margin:0, color:T.text }}>
              Experience<br/><span style={{ fontStyle:"italic", color:"#9B59B6" }}>& Impact</span>
            </h2>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {experience.map((e,i) => (
              <div key={e.company} className={`reveal delay-${i+1}`} style={{
                background:T.expCard, border:`3px solid ${T.expBorder}`,
                borderLeft:`5px solid ${e.color}`, borderRadius:20,
                padding:"28px 32px", boxShadow:`4px 4px 0 ${T.expBorder}`,
                position:"relative", overflow:"hidden",
              }}>
                <div style={{ position:"absolute", top:0, right:0, width:120, height:120, backgroundImage:`radial-gradient(circle, ${e.color}22 1.5px, transparent 1.5px)`, backgroundSize:"14px 14px" }}/>
                <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:16 }}>
                  <div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, margin:"0 0 4px", color:T.text }}>{e.role}</h3>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, color:e.color, fontSize:15 }}>{e.company}</span>
                      <span style={{ color:T.textMuted, fontSize:13 }}>· {e.location}</span>
                    </div>
                  </div>
                  <div style={{
                    background: dark?"#0D0812":"#fff", border:`2px solid ${e.color}`,
                    color:e.color, borderRadius:999, fontSize:12, fontWeight:700,
                    padding:"4px 14px", whiteSpace:"nowrap",
                    fontFamily:"'Bangers',cursive", letterSpacing:1,
                  }}>{e.period}</div>
                </div>
                <ul style={{ margin:0, padding:0, listStyle:"none" }}>
                  {e.bullets.map((b,j) => (
                    <li key={j} style={{ position:"relative", paddingLeft:20, marginBottom:10, fontSize:14, color:T.textSub, lineHeight:1.7 }}>
                      <span aria-hidden="true" style={{ position:"absolute", left:0, color:e.color, fontWeight:900 }}>✦</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section id="education" style={{ padding:"80px 48px", background:T.surface, borderTop:`3px solid ${T.navBorder}` }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div className="reveal" style={{ marginBottom:48 }}>
            <div style={{ fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:3, color:"#2980B9", marginBottom:6 }}>✦ THE FOUNDATION ✦</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900, margin:0, color:T.text }}>
              Education<br/><span style={{ fontStyle:"italic", color:"#2980B9" }}>& Learning</span>
            </h2>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {education.map((ed,i) => (
              <div key={ed.school} className={`reveal delay-${i+1}`} style={{
                background:T.expCard, border:`3px solid ${T.expBorder}`,
                borderLeft:`5px solid ${ed.color}`, borderRadius:20,
                padding:"28px 32px", boxShadow:`4px 4px 0 ${T.expBorder}`,
                position:"relative", overflow:"hidden",
              }}>
                <div style={{ position:"absolute", top:0, right:0, width:120, height:120, backgroundImage:`radial-gradient(circle, ${ed.color}22 1.5px, transparent 1.5px)`, backgroundSize:"14px 14px" }}/>
                <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:14 }}>
                  <div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, margin:"0 0 4px", color:T.text }}>🎓 {ed.degree}</h3>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, color:ed.color, fontSize:15 }}>{ed.school}</span>
                      <span style={{ color:T.textMuted, fontSize:13 }}>· {ed.location}</span>
                    </div>
                  </div>
                  <div style={{
                    background: dark?"#0D0812":"#fff", border:`2px solid ${ed.color}`,
                    color:ed.color, borderRadius:999, fontSize:12, fontWeight:700,
                    padding:"4px 14px", whiteSpace:"nowrap",
                    fontFamily:"'Bangers',cursive", letterSpacing:1,
                  }}>{ed.period}</div>
                </div>
                <ul style={{ margin:0, padding:0, listStyle:"none" }}>
                  {ed.notes.map((n,j) => (
                    <li key={j} style={{ position:"relative", paddingLeft:20, marginBottom:8, fontSize:14, color:T.textSub, lineHeight:1.7 }}>
                      <span aria-hidden="true" style={{ position:"absolute", left:0, color:ed.color, fontWeight:900 }}>✦</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ padding:"80px 48px", background:T.surfaceAlt, borderTop:`3px solid ${T.navBorder}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="reveal" style={{ marginBottom:48 }}>
            <div style={{ fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:3, color:"#FF6B9D", marginBottom:6 }}>✦ ARSENAL ✦</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900, margin:0, color:T.text }}>
              Skills &<br/><span style={{ fontStyle:"italic", color:"#FF6B9D" }}>Superpowers</span>
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
            {skillCategories.map((cat,i) => (
              <div key={cat.label} className={`reveal delay-${i+1}`} style={{
                background:T.catCard, border:`3px solid ${T.catBorder}`,
                borderTop:`4px solid ${cat.color}`,
                borderRadius:20, padding:"24px",
                boxShadow:`3px 3px 0 ${T.catBorder}`,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <span aria-hidden="true" style={{ fontSize:26 }}>{cat.icon}</span>
                  <span style={{ fontFamily:"'Bangers',cursive", fontSize:16, letterSpacing:2, color:cat.color }}>{cat.label.toUpperCase()}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {cat.items.map(item => (
                    <span key={item} style={{
                      background: dark ? "#0D0812" : "#FFF8F9",
                      border:`1.5px solid ${cat.color}55`,
                      color:T.text, borderRadius:999,
                      fontSize:12, fontWeight:600, padding:"4px 12px",
                    }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding:"80px 48px", background:T.contactBg, borderTop:"3px solid #FF6B9D", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div className="reveal" style={{ fontFamily:"'Bangers',cursive", fontSize:14, letterSpacing:3, color:"#FF6B9D", marginBottom:16 }}>✦ LET'S CONNECT ✦</div>
          <h2 className="reveal delay-1" style={{ fontFamily:"'Playfair Display',serif", fontSize:52, fontWeight:900, color:T.contactText, margin:"0 0 16px", lineHeight:1.1 }}>
            Say<br/><span style={{ color:"#FF6B9D", fontStyle:"italic" }}>Hello! 💌</span>
          </h2>
          <p className="reveal delay-2" style={{ color:T.contactSub, fontSize:17, lineHeight:1.7, marginBottom:36 }}>
            Open to internships, collaborations, and exciting ideas.<br/>Let's build something amazing together.
          </p>
          <a href="mailto:sharvari.mhatre@tamu.edu" className="cta-btn reveal delay-3"
            onClick={() => sounds.chime()}
            style={{ display:"inline-block", background:"#FF6B9D", color:"#fff", fontWeight:700, fontSize:16, padding:"16px 40px", borderRadius:999, border:"3px solid #fff", boxShadow:"5px 5px 0 #FF6B9D60", textDecoration:"none", letterSpacing:0.5 }}>
            sharvari.mhatre@tamu.edu ✉️
          </a>
          <div className="reveal delay-4" style={{ display:"flex", gap:12, justifyContent:"center", marginTop:28, flexWrap:"wrap" }}>
            {[
              { label:"LinkedIn", href:"https://linkedin.com/in/sharvarim7", external:true },
              { label:"GitHub",   href:"https://github.com/sharvarim7",      external:true },
              { label:"Resume",   href:`${import.meta.env.BASE_URL}resume.pdf`, external:true },
            ].map(({label,href,external}) => (
              <a key={label} href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={() => sounds.softClick()} style={{
                color:T.contactLink, fontSize:13, fontWeight:600,
                padding:"6px 18px", border:`1.5px solid ${T.contactLinkBorder}`,
                borderRadius:999, transition:"color 0.2s, border-color 0.2s",
                textDecoration:"none",
              }}
                onMouseEnter={e => { e.currentTarget.style.color="#FF6B9D"; e.currentTarget.style.borderColor="#FF6B9D"; }}
                onMouseLeave={e => { e.currentTarget.style.color=T.contactLink; e.currentTarget.style.borderColor=T.contactLinkBorder; }}
              >{label}</a>
            ))}
          </div>
          <p style={{ color:T.contactSub, fontSize:12, marginTop:48, opacity:0.6 }}>
            © {new Date().getFullYear()} Sharvari Mhatre · Made with React & 🩷
          </p>
        </div>
      </section>

      {active && <ComicPopup project={active} onClose={() => setActive(null)} sounds={sounds} dark={dark} />}
    </div>
  );
}
