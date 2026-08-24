import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";

import Auth from "./Auth";
import PracticeTestSection from "./PracticeTest";
import CloudFiles from "./CloudFiles";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";

import * as firestore from "firebase/firestore";
const {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  serverTimestamp,
  onSnapshot,
  getDocs,
} = firestore;
const firestoreQuery = firestore.query;

import {
  Search,
  Star,
  ExternalLink,
  ChevronLeft,
  FileText,
  BookOpen,
  Ticket,
  Save,
  ChevronDown,
  CalendarDays,
  List,
  Pin,
  Download,
  FileDown,
} from "lucide-react";

/* =========================================================
   FONTS & COLORS
========================================================= */
const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";
const monoFont = "'IBM Plex Mono', monospace";

const C = {
  bg: "#f4f1ea",
  surface: "#ffffff",
  ink: "#14213d",
  inkSoft: "#667085",
  line: "#d9d5cc",
  red: "#c84c4c",
  green: "#3c7a57",
  yellow: "#d99a27",
  blue: "#4267a9",
  softRed: "#f8e4e1",
  softGreen: "#e5f1e9",
  softBlue: "#e8eef8",
  softYellow: "#f8efd9",
};

const OMR_BG = `radial-gradient(circle, rgba(20,33,61,0.055) 1px, transparent 1px)`;

/* =========================================================
   EXAM DATA
========================================================= */
const EXAMS = [
  {
    id: "upsc-cse",
    shortName: "UPSC CSE",
    name: "Civil Services Examination",
    category: "UPSC",
    examDate: "2027-05-30",
    applicationStart: "2027-02-10",
    applicationEnd: "2027-02-28",
    description: "India's premier civil services examination conducted by the Union Public Service Commission.",
    eligibility: { education: "Graduate degree", age: "21–32 years", attempts: "Varies by category" },
    stages: ["Preliminary Examination", "Main Examination", "Personality Test"],
    syllabus: [
      {
        stage: "Prelims",
        papers: [
          {
            name: "GS Paper I",
            topics: [
              "Current events of national & international importance",
              "History of India & Indian National Movement",
              "Indian & World Geography (Physical, Social, Economic)",
              "Indian Polity & Governance — Constitution, Political System, Panchayati Raj, Rights",
              "Economic & Social Development — Sustainable Development, Poverty, Inclusion",
              "Environmental ecology, Biodiversity & Climate Change",
              "General Science",
            ],
          },
          {
            name: "CSAT (Paper II) — Qualifying",
            topics: [
              "Comprehension",
              "Interpersonal skills including communication skills",
              "Logical reasoning & analytical ability",
              "Decision making & problem solving",
              "General mental ability",
              "Basic numeracy (Class X level) & Data interpretation",
            ],
          },
        ],
      },
      {
        stage: "Mains",
        papers: [
          { name: "Essay", topics: ["Two essays (~1000 words each) from philosophical, governance, society, technology & current-event themes"] },
          {
            name: "GS-I — Heritage, History, Geography, Society",
            topics: [
              "Indian culture — art forms, literature, architecture",
              "Modern Indian history (mid-18th century onwards)",
              "Freedom struggle — stages & contributors",
              "Post-independence consolidation",
              "History of the world (18th century events, industrial revolution, world wars, etc.)",
              "Indian society — diversity, role of women, poverty, urbanization",
              "World & Indian geography — physical, resources, industries",
            ],
          },
          {
            name: "GS-II — Governance, Constitution, Polity, Social Justice, IR",
            topics: [
              "Indian Constitution — evolution, features, amendments, basic structure",
              "Functions & responsibilities of Union & States; federal issues",
              "Separation of powers, dispute redressal mechanisms",
              "Parliament & State legislatures; Executive & Judiciary",
              "Statutory, regulatory & quasi-judicial bodies",
              "Government policies & interventions for development",
              "Welfare schemes, social sector, health, education, HRD",
              "International relations — India & neighbourhood, bilateral/global groupings",
            ],
          },
          {
            name: "GS-III — Technology, Economy, Biodiversity, Security, Disaster Mgmt",
            topics: [
              "Indian economy — planning, growth, employment, inclusive growth",
              "Agriculture, food processing, land reforms",
              "Science & technology developments; indigenization",
              "Environment, biodiversity, climate change, conservation",
              "Disaster management",
              "Internal security — extremism, cyber security, border management",
            ],
          },
          {
            name: "GS-IV — Ethics, Integrity & Aptitude",
            topics: [
              "Ethics & human interface — essence, determinants, consequences",
              "Attitude, aptitude, emotional intelligence",
              "Moral thinkers & philosophers (India & world)",
              "Public/Civil service values & ethics in public administration",
              "Probity in governance, RTI, codes of ethics/conduct",
              "Case studies on above issues",
            ],
          },
          { name: "Optional Subject (2 papers)", topics: ["One optional subject chosen from the official list of ~48 subjects"] },
        ],
      },
    ],
    officialWebsite: "https://upsc.gov.in/",
    notificationUrl: "https://upsc.gov.in/examinations",
  },
  {
    id: "ssc-cgl",
    shortName: "SSC CGL",
    name: "Combined Graduate Level Examination",
    category: "SSC",
    examDate: "2027-06-15",
    applicationStart: "2027-03-15",
    applicationEnd: "2027-04-10",
    description: "A major recruitment examination for Group B and Group C posts in the Government of India.",
    eligibility: { education: "Graduate degree", age: "18–32 years depending on post", attempts: "No fixed attempt limit" },
    stages: ["Tier-I", "Tier-II", "Document Verification"],
    syllabus: [
      {
        stage: "Tier I",
        papers: [
          { name: "General Intelligence & Reasoning", topics: ["Analogy, Classification, Series", "Coding-Decoding, Blood Relations", "Venn Diagrams, Syllogism", "Paper folding, Matrix", "Order & Ranking, Puzzles"] },
          { name: "General Awareness", topics: ["Current events", "Indian History, Geography, Polity", "Economy, Budget, Schemes", "General Science", "Environment, Sports, Awards"] },
          { name: "Quantitative Aptitude", topics: ["Number System, Simplification", "Percentage, Ratio, Average", "Profit & Loss, SI & CI", "Time & Work, Speed-Distance", "Algebra, Geometry, Mensuration", "Data Interpretation"] },
          { name: "English Comprehension", topics: ["Reading Comprehension, Cloze Test", "Error Spotting, Sentence Improvement", "Synonyms, Antonyms, Idioms", "One-word substitution", "Para Jumbles, Active/Passive"] },
        ],
      },
      {
        stage: "Tier II",
        papers: [
          { name: "Mathematical Abilities", topics: ["Advanced Arithmetic, Algebra, Geometry", "Trigonometry, Statistics, Probability"] },
          { name: "Reasoning & General Intelligence", topics: ["Higher-order puzzles, critical thinking"] },
          { name: "English Language & Comprehension", topics: ["Longer RC passages, advanced grammar"] },
          { name: "General Awareness", topics: ["Static GK + recent current affairs"] },
          { name: "Computer Knowledge + DEST", topics: ["Computer basics, MS Office, Internet"] },
        ],
      },
    ],
    officialWebsite: "https://ssc.gov.in/",
    notificationUrl: "https://ssc.gov.in/",
  },
  {
    id: "jee-main",
    shortName: "JEE Main",
    name: "Joint Entrance Examination Main",
    category: "Engineering",
    examDate: "2027-01-20",
    applicationStart: "2026-10-01",
    applicationEnd: "2026-11-15",
    description: "A national-level entrance examination for undergraduate engineering programs.",
    eligibility: { education: "Class 12 or equivalent", age: "No specific age limit", attempts: "As specified by NTA" },
    stages: ["Computer Based Test", "Result", "Counselling"],
    syllabus: [
      {
        stage: "Paper 1 (B.E./B.Tech)",
        papers: [
          { name: "Physics", topics: ["Units & Measurements, Kinematics", "Laws of Motion, Work Energy", "Thermodynamics, Oscillations", "Electrostatics, Current Electricity", "Optics, Dual Nature, Atoms"] },
          { name: "Chemistry", topics: ["Physical Chemistry basics", "Inorganic: Periodic Table, Coordination", "Organic: Hydrocarbons, Functional groups"] },
          { name: "Mathematics", topics: ["Sets, Complex Numbers, Matrices", "Calculus, Differential Equations", "Coordinate Geometry, Vectors", "Probability, Trigonometry"] },
        ],
      },
    ],
    officialWebsite: "https://jeemain.nta.nic.in/",
    notificationUrl: "https://jeemain.nta.nic.in/",
  },
  {
    id: "gate",
    shortName: "GATE",
    name: "Graduate Aptitude Test in Engineering",
    category: "Engineering",
    examDate: "2027-02-07",
    applicationStart: "2026-08-25",
    applicationEnd: "2026-10-01",
    description: "National examination for postgraduate admissions and PSU recruitment.",
    eligibility: { education: "Undergraduate degree or pursuing", age: "No age limit", attempts: "No attempt limit" },
    stages: ["Computer Based Test", "Score", "Admission / Recruitment"],
    syllabus: [
      {
        stage: "GATE",
        papers: [
          { name: "General Aptitude", topics: ["Verbal Ability", "Numerical Ability"] },
          { name: "Subject paper", topics: ["Core engineering topics as per paper code", "Engineering Mathematics"] },
        ],
      },
    ],
    officialWebsite: "https://gate2027.iitg.ac.in/",
    notificationUrl: "https://gate2027.iitg.ac.in/",
  },
  {
    id: "cat",
    shortName: "CAT",
    name: "Common Admission Test",
    category: "Management",
    examDate: "2026-11-29",
    applicationStart: "2026-08-01",
    applicationEnd: "2026-09-15",
    description: "National management entrance exam for IIMs and other B-schools.",
    eligibility: { education: "Bachelor's degree", age: "No age limit", attempts: "No attempt limit" },
    stages: ["Computer Based Test", "Shortlisting", "Further process"],
    syllabus: [
      {
        stage: "Three sections",
        papers: [
          { name: "VARC", topics: ["Reading Comprehension", "Para Jumbles", "Para Summary", "Odd Sentence Out"] },
          { name: "DILR", topics: ["Tables, Graphs, Caselets", "Seating, Puzzles", "Binary logic, Games"] },
          { name: "Quantitative Aptitude", topics: ["Arithmetic", "Algebra", "Geometry", "Number System, Modern Math"] },
        ],
      },
    ],
    officialWebsite: "https://iimcat.ac.in/",
    notificationUrl: "https://iimcat.ac.in/",
  },
  {
    id: "neet-ug",
    shortName: "NEET UG",
    name: "National Eligibility cum Entrance Test",
    category: "Medical",
    examDate: "2027-05-02",
    applicationStart: "2027-02-01",
    applicationEnd: "2027-03-15",
    description: "National entrance examination for undergraduate medical education.",
    eligibility: { education: "10+2 with required subjects", age: "As specified by NTA", attempts: "As specified by NTA" },
    stages: ["Entrance Examination", "Result", "Counselling"],
    syllabus: [
      {
        stage: "Single paper (PCB)",
        papers: [
          { name: "Physics", topics: ["Mechanics, Thermodynamics", "Electrostatics, Optics", "Modern Physics"] },
          { name: "Chemistry", topics: ["Physical, Inorganic, Organic Chemistry"] },
          { name: "Biology", topics: ["Diversity, Cell, Physiology", "Reproduction, Genetics", "Ecology, Biotechnology"] },
        ],
      },
    ],
    officialWebsite: "https://neet.nta.nic.in/",
    notificationUrl: "https://neet.nta.nic.in/",
  },
];

/* =========================================================
   HELPERS
========================================================= */
function daysLeft(dateString) {
  const today = new Date();
  const examDate = new Date(dateString);
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  return Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
  if (!dateString) return "Not available";
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getCountdownText(days) {
  if (days < 0) return "Exam completed";
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/* =========================================================
   HERO
========================================================= */
function HeroPass({ trackedCount, exams }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const examDateMap = React.useMemo(() => {
    const map = {};
    exams.forEach((exam) => {
      const d = new Date(exam.examDate);
      d.setHours(0, 0, 0, 0);
      const key = d.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(exam);
    });
    return map;
  }, [exams]);

  const examsOnSelected = examDateMap[selectedDate.toDateString()] || [];

  return (
    <div style={{ marginBottom: 18, background: C.ink, color: "#fff", borderRadius: 14, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -25, top: -35, width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.12)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
            <Ticket size={27} />
            <div style={{ fontFamily: displayFont, fontSize: 27, fontWeight: 700 }}>Hall Pass</div>
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 13, color: "rgba(255,255,255,0.72)", maxWidth: 430 }}>
            Your simple dashboard for tracking important competitive exams.
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "center", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "9px 12px" }}>
          <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700 }}>{trackedCount}</div>
          <div style={{ fontFamily: bodyFont, fontSize: 10, color: "rgba(255,255,255,0.65)" }}>TRACKED</div>
        </div>
      </div>

      <button onClick={() => setShowCalendar(!showCalendar)} style={{ marginTop: 18, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontFamily: bodyFont, fontWeight: 600 }}>
        <CalendarDays size={18} />
        {showCalendar ? "Hide Calendar" : "Open Calendar"}
      </button>

      {showCalendar && (
        <div style={{ marginTop: 15, background: "#fff", borderRadius: 12, padding: 12, color: "#111" }}>
          <style>{`
            .react-calendar__tile.has-exam { position: relative; font-weight: 700; color: #14213d !important; }
            .react-calendar__tile.has-exam::after { content: ""; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; border-radius: 50%; background: #c84c4c; }
            .react-calendar__tile--active.has-exam::after { background: #fff; }
          `}</style>
          <Calendar value={selectedDate} onChange={setSelectedDate} tileClassName={({ date }) => (examDateMap[date.toDateString()] ? "has-exam" : null)} />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: bodyFont, fontWeight: 600, color: C.ink, fontSize: 14, marginBottom: 8 }}>{selectedDate.toDateString()}</div>
            {examsOnSelected.length === 0 ? (
              <div style={{ fontSize: 13, color: C.inkSoft }}>No exams on this day</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {examsOnSelected.map((exam) => (
                  <div key={exam.id} style={{ background: C.softBlue, borderRadius: 8, padding: "8px 10px", fontSize: 13, fontWeight: 600, color: C.ink }}>
                    {exam.shortName} — {exam.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   EXAM CARD
========================================================= */
function ExamCard({ exam, starred, onToggleStar, onOpen }) {
  const dl = daysLeft(exam.examDate);
  return (
    <div className="hp-card" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontFamily: monoFont, fontSize: 10, textTransform: "uppercase", color: C.inkSoft, marginBottom: 5 }}>{exam.category}</div>
          <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: C.ink }}>{exam.shortName}</div>
          <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>{exam.name}</div>
        </div>
        <button onClick={() => onToggleStar(exam.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: starred ? C.yellow : C.inkSoft, padding: 0 }}>
          <Star size={20} fill={starred ? C.yellow : "none"} />
        </button>
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, margin: "14px 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontFamily: monoFont, fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase" }}>Exam date</div>
          <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 3 }}>{formatDate(exam.examDate)}</div>
        </div>
        <div>
          <div style={{ fontFamily: monoFont, fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase" }}>Countdown</div>
          <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: dl <= 14 ? C.red : dl <= 30 ? C.yellow : C.green, marginTop: 3 }}>
            {getCountdownText(dl)}
          </div>
        </div>
      </div>
      <button onClick={() => onOpen(exam.id)} style={{ width: "100%", marginTop: 15, border: `1px solid ${C.line}`, background: C.bg, color: C.ink, borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600 }}>
        View exam details
      </button>
    </div>
  );
}

/* =========================================================
   SYLLABUS PANEL
========================================================= */
function SyllabusPanel({ exam, user }) {
  const stages = exam.syllabus || [];
  const [openKey, setOpenKey] = useState(() => (stages.length && stages[0].papers?.length ? `${stages[0].stage}-0` : null));
  const [completed, setCompleted] = useState(new Set());
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompleted(new Set());
      setProgressLoading(false);
      return;
    }
    setProgressLoading(true);
    const q = firestoreQuery(collection(db, "progress"), where("userId", "==", user.uid), where("examId", "==", exam.id));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) setCompleted(new Set());
      else setCompleted(new Set(snap.docs[0].data().completedTopics || []));
      setProgressLoading(false);
    }, () => setProgressLoading(false));
    return () => unsub();
  }, [user, exam.id]);

  const toggleTopic = async (topicKey) => {
    if (!user) return alert("Please log in to track progress.");
    const next = new Set(completed);
    if (next.has(topicKey)) next.delete(topicKey);
    else next.add(topicKey);
    setCompleted(next);

    try {
      const q = firestoreQuery(collection(db, "progress"), where("userId", "==", user.uid), where("examId", "==", exam.id));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "progress"), { userId: user.uid, examId: exam.id, completedTopics: [...next], updatedAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, "progress", snap.docs[0].id), { completedTopics: [...next], updatedAt: serverTimestamp() });
      }
    } catch (e) {
      console.error(e);
      alert("Could not save progress.");
    }
  };

  let total = 0;
  stages.forEach((s) => s.papers.forEach((p) => (total += p.topics.length)));
  const percent = total === 0 ? 0 : Math.round((completed.size / total) * 100);

  if (!stages.length) return null;

  return (
    <section style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: 0, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
          <List size={18} color={C.inkSoft} /> Syllabus breakdown
        </h2>
        {!progressLoading && <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: percent === 100 ? C.green : C.ink }}>{percent}%</div>}
      </div>
      <div style={{ height: 6, background: C.line, borderRadius: 99, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percent}%`, background: percent === 100 ? C.green : C.ink, borderRadius: 99, transition: "width 0.3s" }} />
      </div>
      <div style={{ fontFamily: bodyFont, fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>Tick topics as you complete them.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.map((stage) =>
          stage.papers.map((paper, pi) => {
            const key = `${stage.stage}-${pi}`;
            const isOpen = openKey === key;
            return (
              <div key={key} style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", background: C.surface }}>
                <button onClick={() => setOpenKey(isOpen ? null : key)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: C.bg, border: "none", padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
                  <div>
                    <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase" }}>{stage.stage}</div>
                    <div style={{ fontFamily: bodyFont, fontSize: 13.5, fontWeight: 600, color: C.ink, marginTop: 2 }}>{paper.name}</div>
                  </div>
                  <ChevronDown size={16} color={C.inkSoft} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "0.15s" }} />
                </button>
                {isOpen && (
                  <ul style={{ margin: 0, padding: "8px 14px 12px", background: "#fff", listStyle: "none" }}>
                    {paper.topics.map((topic, ti) => {
                      const topicKey = `${stage.stage}::${paper.name}::${topic}`;
                      const done = completed.has(topicKey);
                      return (
                        <li key={ti} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: ti ? `1px solid ${C.line}` : "none" }}>
                          <input type="checkbox" checked={done} onChange={() => toggleTopic(topicKey)} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.ink, cursor: "pointer" }} />
                          <span style={{ fontSize: 12.5, color: done ? C.inkSoft : C.ink, textDecoration: done ? "line-through" : "none", lineHeight: 1.5 }}>{topic}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

/* =========================================================
   EXAM DETAIL
========================================================= */
function ExamDetail({ exam, starred, onToggleStar, onBack, user }) {
  const dl = daysLeft(exam.examDate);

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "transparent",
          border: "none",
          padding: "5px 0",
          marginBottom: 14,
          color: C.inkSoft,
          cursor: "pointer",
          fontFamily: bodyFont,
          fontSize: 13,
        }}
      >
        <ChevronLeft size={17} /> Back to exams
      </button>

      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: 20, background: C.ink, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 15 }}>
            <div>
              <div style={{ fontFamily: monoFont, fontSize: 10, textTransform: "uppercase", opacity: 0.65, marginBottom: 6 }}>
                {exam.category}
              </div>
              <h1 style={{ fontFamily: displayFont, fontSize: 30, margin: 0, lineHeight: 1.1 }}>
                {exam.shortName}
              </h1>
              <div style={{ fontFamily: bodyFont, fontSize: 13, opacity: 0.75, marginTop: 6 }}>
                {exam.name}
              </div>
            </div>
            <button
              onClick={() => onToggleStar(exam.id)}
              style={{
                border: "none",
                background: "rgba(255,255,255,0.1)",
                color: starred ? "#f4c64e" : "#fff",
                borderRadius: 9,
                padding: 9,
                cursor: "pointer",
              }}
            >
              <Star size={22} fill={starred ? "#f4c64e" : "none"} />
            </button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {/* Date + Countdown */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
            <div style={{ background: C.softBlue, borderRadius: 10, padding: 12 }}>
              <div style={{ fontFamily: monoFont, fontSize: 9, color: C.inkSoft, textTransform: "uppercase" }}>Exam date</div>
              <div style={{ fontFamily: bodyFont, fontSize: 14, fontWeight: 600, color: C.ink, marginTop: 4 }}>
                {formatDate(exam.examDate)}
              </div>
            </div>
            <div style={{ background: dl <= 14 ? C.softRed : C.softGreen, borderRadius: 10, padding: 12 }}>
              <div style={{ fontFamily: monoFont, fontSize: 9, color: C.inkSoft, textTransform: "uppercase" }}>Countdown</div>
              <div style={{ fontFamily: monoFont, fontSize: 14, fontWeight: 700, color: dl <= 14 ? C.red : C.green, marginTop: 4 }}>
                {getCountdownText(dl)}
              </div>
            </div>
          </div>

          {/* About */}
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 8px", color: C.ink }}>About the exam</h2>
            <p style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>
              {exam.description}
            </p>
          </section>

          {/* Eligibility */}
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 10px", color: C.ink }}>Eligibility</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="hp-eligibility-row">
                <strong className="hp-eligibility-label" style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.ink }}>Education</strong>
                <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>{exam.eligibility.education}</span>
              </div>
              <div className="hp-eligibility-row">
                <strong className="hp-eligibility-label" style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.ink }}>Age</strong>
                <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>{exam.eligibility.age}</span>
              </div>
              <div className="hp-eligibility-row">
                <strong className="hp-eligibility-label" style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.ink }}>Attempts</strong>
                <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>{exam.eligibility.attempts}</span>
              </div>
            </div>
          </section>

          {/* Selection process */}
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 10px", color: C.ink }}>Selection process</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exam.stages.map((stage, i) => (
                <div key={stage} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: bodyFont, fontSize: 13, color: C.inkSoft }}>
                  <span style={{ width: 23, height: 23, borderRadius: "50%", background: C.ink, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: monoFont, fontSize: 10 }}>
                    {i + 1}
                  </span>
                  {stage}
                </div>
              ))}
            </div>
          </section>

          {/* Syllabus */}
          <SyllabusPanel exam={exam} user={user} />

          {/* Official links */}
          <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              <a href={exam.officialWebsite} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.ink, color: "#fff", textDecoration: "none", borderRadius: 8, padding: "9px 12px", fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600 }}>
                Official website <ExternalLink size={14} />
              </a>
              <a href={exam.notificationUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.bg, color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 12px", fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600 }}>
                Exam information <FileText size={14} />
              </a>
            </div>
          </section>
        </div>

        {/* ========== THIS IS THE IMPORTANT PART ========== */}
        <div style={{ padding: "0 20px 20px" }}>
          <PracticeTestSection exam={exam} />
          <CloudFiles user={user} examId={exam.id} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [starred, setStarred] = useState(new Set());
  const [starLoaded, setStarLoaded] = useState(false);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [noteSearch, setNoteSearch] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [noteExamId, setNoteExamId] = useState("");
  const [notePinned, setNotePinned] = useState(false);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    }, () => {
      setUser(null);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }
    setNotesLoading(true);
    const q = firestoreQuery(collection(db, "notes"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotes(list);
      setNotesLoading(false);
      setNotesError(null);
    }, (err) => {
      setNotesError(err.code === "permission-denied" ? "Can't load notes — check rules." : "Can't load notes.");
      setNotesLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setStarred(new Set());
      setStarLoaded(false);
      return;
    }
    try {
      const saved = localStorage.getItem(`hallpass-starred:${user.uid}`);
      setStarred(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch {
      setStarred(new Set());
    }
    setStarLoaded(true);
  }, [user]);

  const saveNote = async () => {
    if (!user) return alert("Please log in first.");
    if (!noteTitle.trim() && !noteContent.trim()) return alert("Please enter a title or content.");
    try {
      const tags = noteTags.split(",").map((t) => t.trim()).filter(Boolean);
      const data = { title: noteTitle.trim(), content: noteContent.trim(), tags, examId: noteExamId || null, pinned: notePinned, updatedAt: serverTimestamp() };
      if (editingNote) {
        await updateDoc(doc(db, "notes", editingNote), data);
      } else {
        await addDoc(collection(db, "notes"), { ...data, userId: user.uid, createdAt: serverTimestamp() });
      }
      setNoteTitle(""); setNoteContent(""); setNoteTags(""); setNoteExamId(""); setNotePinned(false); setEditingNote(null);
    } catch (e) {
      console.error(e);
      alert("Could not save note.");
    }
  };

  const deleteNote = async (id) => {
    if (!user || !window.confirm("Delete this note?")) return;
    try {
      await deleteDoc(doc(db, "notes", id));
      if (editingNote === id) {
        setEditingNote(null); setNoteTitle(""); setNoteContent(""); setNoteTags(""); setNoteExamId(""); setNotePinned(false);
      }
    } catch (e) {
      alert("Could not delete note.");
    }
  };

  const toggleStar = useCallback((id) => {
    if (!user) return;
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(`hallpass-starred:${user.uid}`, JSON.stringify([...next]));
      return next;
    });
  }, [user]);

  const startEditingNote = (note) => {
    setEditingNote(note.id);
    setNoteTitle(note.title || "");
    setNoteContent(note.content || "");
    setNoteTags(Array.isArray(note.tags) ? note.tags.join(", ") : "");
    setNoteExamId(note.examId || "");
    setNotePinned(!!note.pinned);
    setShowNotes(true);
  };

  const exportNoteAsTxt = (note) => {
    const exam = EXAMS.find((e) => e.id === note.examId);
    let text = `${note.title || "Untitled"}\n${"=".repeat(40)}\n\n`;
    if (exam) text += `Exam: ${exam.shortName}\n\n`;
    text += note.content || "";
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(note.title || "note").replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
  };

  const exportNoteAsPdf = (note) => {
    const pdf = new jsPDF();
    const exam = EXAMS.find((e) => e.id === note.examId);
    pdf.setFontSize(16);
    pdf.text(note.title || "Untitled", 15, 20);
    let y = 30;
    if (exam) {
      pdf.setFontSize(11);
      pdf.setTextColor(60, 100, 160);
      pdf.text(`Exam: ${exam.shortName}`, 15, y);
      y += 10;
    }
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.text(pdf.splitTextToSize(note.content || "", 180), 15, y);
    pdf.save(`${(note.title || "note").replace(/[^a-z0-9]/gi, "_")}.pdf`);
  };

  const categories = ["All", ...Array.from(new Set(EXAMS.map((e) => e.category)))];
  const filtered = EXAMS.filter((e) => {
    const q = query.trim().toLowerCase();
    const matchSearch = !q || e.shortName.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchCat = category === "All" || e.category === category;
    return matchSearch && matchCat;
  });
  const starredExams = EXAMS.filter((e) => starred.has(e.id)).sort((a, b) => daysLeft(a.examDate) - daysLeft(b.examDate));
  const selectedExam = EXAMS.find((e) => e.id === selectedId);

  const filteredNotes = notes
    .filter((n) => {
      const s = noteSearch.trim().toLowerCase();
      if (!s) return true;
      return n.title?.toLowerCase().includes(s) || n.content?.toLowerCase().includes(s) || n.tags?.some((t) => t.toLowerCase().includes(s));
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
    });

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: bodyFont }}>
        <div style={{ textAlign: "center" }}>
          <Ticket size={42} color={C.ink} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontFamily: displayFont, fontSize: 24, fontWeight: 700, color: C.ink }}>Hall Pass</div>
          <div style={{ marginTop: 6, color: C.inkSoft, fontSize: 13 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div style={{ minHeight: "100vh", background: `${OMR_BG}, ${C.bg}`, backgroundSize: "18px 18px, auto", fontFamily: bodyFont, padding: "clamp(18px, 5vw, 28px) clamp(12px, 4vw, 16px) 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        button, input, select, textarea { font: inherit; }
        input:focus, textarea:focus, button:focus-visible, select:focus { outline: 2px solid ${C.ink}; outline-offset: 2px; }
        .hp-eligibility-row { display: flex; gap: 8px; }
        .hp-eligibility-label { min-width: 84px; flex-shrink: 0; }
        .hp-card { transition: transform .15s, box-shadow .15s; }
        .hp-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(20,33,61,0.1); }
        @media (max-width: 460px) { .hp-eligibility-row { flex-direction: column; gap: 1px; } .hp-eligibility-label { min-width: 0; } }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <HeroPass trackedCount={starred.size} exams={EXAMS} />

        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12.5, color: C.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Signed in as <strong style={{ color: C.ink }}>{user.email}</strong>
          </div>
          <button onClick={() => signOut(auth)} style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "#fff", background: C.red, border: "none", borderRadius: 7, padding: "6px 11px", cursor: "pointer" }}>
            Logout
          </button>
        </div>

        {view === "detail" && selectedExam ? (
          <ExamDetail
            exam={selectedExam}
            starred={starred.has(selectedExam.id)}
            onToggleStar={toggleStar}
            user={user}
            onBack={() => { setView("home"); setSelectedId(null); }}
          />
        ) : (
          <>
            {starLoaded && starredExams.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>★ Your starred exams</div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                  {starredExams.map((exam) => {
                    const dl = daysLeft(exam.examDate);
                    return (
                      <button key={exam.id} onClick={() => { setSelectedId(exam.id); setView("detail"); }} style={{ flexShrink: 0, fontSize: 12.5, color: C.ink, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        {exam.shortName}
                        <span style={{ fontFamily: monoFont, color: dl <= 14 ? C.red : C.green, fontWeight: 600 }}>{dl}d</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
              <Search size={16} color={C.inkSoft} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exams — UPSC, SSC, JEE…" style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink, width: "100%" }} />
              {query && <button onClick={() => setQuery("")} style={{ border: "none", background: "transparent", color: C.inkSoft, cursor: "pointer", fontSize: 12 }}>Clear</button>}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {categories.map((item) => (
                <button key={item} onClick={() => setCategory(item)} style={{ flexShrink: 0, fontSize: 12.5, fontWeight: category === item ? 600 : 400, color: category === item ? "#fff" : C.inkSoft, background: category === item ? C.ink : C.surface, border: `1px solid ${category === item ? C.ink : C.line}`, borderRadius: 20, padding: "6px 13px", cursor: "pointer" }}>
                  {item}
                </button>
              ))}
            </div>

            {/* Notes */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={20} color={C.ink} />
                    <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 20, color: C.ink }}>My Notes</h2>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: C.inkSoft }}>Create, pin, link to exams & export.</div>
                </div>
                <button onClick={() => { setShowNotes(!showNotes); if (showNotes) { setEditingNote(null); setNoteTitle(""); setNoteContent(""); setNoteTags(""); setNoteExamId(""); setNotePinned(false); } }} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8, background: C.ink, color: "#fff", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <FileText size={15} /> {showNotes ? "Close" : "Open Notes"}
                </button>
              </div>

              {showNotes && (
                <>
                  {notesError && <div style={{ background: C.softRed, color: C.red, borderRadius: 9, padding: "9px 11px", marginBottom: 14, fontSize: 12.5 }}>{notesError}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 10px", marginBottom: 14 }}>
                    <Search size={15} color={C.inkSoft} />
                    <input value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} placeholder="Search notes..." style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 13, color: C.ink }} />
                  </div>

                  <div style={{ background: C.softBlue, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>{editingNote ? "Edit Note" : "Create a Note"}</div>
                    <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title" style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 8, background: "#fff" }} />
                    <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write notes... (Markdown supported)" rows={5} style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, resize: "vertical", background: "#fff", marginBottom: 8 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <select value={noteExamId} onChange={(e) => setNoteExamId(e.target.value)} style={{ padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, background: "#fff" }}>
                        <option value="">No exam linked</option>
                        {EXAMS.map((e) => <option key={e.id} value={e.id}>{e.shortName}</option>)}
                      </select>
                      <input value={noteTags} onChange={(e) => setNoteTags(e.target.value)} placeholder="Tags: GATE, Maths" style={{ padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, background: "#fff" }} />
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer", fontSize: 13 }}>
                      <input type="checkbox" checked={notePinned} onChange={(e) => setNotePinned(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.ink }} />
                      Pin this note
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveNote} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8, background: C.green, color: "#fff", padding: "8px 13px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        <Save size={15} /> {editingNote ? "Update" : "Save Note"}
                      </button>
                      {editingNote && (
                        <button onClick={() => { setEditingNote(null); setNoteTitle(""); setNoteContent(""); setNoteTags(""); setNoteExamId(""); setNotePinned(false); }} style={{ border: `1px solid ${C.line}`, borderRadius: 8, background: "#fff", padding: "8px 13px", cursor: "pointer", fontSize: 12 }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
                    {filteredNotes.length} {filteredNotes.length === 1 ? "NOTE" : "NOTES"}
                  </div>

                  {notesLoading ? (
                    <div style={{ textAlign: "center", padding: 25, color: C.inkSoft, fontSize: 13 }}>Loading notes...</div>
                  ) : filteredNotes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 25, border: `1px dashed ${C.line}`, borderRadius: 10, color: C.inkSoft, fontSize: 13 }}>
                      <BookOpen size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>No notes yet</div>
                      <div>Create your first note above.</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {filteredNotes.map((note) => {
                        const linked = EXAMS.find((e) => e.id === note.examId);
                        return (
                          <div key={note.id} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 13, background: note.pinned ? C.softYellow : "#fff" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                  {note.pinned && <Pin size={14} color={C.yellow} fill={C.yellow} />}
                                  <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, color: C.ink }}>{note.title || "Untitled"}</div>
                                </div>
                                {linked && <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginBottom: 6 }}>{linked.shortName}</div>}
                                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.inkSoft }}>
                                  <ReactMarkdown>{note.content || ""}</ReactMarkdown>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <button onClick={() => startEditingNote(note)} style={{ border: `1px solid ${C.line}`, background: C.bg, borderRadius: 7, padding: "6px 8px", cursor: "pointer", fontSize: 12 }}>Edit</button>
                                <button onClick={() => deleteNote(note.id)} style={{ border: "none", background: C.softRed, borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: C.red, fontSize: 12 }}>Delete</button>
                              </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {note.tags?.map((t) => <span key={t} style={{ background: C.softYellow, borderRadius: 20, padding: "3px 8px", fontFamily: monoFont, fontSize: 9 }}>#{t}</span>)}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => exportNoteAsTxt(note)} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${C.line}`, background: "#fff", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>
                                  <Download size={12} /> TXT
                                </button>
                                <button onClick={() => exportNoteAsPdf(note)} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${C.line}`, background: "#fff", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>
                                  <FileDown size={12} /> PDF
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            <CloudFiles user={user} />

            <div style={{ fontFamily: monoFont, fontSize: 10.5, color: C.inkSoft, marginBottom: 10, textTransform: "uppercase" }}>
              {filtered.length} {filtered.length === 1 ? "exam" : "exams"} found
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, textAlign: "center", padding: "40px 20px", color: C.inkSoft, fontSize: 13.5 }}>
                <Search size={30} style={{ marginBottom: 10, opacity: 0.45 }} />
                <div style={{ fontWeight: 600, color: C.ink, marginBottom: 5 }}>No exams found</div>
                <div>Try a different search or category.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
                {filtered.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} starred={starred.has(exam.id)} onToggleStar={toggleStar} onOpen={(id) => { setSelectedId(id); setView("detail"); }} />
                ))}
              </div>
            )}

            <div style={{ fontSize: 11.5, color: C.inkSoft, textAlign: "center", marginTop: 28, lineHeight: 1.5 }}>
              Sample exams shown for demo purposes.<br />
              Connect a live exam feed to replace them with real dates.
            </div>
          </>
        )}
      </div>
    </div>
  );
}