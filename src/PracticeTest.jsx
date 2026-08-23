import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ListChecks, Plus, Trash2, Timer, CheckCircle2, XCircle, MinusCircle,
  Trophy, ChevronLeft, ChevronRight, X, BarChart3, Play,
  Archive, ChevronDown, Search,
} from "lucide-react";

// firebase.js lives in the same folder as App.jsx and this file:
import { db } from "./firebase";
// Imported as a namespace (not destructured) to avoid a known Vite/Rollup
// production-build issue where some Firebase modular SDK named exports get
// dropped during tree-shaking despite working fine in dev mode.
import * as firestore from "firebase/firestore";
const {
  collection, addDoc, deleteDoc, doc, where, orderBy, serverTimestamp, onSnapshot,
} = firestore;
const firestoreQuery = firestore.query;

/* =========================================================
   Shared look — kept local to this file so it can be dropped
   in without needing exports from App.jsx.
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

const btn = (bg, color = "#fff") => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  border: "none", borderRadius: 8, background: bg, color,
  padding: "8px 13px", cursor: "pointer",
  fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600,
});

function fmtTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/* =========================================================
   QUESTION BANK — add / view / delete MCQs for one exam
========================================================= */
function QuestionBankManager({ examId, questions, loading, error, onOpenTest }) {
  const [open, setOpen] = useState(false);
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [section, setSection] = useState("General");
  const [year, setYear] = useState("");
  const [marks, setMarks] = useState(2);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setQText(""); setOptions(["", "", "", ""]); setCorrectIndex(0);
    setSection("General"); setYear(""); setMarks(2); setNegativeMarks(0.5);
    setFormError("");
  };

  const addQuestion = async () => {
    setFormError("");
    if (!qText.trim()) { setFormError("Enter the question text."); return; }
    if (options.some((o) => !o.trim())) { setFormError("Fill in all four options."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "questions"), {
        examId,
        section: section.trim() || "General",
        question: qText.trim(),
        options: options.map((o) => o.trim()),
        correctIndex,
        marks: Number(marks) || 1,
        negativeMarks: Number(negativeMarks) || 0,
        year: year.trim() || null,
        createdAt: serverTimestamp(),
      });
      resetForm();
    } catch (e) {
      console.error("Error adding question:", e);
      setFormError("Could not save the question. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteDoc(doc(db, "questions", id));
    } catch (e) {
      console.error("Error deleting question:", e);
      alert("Could not delete the question.");
    }
  };

  const bySection = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      const key = q.section || "General";
      if (!map[key]) map[key] = [];
      map[key].push(q);
    });
    return map;
  }, [questions]);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginTop: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ListChecks size={20} color={C.ink} />
            <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 20, color: C.ink }}>Practice Test</h2>
          </div>
          <div style={{ marginTop: 4, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
            {loading ? "Loading question bank…" : `${questions.length} question${questions.length === 1 ? "" : "s"} in the bank for this exam.`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setOpen((v) => !v)} style={btn(C.bg, C.ink)}>
            <Plus size={14} /> {open ? "Close" : "Add questions"}
          </button>
          <button
            onClick={onOpenTest}
            disabled={questions.length === 0}
            style={btn(questions.length ? C.green : C.line, "#fff")}
          >
            <Play size={14} /> Start mock test
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: C.softRed, color: C.red, border: `1px solid ${C.red}55`, borderRadius: 9, padding: "9px 11px", marginBottom: 14, fontFamily: bodyFont, fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {open && (
        <div style={{ background: C.softBlue, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>
            Add a question
          </div>

          {formError && (
            <div style={{ color: C.red, fontFamily: bodyFont, fontSize: 12, marginBottom: 8 }}>{formError}</div>
          )}

          <textarea
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Question text"
            rows={3}
            style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 8, background: "#fff", color: C.ink, fontFamily: bodyFont, resize: "vertical" }}
          />

          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <input
                type="radio"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                aria-label={`Mark option ${i + 1} correct`}
              />
              <input
                value={opt}
                onChange={(e) => {
                  const next = [...options]; next[i] = e.target.value; setOptions(next);
                }}
                placeholder={`Option ${i + 1}${correctIndex === i ? " (correct)" : ""}`}
                style={{ flex: 1, padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 7, background: "#fff", color: C.ink, fontFamily: bodyFont, fontSize: 13 }}
              />
            </div>
          ))}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section (e.g. GS, Maths)"
              style={{ flex: "1 1 140px", padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 7, background: "#fff", color: C.ink, fontFamily: bodyFont, fontSize: 12.5 }} />
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (optional)"
              style={{ flex: "1 1 100px", padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 7, background: "#fff", color: C.ink, fontFamily: bodyFont, fontSize: 12.5 }} />
            <input type="number" step="0.5" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Marks"
              style={{ width: 90, padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 7, background: "#fff", color: C.ink, fontFamily: bodyFont, fontSize: 12.5 }} />
            <input type="number" step="0.25" value={negativeMarks} onChange={(e) => setNegativeMarks(e.target.value)} placeholder="Negative"
              style={{ width: 90, padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 7, background: "#fff", color: C.ink, fontFamily: bodyFont, fontSize: 12.5 }} />
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={addQuestion} disabled={saving} style={btn(C.ink)}>
              <Plus size={14} /> {saving ? "Saving…" : "Save question"}
            </button>
          </div>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          {Object.entries(bySection).map(([sec, list]) => (
            <div key={sec}>
              <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
                {sec} — {list.length}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {list.map((q) => (
                  <div key={q.id} style={{ border: `1px solid ${C.line}`, borderRadius: 9, padding: 10, background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.ink, fontWeight: 600 }}>{q.question}</div>
                      <button onClick={() => removeQuestion(q.id)} style={{ border: "none", background: C.softRed, color: C.red, borderRadius: 6, padding: "4px 7px", cursor: "pointer", flexShrink: 0 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ marginTop: 6, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
                      {q.options.map((o, i) => (
                        <div key={i} style={{ color: i === q.correctIndex ? C.green : C.inkSoft, fontWeight: i === q.correctIndex ? 600 : 400 }}>
                          {i === q.correctIndex ? "✓ " : "· "}{o}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PYQ BROWSER — questions from the bank, grouped by the
   `year` field already captured in QuestionBankManager.
   Nothing new is stored here; this just gives that field a
   place to be read back as a proper previous-year archive
   instead of sitting unused on each question.
========================================================= */
function sortYearsDesc(years) {
  return [...years].sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    const aIsNum = !Number.isNaN(na) && String(na) === a.trim();
    const bIsNum = !Number.isNaN(nb) && String(nb) === b.trim();
    if (aIsNum && bIsNum) return nb - na;
    if (aIsNum !== bIsNum) return aIsNum ? -1 : 1; // numeric years first
    return b.localeCompare(a);
  });
}

function PYQPanel({ questions, loading }) {
  const [openYear, setOpenYear] = useState(null);
  const [search, setSearch] = useState("");

  const dated = useMemo(() => questions.filter((q) => q.year && String(q.year).trim()), [questions]);
  const undatedCount = questions.length - dated.length;

  const years = useMemo(() => sortYearsDesc(Array.from(new Set(dated.map((q) => String(q.year).trim())))), [dated]);

  useEffect(() => {
    if (years.length > 0 && openYear === null) setOpenYear(years[0]);
  }, [years, openYear]);

  const term = search.trim().toLowerCase();
  const filtered = term
    ? dated.filter((q) => q.question.toLowerCase().includes(term) || (q.section || "").toLowerCase().includes(term))
    : dated;

  if (loading) return null;
  if (dated.length === 0) return null; // nothing tagged with a year yet — nothing to browse

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginTop: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Archive size={20} color={C.ink} />
            <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 20, color: C.ink }}>Previous Year Questions</h2>
          </div>
          <div style={{ marginTop: 4, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
            {dated.length} question{dated.length === 1 ? "" : "s"} across {years.length} year{years.length === 1 ? "" : "s"}.
            {undatedCount > 0 && ` ${undatedCount} more in the bank without a year tag.`}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 10px", marginBottom: 14 }}>
        <Search size={15} color={C.inkSoft} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search previous year questions…"
          style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: bodyFont, fontSize: 13, color: C.ink }}
        />
      </div>

      {term && filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "18px 0", fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>
          No saved questions match "{search}".
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {years.map((year) => {
            const items = filtered.filter((q) => String(q.year).trim() === year);
            if (items.length === 0) return null;
            const isOpen = term ? true : openYear === year;
            return (
              <div key={year} style={{ border: `1px solid ${C.line}`, borderRadius: 9, overflow: "hidden" }}>
                <button
                  onClick={() => !term && setOpenYear(isOpen ? null : year)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: C.bg, border: "none", padding: "9px 12px", cursor: term ? "default" : "pointer",
                  }}
                >
                  <span style={{ fontFamily: monoFont, fontSize: 12.5, fontWeight: 700, color: C.ink }}>
                    {year} <span style={{ color: C.inkSoft, fontWeight: 400 }}>· {items.length} question{items.length === 1 ? "" : "s"}</span>
                  </span>
                  {!term && <ChevronDown size={15} color={C.inkSoft} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />}
                </button>
                {isOpen && (
                  <div style={{ padding: "0 12px 10px", display: "grid", gap: 8, marginTop: 8 }}>
                    {items.map((q) => (
                      <div key={q.id} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: 10, background: "#fff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontFamily: monoFont, fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "2px 7px" }}>
                            {q.section || "General"}
                          </span>
                        </div>
                        <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{q.question}</div>
                        <div style={{ marginTop: 6, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
                          {q.options.map((o, i) => (
                            <div key={i} style={{ color: i === q.correctIndex ? C.green : C.inkSoft, fontWeight: i === q.correctIndex ? 600 : 400 }}>
                              {i === q.correctIndex ? "✓ " : "· "}{o}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MOCK TEST — setup → taking → auto-submit
========================================================= */
function MockTestRunner({ exam, user, allQuestions, onFinish, onExit }) {
  const [phase, setPhase] = useState("setup"); // setup | taking
  const [count, setCount] = useState(Math.min(20, allQuestions.length));
  const [minutes, setMinutes] = useState(Math.max(5, Math.round(Math.min(20, allQuestions.length) * 1.2)));

  const [testQuestions, setTestQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const startTest = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, count);
    setTestQuestions(shuffled);
    setAnswers({});
    setCurrent(0);
    setSecondsLeft(minutes * 60);
    submittedRef.current = false;
    setPhase("taking");
  };

  const submitTest = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    let correct = 0, wrong = 0, skipped = 0, score = 0, maxScore = 0;
    const sections = {};

    testQuestions.forEach((q) => {
      const sec = q.section || "General";
      if (!sections[sec]) sections[sec] = { correct: 0, wrong: 0, skipped: 0, score: 0, max: 0 };
      const m = Number(q.marks) || 1;
      const nm = Number(q.negativeMarks) || 0;
      sections[sec].max += m;
      maxScore += m;

      const given = answers[q.id];
      if (given === undefined) {
        skipped += 1;
        sections[sec].skipped += 1;
      } else if (given === q.correctIndex) {
        correct += 1;
        score += m;
        sections[sec].correct += 1;
        sections[sec].score += m;
      } else {
        wrong += 1;
        score -= nm;
        sections[sec].wrong += 1;
        sections[sec].score -= nm;
      }
    });

    const attempt = {
      userId: user.uid,
      examId: exam.id,
      examShortName: exam.shortName,
      durationSeconds: minutes * 60,
      totalQuestions: testQuestions.length,
      attempted: testQuestions.length - skipped,
      correct, wrong, skipped,
      score: Math.round(score * 100) / 100,
      maxScore,
      sections,
      answers,
      questionIds: testQuestions.map((q) => q.id),
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "testAttempts"), attempt);
    } catch (e) {
      console.error("Error saving test attempt:", e);
      // Still show results even if the save failed -- don't strand the student.
    } finally {
      setSubmitting(false);
      onFinish({ ...attempt, questions: testQuestions });
    }
  }, [answers, testQuestions, exam, user, minutes, onFinish]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "taking") return;
    if (secondsLeft <= 0) { submitTest(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, submitTest]);

  if (phase === "setup") {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: displayFont, fontSize: 19, color: C.ink }}>Set up your mock test</div>
          <button onClick={onExit} style={{ border: "none", background: "transparent", color: C.inkSoft, cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
          <label style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>
            Number of questions (max {allQuestions.length})
            <input
              type="number" min={1} max={allQuestions.length} value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(allQuestions.length, Number(e.target.value) || 1)))}
              style={{ display: "block", marginTop: 4, width: "100%", padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: bodyFont, fontSize: 13.5 }}
            />
          </label>
          <label style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>
            Duration (minutes)
            <input
              type="number" min={1} value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
              style={{ display: "block", marginTop: 4, width: "100%", padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: bodyFont, fontSize: 13.5 }}
            />
          </label>
        </div>

        <button onClick={startTest} style={{ ...btn(C.green), marginTop: 16 }}>
          <Play size={14} /> Start test
        </button>
      </div>
    );
  }

  // ---- taking ----
  const q = testQuestions[current];
  const answeredCount = Object.keys(answers).length;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontFamily: displayFont, fontSize: 17, color: C.ink }}>{exam.shortName} Mock Test</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: monoFont, fontSize: 15, fontWeight: 700, color: secondsLeft <= 60 ? C.red : C.ink }}>
          <Timer size={16} /> {fmtTime(secondsLeft)}
        </div>
      </div>

      {/* Question palette */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {testQuestions.map((tq, i) => {
          const isAnswered = answers[tq.id] !== undefined;
          const isCurrent = i === current;
          return (
            <button
              key={tq.id}
              onClick={() => setCurrent(i)}
              style={{
                width: 30, height: 30, borderRadius: 7, border: isCurrent ? `2px solid ${C.ink}` : `1px solid ${C.line}`,
                background: isAnswered ? C.softGreen : "#fff", color: C.ink,
                fontFamily: monoFont, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: monoFont, fontSize: 10.5, color: C.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
        Question {current + 1} of {testQuestions.length} · {q.section || "General"} · {answeredCount} answered
      </div>

      <div style={{ fontFamily: bodyFont, fontSize: 15, color: C.ink, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
        {q.question}
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {q.options.map((opt, i) => {
          const selected = answers[q.id] === i;
          return (
            <button
              key={i}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
              style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 9,
                border: selected ? `2px solid ${C.ink}` : `1px solid ${C.line}`,
                background: selected ? C.softBlue : "#fff", color: C.ink,
                fontFamily: bodyFont, fontSize: 13.5, cursor: "pointer",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} style={btn(current === 0 ? C.line : C.bg, C.ink)}>
            <ChevronLeft size={14} /> Prev
          </button>
          <button onClick={() => setCurrent((c) => Math.min(testQuestions.length - 1, c + 1))} disabled={current === testQuestions.length - 1} style={btn(current === testQuestions.length - 1 ? C.line : C.bg, C.ink)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
        <button
          onClick={() => {
            const unanswered = testQuestions.length - answeredCount;
            if (unanswered > 0 && !window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
            submitTest();
          }}
          disabled={submitting}
          style={btn(C.red)}
        >
          {submitting ? "Submitting…" : "Submit test"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   RESULTS — score, breakdown, answer review
========================================================= */
function TestResults({ attempt, onClose, onRetake }) {
  const accuracy = attempt.attempted > 0 ? Math.round((attempt.correct / attempt.attempted) * 100) : 0;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy size={20} color={C.yellow} />
          <div style={{ fontFamily: displayFont, fontSize: 19, color: C.ink }}>Test Results</div>
        </div>
        <button onClick={onClose} style={{ border: "none", background: "transparent", color: C.inkSoft, cursor: "pointer" }}><X size={18} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 18 }}>
        <StatBox label="Score" value={`${attempt.score} / ${attempt.maxScore}`} bg={C.softBlue} />
        <StatBox label="Accuracy" value={`${accuracy}%`} bg={C.softGreen} />
        <StatBox label="Correct" value={attempt.correct} bg={C.softGreen} color={C.green} />
        <StatBox label="Wrong" value={attempt.wrong} bg={C.softRed} color={C.red} />
        <StatBox label="Skipped" value={attempt.skipped} bg={C.softYellow} color={C.yellow} />
      </div>

      {Object.keys(attempt.sections || {}).length > 1 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>Section breakdown</div>
          <div style={{ display: "grid", gap: 6 }}>
            {Object.entries(attempt.sections).map(([sec, s]) => (
              <div key={sec} style={{ display: "flex", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 8, padding: "7px 10px", fontFamily: bodyFont, fontSize: 12.5 }}>
                <span style={{ color: C.ink, fontWeight: 600 }}>{sec}</span>
                <span style={{ color: C.inkSoft }}>{s.score} / {s.max} · {s.correct}✓ {s.wrong}✗ {s.skipped}–</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>Answer review</div>
        <div style={{ display: "grid", gap: 8 }}>
          {attempt.questions.map((q, i) => {
            const given = attempt.answers[q.id];
            const isCorrect = given === q.correctIndex;
            const isSkipped = given === undefined;
            return (
              <div key={q.id} style={{ border: `1px solid ${C.line}`, borderRadius: 9, padding: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {isSkipped ? <MinusCircle size={16} color={C.yellow} style={{ flexShrink: 0, marginTop: 2 }} />
                    : isCorrect ? <CheckCircle2 size={16} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                    : <XCircle size={16} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />}
                  <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.ink, fontWeight: 600 }}>{i + 1}. {q.question}</div>
                </div>
                <div style={{ marginTop: 6, marginLeft: 24, fontFamily: bodyFont, fontSize: 12.5 }}>
                  {q.options.map((opt, oi) => {
                    let color = C.inkSoft;
                    let prefix = "· ";
                    if (oi === q.correctIndex) { color = C.green; prefix = "✓ "; }
                    if (oi === given && given !== q.correctIndex) { color = C.red; prefix = "✗ "; }
                    return <div key={oi} style={{ color, fontWeight: oi === q.correctIndex || oi === given ? 600 : 400 }}>{prefix}{opt}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onRetake} style={btn(C.ink)}>Retake test</button>
        <button onClick={onClose} style={btn(C.bg, C.ink)}>Back to exam</button>
      </div>
    </div>
  );
}

function StatBox({ label, value, bg, color }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: 12, textAlign: "center" }}>
      <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700, color: color || C.ink }}>{value}</div>
      <div style={{ fontFamily: bodyFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* =========================================================
   HISTORY — past attempts for this exam, live-synced
========================================================= */
function TestHistoryPanel({ examId, user }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setAttempts([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    let unsubscribe = () => {};
    try {
      const q = firestoreQuery(
        collection(db, "testAttempts"),
        where("examId", "==", examId),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          setAttempts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (err) => {
          console.error("Error loading test history:", err);
          // A missing composite index is the most common cause here --
          // Firestore's error includes a direct link to create it.
          setError(
            err.code === "failed-precondition"
              ? "This history view needs a Firestore index — check the browser console for a link to create it."
              : "Can't load test history right now."
          );
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up history listener:", err);
      setError("Can't load test history right now.");
      setLoading(false);
    }
    return () => unsubscribe();
  }, [examId, user]);

  if (loading) return null;
  if (error) {
    return (
      <div style={{ background: C.softRed, color: C.red, border: `1px solid ${C.red}55`, borderRadius: 9, padding: "9px 11px", marginTop: 14, fontFamily: bodyFont, fontSize: 12.5 }}>
        {error}
      </div>
    );
  }
  if (attempts.length === 0) return null;

  const best = attempts.reduce((a, b) => (b.score > (a?.score ?? -Infinity) ? b : a), null);

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <BarChart3 size={16} color={C.ink} />
        <div style={{ fontFamily: displayFont, fontSize: 15, color: C.ink }}>Your test history</div>
      </div>

      {best && (
        <div style={{ background: C.softYellow, borderRadius: 9, padding: "8px 11px", marginBottom: 8, fontFamily: bodyFont, fontSize: 12.5, color: C.ink }}>
          <strong>Best score:</strong> {best.score} / {best.maxScore}
        </div>
      )}

      <div style={{ display: "grid", gap: 6 }}>
        {attempts.map((a) => {
          const date = a.createdAt?.toDate ? a.createdAt.toDate() : null;
          const acc = a.attempted > 0 ? Math.round((a.correct / a.attempted) * 100) : 0;
          return (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 8, padding: "7px 10px", fontFamily: bodyFont, fontSize: 12.5 }}>
              <span style={{ color: C.inkSoft }}>{date ? date.toLocaleDateString() : "Just now"}</span>
              <span style={{ color: C.ink, fontWeight: 600 }}>{a.score} / {a.maxScore} · {acc}% accuracy</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   TOP-LEVEL WRAPPER — embed this in ExamDetail
========================================================= */
export default function PracticeTestSection({ exam, user }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("bank"); // bank | test | results
  const [lastAttempt, setLastAttempt] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let unsubscribe = () => {};
    try {
      const q = firestoreQuery(collection(db, "questions"), where("examId", "==", exam.id));
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (err) => {
          console.error("Error loading question bank:", err);
          setError(
            err.code === "permission-denied"
              ? "Can't load questions — check Firestore rules for the 'questions' collection."
              : "Can't load the question bank right now."
          );
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up question bank listener:", err);
      setError("Can't load the question bank right now.");
      setLoading(false);
    }
    return () => unsubscribe();
  }, [exam.id]);

  if (!user) return null;

  if (mode === "test") {
    return (
      <div style={{ marginTop: 22 }}>
        <MockTestRunner
          exam={exam}
          user={user}
          allQuestions={questions}
          onExit={() => setMode("bank")}
          onFinish={(attempt) => { setLastAttempt(attempt); setMode("results"); }}
        />
      </div>
    );
  }

  if (mode === "results" && lastAttempt) {
    return (
      <div style={{ marginTop: 22 }}>
        <TestResults
          attempt={lastAttempt}
          onClose={() => setMode("bank")}
          onRetake={() => setMode("test")}
        />
      </div>
    );
  }

  return (
    <>
      <QuestionBankManager
        examId={exam.id}
        questions={questions}
        loading={loading}
        error={error}
        onOpenTest={() => setMode("test")}
      />
      <PYQPanel questions={questions} loading={loading} />
      <TestHistoryPanel examId={exam.id} user={user} />
    </>
  );
}