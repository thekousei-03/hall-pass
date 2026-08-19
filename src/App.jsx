import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Star, ExternalLink, ChevronLeft, FileText, BookOpen,
  Ticket, Save, Archive, ChevronDown, ShieldCheck, Download,
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS — "Hall Pass": the admit card, taken seriously
--------------------------------------------------------- */
const C = {
  bg: "#F2F3F6",
  dot: "#E1E4EA",
  surface: "#FFFFFF",
  paper: "#FFFDF6",
  ink: "#14213D",
  inkSoft: "#5B6478",
  line: "#D8DCE3",
  lineSoft: "#E7E9ED",
  green: "#2F6F4F",
  greenSoft: "#E6F0EA",
  red: "#C1443D",
  redSoft: "#F7E9E8",
  amber: "#B4791F",
  amberSoft: "#F5EBDC",
};

const displayFont = "'Space Grotesk', 'Archivo', sans-serif";
const bodyFont = "'IBM Plex Sans', 'Inter', sans-serif";
const monoFont = "'IBM Plex Mono', 'Roboto Mono', monospace";

const OMR_BG = `radial-gradient(${C.dot} 1px, transparent 1.6px)`;

/* ---------------------------------------------------------
   SAMPLE DATA — dates follow typical annual cycles, not
   confirmed/live figures. Verify on the official site.
--------------------------------------------------------- */
const EXAMS = [
  {
    id: "upsc-cse",
    name: "Civil Services Examination",
    shortName: "UPSC CSE",
    org: "Union Public Service Commission",
    category: "Civil Services",
    site: "upsc.gov.in",
    applyBy: "2027-02-11",
    examDate: "2027-05-30",
    dateStatus: "expected",
    lastVerifiedAt: "2026-08-01",
    dateBasis: "Typical cycle: notification Feb, Prelims last Sun of May",
    pattern: "Prelims (2 papers, objective) → Mains (9 papers, descriptive) → Interview",
    eligibility: {
      qualification: "Bachelor's degree from a recognised university (any stream)",
      age: "21–32 years (general category)",
      attempts: "6 attempts (general category)",
    },
    accent: C.green,
  },
  {
    id: "ssc-cgl",
    name: "Combined Graduate Level",
    shortName: "SSC CGL",
    org: "Staff Selection Commission",
    category: "Government Jobs",
    site: "ssc.nic.in",
    applyBy: "2026-07-24",
    examDate: "2026-09-12",
    dateStatus: "official",
    lastVerifiedAt: "2026-07-02",
    dateBasis: "Typical cycle: notification Jun–Jul, Tier I in September",
    pattern: "Tier I (objective, 4 sections) → Tier II (2 papers)",
    eligibility: {
      qualification: "Bachelor's degree; some posts need a specific stream",
      age: "18–32 years (varies by post)",
      attempts: "No fixed attempt limit — bound by age limit instead",
    },
    accent: C.amber,
  },
  {
    id: "jee-main",
    name: "Joint Entrance Examination — Main",
    shortName: "JEE Main",
    org: "National Testing Agency",
    category: "Engineering",
    site: "jeemain.nta.nic.in",
    applyBy: "2026-11-30",
    examDate: "2027-01-24",
    dateStatus: "expected",
    lastVerifiedAt: "2026-07-20",
    dateBasis: "Typical cycle: Session 1 in January, Session 2 in April",
    pattern: "Physics, Chemistry, Maths — 90 questions, objective + numeric",
    eligibility: {
      qualification: "Passed 10+2 with Physics, Chemistry and Maths",
      age: "No strict upper age limit currently",
      attempts: "2 sessions per year, generally across 3 consecutive years",
    },
    accent: C.ink,
  },
  {
    id: "neet-ug",
    name: "National Eligibility cum Entrance Test",
    shortName: "NEET UG",
    org: "National Testing Agency",
    category: "Medical",
    site: "neet.nta.nic.in",
    applyBy: "2027-03-07",
    examDate: "2027-05-02",
    dateStatus: "unannounced",
    lastVerifiedAt: "2026-06-15",
    dateBasis: "Typical cycle: notification Mar, exam first Sun of May",
    pattern: "Physics, Chemistry, Biology — 180 questions, objective",
    eligibility: {
      qualification: "Passed 10+2 with Physics, Chemistry and Biology",
      age: "Minimum 17 years by year of admission",
      attempts: "No official cap on number of attempts",
    },
    accent: C.red,
  },
  {
    id: "cat",
    name: "Common Admission Test",
    shortName: "CAT",
    org: "IIMs",
    category: "Management",
    site: "iimcat.ac.in",
    applyBy: "2026-09-18",
    examDate: "2026-11-29",
    dateStatus: "expected",
    lastVerifiedAt: "2026-08-05",
    dateBasis: "Typical cycle: registration Aug–Sep, exam last Sun of Nov",
    pattern: "VARC, DILR, Quant — 66 questions, computer-based",
    eligibility: {
      qualification: "Bachelor's degree, min. 50% marks (45% reserved categories); final-year students can apply",
      age: "No age limit",
      attempts: "No cap — can attempt every year",
    },
    accent: C.green,
  },
  {
    id: "ibps-po",
    name: "Probationary Officer",
    shortName: "IBPS PO",
    org: "Institute of Banking Personnel Selection",
    category: "Banking",
    site: "ibps.in",
    applyBy: "2026-09-01",
    examDate: "2026-10-11",
    dateStatus: "expected",
    lastVerifiedAt: "2026-07-28",
    dateBasis: "Typical cycle: notification Aug, Prelims in October",
    pattern: "Prelims (objective) → Mains (objective + descriptive) → Interview",
    eligibility: {
      qualification: "Bachelor's degree from a recognised university (any stream)",
      age: "20–30 years (general category)",
      attempts: "No fixed attempt limit — bound by age limit instead",
    },
    accent: C.amber,
  },
];

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */
function daysLeft(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function useCountdown(dateStr) {
  const [t, setT] = useState(() => new Date(dateStr).getTime() - Date.now());
  useEffect(() => {
    const iv = setInterval(() => setT(new Date(dateStr).getTime() - Date.now()), 1000);
    return () => clearInterval(iv);
  }, [dateStr]);
  const clamped = Math.max(0, t);
  return {
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped % 86400000) / 3600000),
    mins: Math.floor((clamped % 3600000) / 60000),
    secs: Math.floor((clamped % 60000) / 1000),
    isPast: t <= 0,
  };
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTimestamp(ts) {
  return new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function lastNYears(n) {
  const y = new Date().getFullYear();
  return Array.from({ length: n }, (_, i) => y - 1 - i);
}

/* ---------------------------------------------------------
   APPLICATION-WINDOW STATUS
   Distinct from the exam-date countdown: this tells the user
   whether they can act on the *application* right now.
--------------------------------------------------------- */
const DEADLINE_STATUS = {
  open: { label: "Open", color: C.green, bg: C.greenSoft },
  "closing-soon": { label: "Closing soon", color: C.red, bg: C.redSoft },
  closed: { label: "Closed", color: C.inkSoft, bg: C.lineSoft },
  upcoming: { label: "Not open yet", color: C.amber, bg: C.amberSoft },
  unannounced: { label: "Date unannounced", color: C.inkSoft, bg: C.lineSoft },
};
function getDeadlineStatus(exam) {
  if (exam.dateStatus === "unannounced") return "unannounced";
  const daysToApply = Math.ceil((new Date(exam.applyBy).getTime() - Date.now()) / 86400000);
  if (daysToApply < 0) return "closed";
  if (daysToApply <= 7) return "closing-soon";
  return "open";
}

/* ---------------------------------------------------------
   DATE-CONFIDENCE — is this an official date or a projection?
--------------------------------------------------------- */
const DATE_CONFIDENCE = {
  official: { label: "Official date", color: C.green },
  expected: { label: "Expected · based on previous cycle", color: C.amber },
  unannounced: { label: "Not yet announced", color: C.inkSoft },
};
function verificationAgeDays(lastVerifiedAt) {
  return Math.floor((Date.now() - new Date(lastVerifiedAt).getTime()) / 86400000);
}

/* ---------------------------------------------------------
   BARCODE — decorative, deterministic per exam id
--------------------------------------------------------- */
function seededWidths(seed, count) {
  let x = 0;
  for (let i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) % 997;
  const out = [];
  for (let i = 0; i < count; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    out.push(1 + (x % 3));
  }
  return out;
}
function Barcode({ seed, color }) {
  const widths = seededWidths(seed, 34);
  return (
    <div className="flex items-end gap-[1.5px]" style={{ height: 22, opacity: 0.55 }}>
      {widths.map((w, i) => (
        <div key={i} style={{ width: w, height: i % 7 === 0 ? 22 : 14, background: color }} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   SMALL UI ATOMS
--------------------------------------------------------- */
function Perforation() {
  return (
    <div style={{ position: "relative", height: 1 }}>
      <div style={{ position: "absolute", left: -9, top: -9, width: 18, height: 18, borderRadius: "50%", background: C.bg, border: `1px solid ${C.line}` }} />
      <div style={{ position: "absolute", right: -9, top: -9, width: 18, height: 18, borderRadius: "50%", background: C.bg, border: `1px solid ${C.line}` }} />
      <div style={{ borderTop: `1.5px dashed ${C.line}`, margin: "0 10px" }} />
    </div>
  );
}

function CategoryBadge({ label, accent }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded"
      style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: 0.4, color: accent, background: "#fff", border: `1px solid ${accent}40`, textTransform: "uppercase" }}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }) {
  const meta = DEADLINE_STATUS[status] || DEADLINE_STATUS.open;
  return (
    <span
      className="inline-flex items-center"
      style={{
        fontFamily: monoFont, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
        color: meta.color, background: meta.bg, borderRadius: 20, padding: "3px 9px",
        textTransform: "uppercase",
      }}
    >
      {meta.label}
    </span>
  );
}

function VerifiedLine({ exam }) {
  const conf = DATE_CONFIDENCE[exam.dateStatus] || DATE_CONFIDENCE.expected;
  const age = verificationAgeDays(exam.lastVerifiedAt);
  return (
    <div style={{ fontFamily: bodyFont, fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
      <span style={{ color: conf.color, fontWeight: 600 }}>{conf.label}</span>
      {" · "}
      {age <= 45 ? `checked ${age === 0 ? "today" : `${age}d ago`}` : (
        <span style={{ color: C.red, fontWeight: 600 }}>not checked in {age}d — please verify</span>
      )}
      {" · "}
      <span>Always confirm on {exam.site} before applying.</span>
    </div>
  );
}

function DigitBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          position: "relative",
          fontFamily: monoFont,
          fontSize: "clamp(22px, 6.5vw, 32px)",
          fontWeight: 700,
          color: C.ink,
          background: `linear-gradient(${C.surface} 0 49%, ${C.bg} 51% 100%)`,
          border: `1px solid ${C.line}`,
          borderRadius: 8,
          padding: "clamp(6px, 2vw, 9px) clamp(8px, 3vw, 13px)",
          minWidth: "clamp(44px, 13vw, 62px)",
          textAlign: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: C.line }} />
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: 1, color: C.inkSoft, marginTop: 6, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   EXAM CARD — die-cut ticket stub with colored spine + barcode
--------------------------------------------------------- */
const TICKET_CLIP = "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)";

function ExamCard({ exam, starred, onToggleStar, onOpen }) {
  const dl = daysLeft(exam.examDate);
  const deadlineStatus = getDeadlineStatus(exam);
  return (
    <div
      className="cursor-pointer relative hp-card"
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 2px 6px rgba(20,33,61,0.06)",
        clipPath: TICKET_CLIP,
        paddingLeft: 10,
      }}
      onClick={() => onOpen(exam.id)}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: exam.accent }} />

      <div className="p-4 pb-3" style={{ paddingLeft: 14 }}>
        <div className="flex items-start justify-between">
          <div>
            <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 19, color: C.ink, letterSpacing: -0.2 }}>
              {exam.shortName}
            </div>
            <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>
              {exam.org}
            </div>
          </div>
          {starred && (
            <span title="Tracked" style={{ padding: 4 }}>
              <Star size={18} color={C.amber} fill={C.amber} strokeWidth={1.75} />
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <CategoryBadge label={exam.category} accent={exam.accent} />
          <StatusPill status={deadlineStatus} />
        </div>
      </div>

      <Perforation />

      <div className="px-4 py-3" style={{ paddingLeft: 14 }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, textTransform: "uppercase" }}>Exam date</div>
            <div style={{ fontFamily: monoFont, fontSize: 13, color: C.ink, fontWeight: 600 }}>
              {exam.dateStatus === "unannounced" ? "TBA" : fmtDate(exam.examDate)}
            </div>
          </div>
          <div className="text-right" style={{ fontFamily: monoFont, color: dl <= 14 ? C.red : C.green }}>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{exam.dateStatus === "unannounced" ? "—" : dl}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>days left</div>
          </div>
        </div>

        <div className="mt-2.5"><VerifiedLine exam={exam} /></div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(exam.id); }}
          className="mt-3 w-full flex items-center justify-center gap-2"
          style={{
            fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600,
            color: starred ? C.green : "#fff",
            background: starred ? C.greenSoft : C.ink,
            border: `1px solid ${starred ? C.green : C.ink}`,
            borderRadius: 8, padding: "8px 10px", cursor: "pointer",
          }}
        >
          <Star size={13} fill={starred ? C.amber : "none"} color={starred ? C.amber : "#fff"} />
          {starred ? "Tracked — reminder set" : "Track this exam"}
        </button>

        <div className="mt-2.5"><Barcode seed={exam.id} color={C.ink} /></div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   NOTES — multi-entry, tagged, persisted
--------------------------------------------------------- */
const NOTE_TAGS = [
  { id: "topic", label: "Topic", color: C.green },
  { id: "weak", label: "Weak area", color: C.red },
  { id: "plan", label: "Revision plan", color: C.amber },
  { id: "link", label: "Resource", color: C.ink },
];
function tagMeta(id) { return NOTE_TAGS.find((t) => t.id === id) || NOTE_TAGS[0]; }

function NotesPanel({ examId }) {
  const [notes, setNotes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftTag, setDraftTag] = useState("topic");
  const [status, setStatus] = useState("idle");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setDraft("");
    (async () => {
      try {
        const res = await window.storage.get(`notes-list:${examId}`, false);
        const parsed = res && res.value ? JSON.parse(res.value) : [];
        if (!cancelled) setNotes(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        if (!cancelled) setNotes([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [examId]);

  const persist = useCallback((list) => {
    setStatus("saving");
    window.storage.set(`notes-list:${examId}`, JSON.stringify(list), false)
      .then((r) => setStatus(r ? "saved" : "error"))
      .catch(() => setStatus("error"));
  }, [examId]);

  const addNote = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = [{ id: `${Date.now()}`, text: trimmed, tag: draftTag, createdAt: Date.now() }, ...notes];
    setNotes(next);
    setDraft("");
    persist(next);
  };
  const deleteNote = (id) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    persist(next);
  };

  return (
    <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={15} color={C.inkSoft} />
          <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.ink }}>Your notes</span>
        </div>
        <span style={{ fontFamily: monoFont, fontSize: 11, color: status === "error" ? C.red : C.inkSoft }}>
          {status === "saving" && "saving…"}
          {status === "saved" && "saved"}
          {status === "error" && "couldn't save"}
        </span>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!loaded}
          placeholder="Add a note — a weak topic, a revision reminder, a link to save…"
          style={{ width: "100%", minHeight: 60, resize: "vertical", fontFamily: bodyFont, fontSize: 13.5, color: C.ink, background: "transparent", border: "none", outline: "none", lineHeight: 1.5 }}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1.5 flex-wrap">
            {NOTE_TAGS.map((t) => (
              <button key={t.id} onClick={() => setDraftTag(t.id)}
                style={{ fontFamily: monoFont, fontSize: 10.5, color: draftTag === t.id ? "#fff" : t.color, background: draftTag === t.id ? t.color : "#fff", border: `1px solid ${t.color}55`, borderRadius: 12, padding: "3px 9px", cursor: "pointer", textTransform: "uppercase" }}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={addNote} disabled={!draft.trim()}
            style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600, color: "#fff", background: draft.trim() ? C.ink : C.line, border: "none", borderRadius: 7, padding: "6px 12px", cursor: draft.trim() ? "pointer" : "default", flexShrink: 0 }}>
            <Save size={13} /> Save
          </button>
        </div>
      </div>

      {loaded && notes.length === 0 && (
        <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, marginTop: 12, textAlign: "center" }}>
          No notes yet for this exam.
        </div>
      )}

      {loaded && notes.length > 0 && (
        <div className="flex items-center gap-2 mt-3" style={{ background: C.surface, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "6px 10px" }}>
          <Search size={13} color={C.inkSoft} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes…"
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: bodyFont, fontSize: 12.5, color: C.ink, width: "100%" }}
          />
        </div>
      )}

      <div className="mt-3 space-y-2">
        {(() => {
          const q = search.trim().toLowerCase();
          const filteredNotes = q
            ? notes.filter((n) => n.text.toLowerCase().includes(q) || tagMeta(n.tag).label.toLowerCase().includes(q))
            : notes;
          if (q && filteredNotes.length === 0) {
            return (
              <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, textAlign: "center", padding: "8px 0" }}>
                No notes match "{search}".
              </div>
            );
          }
          return filteredNotes.map((n) => {
          const tm = tagMeta(n.tag);
          return (
            <div key={n.id} style={{ background: C.surface, border: `1px solid ${C.lineSoft}`, borderRadius: 9, padding: "9px 11px" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: monoFont, fontSize: 10, color: tm.color, background: `${tm.color}14`, border: `1px solid ${tm.color}33`, borderRadius: 10, padding: "2px 7px", textTransform: "uppercase" }}>
                    {tm.label}
                  </span>
                  <span style={{ fontFamily: monoFont, fontSize: 10.5, color: C.inkSoft }}>{fmtTimestamp(n.createdAt)}</span>
                </div>
                <button onClick={() => deleteNote(n.id)} aria-label="Delete note" className="hp-tap"
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, fontSize: 11, fontFamily: bodyFont }}>
                  Delete
                </button>
              </div>
              <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.ink, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{n.text}</div>
            </div>
          );
          });
        })()}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PYQ ARCHIVE — paste past-year questions by year
--------------------------------------------------------- */
function PYQPanel({ examId }) {
  const years = lastNYears(5);
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [year, setYear] = useState(years[0]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("idle");
  const [openYear, setOpenYear] = useState(years[0]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setDraft("");
    setYear(years[0]);
    setOpenYear(years[0]);
    (async () => {
      try {
        const res = await window.storage.get(`pyqs:${examId}`, false);
        const parsed = res && res.value ? JSON.parse(res.value) : [];
        if (!cancelled) setEntries(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const persist = useCallback((list) => {
    setStatus("saving");
    window.storage.set(`pyqs:${examId}`, JSON.stringify(list), false)
      .then((r) => setStatus(r ? "saved" : "error"))
      .catch(() => setStatus("error"));
  }, [examId]);

  const addEntry = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = [{ id: `${Date.now()}`, year, text: trimmed, createdAt: Date.now() }, ...entries];
    setEntries(next);
    setDraft("");
    persist(next);
  };
  const deleteEntry = (id) => {
    const next = entries.filter((n) => n.id !== id);
    setEntries(next);
    persist(next);
  };

  return (
    <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Archive size={15} color={C.inkSoft} />
          <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.ink }}>
            Previous year questions
          </span>
        </div>
        <span style={{ fontFamily: monoFont, fontSize: 11, color: status === "error" ? C.red : C.inkSoft }}>
          {status === "saving" && "saving…"}
          {status === "saved" && "saved"}
          {status === "error" && "couldn't save"}
        </span>
      </div>
      <div style={{ fontFamily: bodyFont, fontSize: 12, color: C.inkSoft, marginBottom: 10 }}>
        Paste a question from a past paper, tag it with the year it appeared, and build your own archive over time.
      </div>

      {/* Composer */}
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10 }}>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)}
              style={{ fontFamily: monoFont, fontSize: 11.5, fontWeight: 600, color: year === y ? "#fff" : C.ink, background: year === y ? C.ink : "#fff", border: `1px solid ${C.ink}44`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
              {y}
            </button>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!loaded}
          placeholder={`Paste a ${year} question here — full text, options if it's objective, marking scheme if you have it…`}
          style={{ width: "100%", minHeight: 80, resize: "vertical", fontFamily: bodyFont, fontSize: 13.5, color: C.ink, background: "transparent", border: "none", outline: "none", lineHeight: 1.55 }}
        />
        <div className="flex justify-end mt-2">
          <button onClick={addEntry} disabled={!draft.trim()}
            style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600, color: "#fff", background: draft.trim() ? C.ink : C.line, border: "none", borderRadius: 7, padding: "6px 12px", cursor: draft.trim() ? "pointer" : "default" }}>
            <Save size={13} /> Add to archive
          </button>
        </div>
      </div>

      {/* Archive grouped by year */}
      {loaded && entries.length === 0 && (
        <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, marginTop: 14, textAlign: "center" }}>
          No past questions saved yet — start with the most recent paper you have.
        </div>
      )}

      {loaded && entries.length > 0 && (
        <div className="flex items-center gap-2 mt-4" style={{ background: C.surface, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "6px 10px" }}>
          <Search size={13} color={C.inkSoft} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved questions…"
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: bodyFont, fontSize: 12.5, color: C.ink, width: "100%" }}
          />
        </div>
      )}

      <div className="mt-3 space-y-2">
        {(() => {
          const q = search.trim().toLowerCase();
          const filteredEntries = q ? entries.filter((e) => e.text.toLowerCase().includes(q)) : entries;
          if (q && filteredEntries.length === 0) {
            return (
              <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, textAlign: "center", padding: "8px 0" }}>
                No saved questions match "{search}".
              </div>
            );
          }
          return years.map((y) => {
            const items = filteredEntries.filter((e) => e.year === y);
            if (items.length === 0) return null;
            const isOpen = q ? true : openYear === y;
            return (
              <div key={y} style={{ border: `1px solid ${C.lineSoft}`, borderRadius: 9, overflow: "hidden" }}>
                <button
                  onClick={() => !q && setOpenYear(isOpen ? null : y)}
                  className="w-full flex items-center justify-between hp-tap"
                  style={{ background: C.surface, border: "none", padding: "9px 12px", cursor: q ? "default" : "pointer" }}
                >
                  <span style={{ fontFamily: monoFont, fontSize: 12.5, fontWeight: 700, color: C.ink }}>
                    {y} <span style={{ color: C.inkSoft, fontWeight: 400 }}>· {items.length} saved</span>
                  </span>
                  {!q && <ChevronDown size={15} color={C.inkSoft} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />}
                </button>
                {isOpen && (
                  <div style={{ padding: "0 12px 10px" }}>
                    {items.map((n) => (
                      <div key={n.id} style={{ background: C.paper, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "8px 10px", marginTop: 8 }}>
                        <div className="flex justify-end mb-1">
                          <button onClick={() => deleteEntry(n.id)} aria-label="Delete question" className="hp-tap"
                            style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, fontSize: 11, fontFamily: bodyFont }}>
                            Delete
                          </button>
                        </div>
                        <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.ink, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   EXAM DETAIL
--------------------------------------------------------- */
function ExamDetail({ exam, starred, onToggleStar, onBack }) {
  const cd = useCountdown(exam.examDate);
  const deadlineStatus = getDeadlineStatus(exam);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4"
        style={{ fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, background: "none", border: "none", cursor: "pointer" }}>
        <ChevronLeft size={16} /> All exams
      </button>

      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, background: exam.accent }} />

        <div className="p-5 flex items-start justify-between" style={{ paddingLeft: 22 }}>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryBadge label={exam.category} accent={exam.accent} />
              <StatusPill status={deadlineStatus} />
            </div>
            <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 27, color: C.ink, marginTop: 8, letterSpacing: -0.3 }}>
              {exam.shortName}
            </div>
            <div style={{ fontFamily: bodyFont, fontSize: 13.5, color: C.inkSoft, marginTop: 2 }}>
              {exam.name} · {exam.org}
            </div>
          </div>
        </div>

        <div className="px-5 pb-2" style={{ paddingLeft: 22 }}>
          <button
            onClick={() => onToggleStar(exam.id)}
            className="flex items-center justify-center gap-2"
            style={{
              fontFamily: bodyFont, fontSize: 13, fontWeight: 600,
              color: starred ? C.green : "#fff",
              background: starred ? C.greenSoft : C.ink,
              border: `1px solid ${starred ? C.green : C.ink}`,
              borderRadius: 8, padding: "9px 14px", cursor: "pointer", width: "100%",
            }}
          >
            <Star size={14} fill={starred ? C.amber : "none"} color={starred ? C.amber : "#fff"} />
            {starred ? "Tracked — reminder set for opening and closing" : "Track this exam"}
          </button>
        </div>

        <Perforation />

        <div className="p-5" style={{ paddingLeft: 22 }}>
          {exam.dateStatus === "unannounced" ? (
            <div style={{ textAlign: "center", padding: "14px 0", fontFamily: bodyFont, fontSize: 13, color: C.inkSoft }}>
              The official date hasn't been announced yet. The dates below are typical-cycle estimates only —
              check {exam.site} for the notification.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center py-2 hp-countdown-row" style={{ gap: 12, flexWrap: "wrap" }}>
                <DigitBlock value={cd.days} label="days" />
                <span style={{ color: C.line, fontSize: 22, fontFamily: monoFont }}>:</span>
                <DigitBlock value={cd.hours} label="hrs" />
                <span style={{ color: C.line, fontSize: 22, fontFamily: monoFont }}>:</span>
                <DigitBlock value={cd.mins} label="min" />
                <span style={{ color: C.line, fontSize: 22, fontFamily: monoFont }}>:</span>
                <DigitBlock value={cd.secs} label="sec" />
              </div>
              {cd.isPast && (
                <div style={{ textAlign: "center", color: C.red, fontFamily: bodyFont, fontSize: 12, marginTop: 4 }}>
                  This exam date has passed — check the official site for updates.
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div style={{ background: C.bg, borderRadius: 10, padding: 12 }}>
              <div style={{ fontFamily: monoFont, fontSize: 10.5, color: C.inkSoft, textTransform: "uppercase" }}>Apply by</div>
              <div style={{ fontFamily: monoFont, fontSize: 14, color: C.ink, fontWeight: 600, marginTop: 3 }}>{fmtDate(exam.applyBy)}</div>
            </div>
            <div style={{ background: C.bg, borderRadius: 10, padding: 12 }}>
              <div style={{ fontFamily: monoFont, fontSize: 10.5, color: C.inkSoft, textTransform: "uppercase" }}>Exam date</div>
              <div style={{ fontFamily: monoFont, fontSize: 14, color: C.ink, fontWeight: 600, marginTop: 3 }}>{fmtDate(exam.examDate)}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}><VerifiedLine exam={exam} /></div>
          <div style={{ fontFamily: bodyFont, fontSize: 11.5, color: C.inkSoft, marginTop: 4, fontStyle: "italic" }}>
            {exam.dateBasis}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BookOpen size={14} color={C.inkSoft} />
              <span style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600, color: C.ink }}>Exam pattern</span>
            </div>
            <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{exam.pattern}</div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldCheck size={14} color={C.inkSoft} />
              <span style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600, color: C.ink }}>Eligibility</span>
            </div>
            <div className="space-y-1.5">
              <div className="hp-eligibility-row" style={{ fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                <span className="hp-eligibility-label" style={{ fontFamily: monoFont, fontSize: 11, color: C.ink, textTransform: "uppercase", paddingTop: 1 }}>Qualification</span>
                <span>{exam.eligibility.qualification}</span>
              </div>
              <div className="hp-eligibility-row" style={{ fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                <span className="hp-eligibility-label" style={{ fontFamily: monoFont, fontSize: 11, color: C.ink, textTransform: "uppercase", paddingTop: 1 }}>Age</span>
                <span>{exam.eligibility.age}</span>
              </div>
              <div className="hp-eligibility-row" style={{ fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                <span className="hp-eligibility-label" style={{ fontFamily: monoFont, fontSize: 11, color: C.ink, textTransform: "uppercase", paddingTop: 1 }}>Attempts</span>
                <span>{exam.eligibility.attempts}</span>
              </div>
            </div>
            <div style={{ fontFamily: bodyFont, fontSize: 11, color: C.inkSoft, marginTop: 6, fontStyle: "italic" }}>
              General criteria shown — reserved categories (SC/ST/OBC/PwD/EWS) get age and attempt relaxations. Confirm exact figures on the official notification.
            </div>
          </div>

          <a
            href={`https://${exam.site}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between mt-4"
            style={{
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: "10px 12px",
              textDecoration: "none",
            }}
          >
            <div className="flex items-center gap-2">
              <Download size={15} color={C.ink} />
              <div>
                <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.ink }}>
                  Get official past papers
                </div>
                <div style={{ fontFamily: bodyFont, fontSize: 11.5, color: C.inkSoft }}>
                  Opens {exam.site} — look for "Previous Papers" or "PYQ"
                </div>
              </div>
            </div>
            <ExternalLink size={14} color={C.inkSoft} />
          </a>

          <div className="flex items-center gap-1.5 mt-3" style={{ fontFamily: monoFont, fontSize: 12.5, color: C.inkSoft }}>
            <ExternalLink size={13} />
            {exam.site} <span style={{ color: C.line }}>(verify before applying)</span>
          </div>

          <div className="mt-3"><Barcode seed={exam.id} color={C.inkSoft} /></div>

          <div className="mt-5"><PYQPanel examId={exam.id} /></div>
          <div className="mt-4"><NotesPanel examId={exam.id} /></div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HERO PASS — the app's own header, styled as the admit
   card it's named after. This is the one signature moment;
   everything else in the UI stays quiet around it.
--------------------------------------------------------- */
function HeroPass({ trackedCount }) {
  const today = new Date();
  const passNo = `HP-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  return (
    <div
      style={{
        position: "relative",
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 22,
        boxShadow: "0 3px 10px rgba(20,33,61,0.07)",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, background: C.ink }} />
      <div className="flex items-start justify-between" style={{ padding: "16px 18px 12px", paddingLeft: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div className="flex items-center gap-2">
            <Ticket size={22} color={C.ink} strokeWidth={1.75} />
            <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 23, color: C.ink, letterSpacing: -0.4 }}>Hall Pass</span>
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, marginTop: 4, maxWidth: 380 }}>
            Every competitive exam you're tracking — dates, pattern, notes, and past papers — in one place.
          </div>
        </div>
        <div style={{ textAlign: "right", fontFamily: monoFont }}>
          <div style={{ fontSize: 10, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.6 }}>Pass no.</div>
          <div style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>{passNo}</div>
        </div>
      </div>

      <Perforation />

      <div className="flex items-center justify-between" style={{ padding: "10px 18px", paddingLeft: 24, flexWrap: "wrap", gap: 8 }}>
        <Barcode seed={passNo} color={C.inkSoft} />
        <div style={{ fontFamily: monoFont, fontSize: 11.5, color: C.inkSoft, whiteSpace: "nowrap" }}>
          {trackedCount > 0 ? (
            <>TRACKING <span style={{ color: C.ink, fontWeight: 700 }}>{trackedCount}</span> {trackedCount === 1 ? "EXAM" : "EXAMS"}</>
          ) : (
            <>NOT TRACKING ANY EXAMS YET</>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   APP
--------------------------------------------------------- */
export default function App() {
  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [starred, setStarred] = useState(new Set());
  const [starLoaded, setStarLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("starred", false);
        if (res && res.value) setStarred(new Set(JSON.parse(res.value)));
      } catch (e) {
        // no starred exams yet
      } finally {
        setStarLoaded(true);
      }
    })();
  }, []);

  const toggleStar = (id) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      window.storage.set("starred", JSON.stringify([...next]), false).catch(() => {});
      return next;
    });
  };

  const categories = ["All", ...Array.from(new Set(EXAMS.map((e) => e.category)))];
  const filtered = EXAMS.filter((e) => {
    const mq = query.trim() === "" || e.shortName.toLowerCase().includes(query.toLowerCase()) || e.name.toLowerCase().includes(query.toLowerCase()) || e.category.toLowerCase().includes(query.toLowerCase());
    const mc = category === "All" || e.category === category;
    return mq && mc;
  });
  const starredExams = EXAMS.filter((e) => starred.has(e.id)).sort((a, b) => daysLeft(a.examDate) - daysLeft(b.examDate));
  const selectedExam = EXAMS.find((e) => e.id === selectedId);

  return (
    <div style={{ minHeight: "100vh", background: `${OMR_BG}, ${C.bg}`, backgroundSize: "18px 18px, auto", fontFamily: bodyFont, padding: "clamp(18px, 5vw, 28px) clamp(12px, 4vw, 16px) 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus, button:focus-visible { outline: 2px solid ${C.ink}; outline-offset: 2px; }
        .hp-tap { min-height: 34px; min-width: 34px; display: inline-flex; align-items: center; justify-content: center; }
        .hp-eligibility-row { display: flex; gap: 8px; }
        .hp-eligibility-label { min-width: 84px; flex-shrink: 0; }
        .hp-card { transition: transform .15s ease, box-shadow .15s ease; }
        .hp-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(20,33,61,0.1); }
        @media (prefers-reduced-motion: reduce) {
          .hp-card, .hp-card:hover { transition: none; transform: none; }
        }
        @media (max-width: 460px) {
          .hp-eligibility-row { flex-direction: column; gap: 1px; }
          .hp-eligibility-label { min-width: 0; }
          .hp-countdown-row { gap: 4px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <HeroPass trackedCount={starred.size} />

        {view === "detail" && selectedExam ? (
          <ExamDetail exam={selectedExam} starred={starred.has(selectedExam.id)} onToggleStar={toggleStar} onBack={() => setView("home")} />
        ) : (
          <>
            {starLoaded && starredExams.length > 0 && (
              <div className="mb-6">
                <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>★ Your starred exams</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {starredExams.map((e) => {
                    const dl = daysLeft(e.examDate);
                    return (
                      <button key={e.id} onClick={() => { setSelectedId(e.id); setView("detail"); }}
                        style={{ flexShrink: 0, fontFamily: bodyFont, fontSize: 12.5, color: C.ink, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        {e.shortName}
                        <span style={{ fontFamily: monoFont, color: dl <= 14 ? C.red : C.green, fontWeight: 600 }}>{dl}d</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
              <Search size={16} color={C.inkSoft} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exams — UPSC, SSC, JEE…"
                style={{ border: "none", outline: "none", background: "transparent", fontFamily: bodyFont, fontSize: 13.5, color: C.ink, width: "100%" }} />
            </div>

            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ flexShrink: 0, fontFamily: bodyFont, fontSize: 12.5, fontWeight: category === c ? 600 : 400, color: category === c ? "#fff" : C.inkSoft, background: category === c ? C.ink : C.surface, border: `1px solid ${category === c ? C.ink : C.line}`, borderRadius: 20, padding: "6px 13px", cursor: "pointer" }}>
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ fontFamily: bodyFont, fontSize: 13.5, color: C.inkSoft, textAlign: "center", padding: "40px 0" }}>
                No exams match "{query}". Try a different search.
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
                {filtered.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} starred={starred.has(exam.id)} onToggleStar={toggleStar}
                    onOpen={(id) => { setSelectedId(id); setView("detail"); }} />
                ))}
              </div>
            )}

            <div style={{ fontFamily: bodyFont, fontSize: 11.5, color: C.inkSoft, textAlign: "center", marginTop: 28 }}>
              Sample exams shown for demo purposes. Connect a live exam feed to replace them with real, verified dates.
            </div>
          </>
        )}
      </div>
    </div>
  );
}