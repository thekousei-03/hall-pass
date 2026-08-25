/**
 * Hall Pass — Full-length Mock Test (with timer)
 * Progress is now saved to Firestore (multi-device).
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  ListChecks,
} from "lucide-react";
import { saveAttempt } from "./services/progressService";

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

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";
const monoFont = "'IBM Plex Mono', monospace";

/* ---- Exam patterns ---- */
const EXAM_PATTERNS = {
  "ssc-cgl": {
    label: "SSC CGL Tier-I (full length)",
    totalTimeMin: 60,
    negativeMark: 0.5,
    sectionalTimer: false,
    sections: [
      { id: "reasoning", name: "General Intelligence & Reasoning", qCount: 25, marksEach: 2, timeMin: 15 },
      { id: "ga", name: "General Awareness", qCount: 25, marksEach: 2, timeMin: 15 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 25, marksEach: 2, timeMin: 15 },
      { id: "english", name: "English Comprehension", qCount: 25, marksEach: 2, timeMin: 15 },
    ],
  },
  cat: {
    label: "CAT (full-length practice)",
    totalTimeMin: 120,
    negativeMark: 1,
    sectionalTimer: true,
    sections: [
      { id: "varc", name: "VARC", qCount: 22, marksEach: 3, timeMin: 40 },
      { id: "dilr", name: "DILR", qCount: 20, marksEach: 3, timeMin: 40 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 22, marksEach: 3, timeMin: 40 },
    ],
  },
  "jee-main": {
    label: "JEE Main (full length)",
    totalTimeMin: 180,
    negativeMark: 1,
    sectionalTimer: false,
    sections: [
      { id: "physics", name: "Physics", qCount: 30, marksEach: 4, timeMin: 60 },
      { id: "chemistry", name: "Chemistry", qCount: 30, marksEach: 4, timeMin: 60 },
      { id: "maths", name: "Mathematics", qCount: 30, marksEach: 4, timeMin: 60 },
    ],
  },
  "neet-ug": {
    label: "NEET UG (full length)",
    totalTimeMin: 200,
    negativeMark: 1,
    sectionalTimer: false,
    sections: [
      { id: "physics", name: "Physics", qCount: 45, marksEach: 4, timeMin: 50 },
      { id: "chemistry", name: "Chemistry", qCount: 45, marksEach: 4, timeMin: 50 },
      { id: "biology", name: "Biology", qCount: 90, marksEach: 4, timeMin: 100 },
    ],
  },
  "upsc-cse": {
    label: "UPSC CSE Prelims GS (full length)",
    totalTimeMin: 120,
    negativeMark: 0.66,
    sectionalTimer: false,
    sections: [{ id: "gs", name: "General Studies", qCount: 100, marksEach: 2, timeMin: 120 }],
  },
  gate: {
    label: "GATE (full length)",
    totalTimeMin: 180,
    negativeMark: 0.33,
    sectionalTimer: false,
    sections: [
      { id: "ga", name: "General Aptitude", qCount: 10, marksEach: 1, timeMin: 25 },
      { id: "core", name: "Core", qCount: 55, marksEach: 2, timeMin: 155 },
    ],
  },
  "ibps-po": {
    label: "IBPS PO Prelims (full length)",
    totalTimeMin: 60,
    negativeMark: 0.25,
    sectionalTimer: true,
    sections: [
      { id: "english", name: "English Language", qCount: 30, marksEach: 1, timeMin: 20 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 35, marksEach: 1, timeMin: 20 },
      { id: "reasoning", name: "Reasoning Ability", qCount: 35, marksEach: 1, timeMin: 20 },
    ],
  },
};

const YEAR_OPTIONS = [2025, 2024, 2023, 2022, 2021, "all"];

function q(id, section, year, text, options, correctIndex, explanation) {
  return { id, section, year, text, options, correctIndex, explanation };
}

function buildDetailedSolution(qu, userAns) {
  const correctLetter = String.fromCharCode(65 + qu.correctIndex);
  const correctText = qu.options[qu.correctIndex];
  const parts = [];

  parts.push(`Correct answer: ${correctLetter}. ${correctText}`);

  if (userAns === undefined || userAns === null) {
    parts.push("You left this question unattempted.");
  } else if (userAns === qu.correctIndex) {
    parts.push("You marked the correct option.");
  } else {
    const userLetter = String.fromCharCode(65 + userAns);
    parts.push(
      `You marked ${userLetter}. ${qu.options[userAns] || ""} — that does not match the correct option.`
    );
  }

  if (qu.explanation && String(qu.explanation).trim()) {
    parts.push(`Reasoning: ${qu.explanation}`);
  } else {
    parts.push(
      "Reasoning: Compare each option against the concept tested in the question stem; eliminate options that contradict the given data or standard formula/fact."
    );
  }

  parts.push(
    `Tip: Revisit ${qu.sectionName || "this section"} and practice similar ${qu.year ? qu.year + "-style " : ""}items until this pattern feels automatic.`
  );

  return parts;
}

/* ---- Question bank (original practice items) ---- */
const BANK = {
  "ssc-cgl": [
    q("r1", "reasoning", 2025, "If PAPER is coded as OZODQ, how is PENCIL coded?", ["ODMBHK", "ODMBHJ", "ODNAHK", "OEMBHK"], 0, "Each letter −1."),
    q("r2", "reasoning", 2024, "Series: 2, 6, 12, 20, 30, ?", ["40", "42", "44", "36"], 1, "Differences +4,+6,+8,+10,+12."),
    q("r3", "reasoning", 2023, "A is taller than B but shorter than C. D is between A and B. Shortest?", ["A", "B", "C", "D"], 1, "C > A > D > B."),
    q("r4", "reasoning", 2022, "Odd one: 3, 5, 11, 14, 17, 21", ["14", "17", "21", "11"], 0, "14 is even."),
    q("r5", "reasoning", 2021, "If 1 Jan 2023 was Sunday, 1 Jan 2024 was?", ["Sunday", "Monday", "Tuesday", "Saturday"], 1, "Non-leap year → +1 day."),
    q("g1", "ga", 2025, "Father of the Indian Constitution?", ["Nehru", "Ambedkar", "Rajendra Prasad", "Patel"], 1, "B.R. Ambedkar."),
    q("g2", "ga", 2024, "RBI established in?", ["1935", "1947", "1950", "1921"], 0, "1935."),
    q("g3", "ga", 2023, "Red Planet?", ["Venus", "Mars", "Jupiter", "Mercury"], 1, "Mars."),
    q("q1", "quant", 2025, "25% of 480?", ["100", "120", "140", "160"], 1, "120."),
    q("q2", "quant", 2024, "SI on 5000 at 10% for 2 years?", ["500", "1000", "1500", "800"], 1, "1000."),
    q("q3", "quant", 2023, "Average of 5,10,15,20,25?", ["15", "16", "14", "17"], 0, "15."),
    q("e1", "english", 2025, "Synonym of Benevolent?", ["Cruel", "Kind", "Angry", "Greedy"], 1, "Kind."),
    q("e2", "english", 2024, "Error: He don't know the answer.", ["He", "don't", "know", "No error"], 1, "doesn't."),
    q("e3", "english", 2023, "She has lived here ___ 2019.", ["for", "since", "from", "at"], 1, "since."),
  ],
  cat: [
    q("v1", "varc", 2025, "Tone that criticises but acknowledges benefits is?", ["Hostile", "Balanced", "Celebratory", "Indifferent"], 1, "Balanced."),
    q("d1", "dilr", 2025, "A>B ranks, C worst of 4. Can D be rank 1?", ["Yes", "No", "Only if A is 4", "Impossible"], 0, "Yes."),
    q("cq1", "quant", 2025, "x+1/x=3 ⇒ x²+1/x²=?", ["7", "9", "8", "6"], 0, "7."),
  ],
  "jee-main": [
    q("p1", "physics", 2025, "Unit of force in SI?", ["Newton", "Joule", "Watt", "Pascal"], 0, "Newton."),
    q("c1", "chemistry", 2025, "Atomic number of Carbon?", ["6", "8", "12", "14"], 0, "6."),
    q("m1", "maths", 2025, "Derivative of x²?", ["2x", "x", "x²", "2"], 0, "2x."),
  ],
  "neet-ug": [
    q("np1", "physics", 2025, "SI unit of current?", ["Ampere", "Volt", "Ohm", "Watt"], 0, "Ampere."),
    q("nc1", "chemistry", 2025, "pH of pure water?", ["7", "0", "14", "1"], 0, "7."),
    q("nb1", "biology", 2025, "Powerhouse of the cell?", ["Mitochondria", "Nucleus", "Ribosome", "Golgi"], 0, "Mitochondria."),
  ],
  "upsc-cse": [
    q("gs1", "gs", 2025, "Who is the head of the Indian state?", ["President", "PM", "Chief Justice", "Speaker"], 0, "President."),
    q("gs2", "gs", 2024, "Fundamental Rights are in which part?", ["Part III", "Part IV", "Part II", "Part V"], 0, "Part III."),
  ],
  gate: [
    q("ga1", "ga", 2025, "Synonym of Abundant?", ["Scarce", "Plentiful", "Rare", "Little"], 1, "Plentiful."),
    q("core1", "core", 2025, "Time complexity of binary search?", ["O(log n)", "O(n)", "O(n²)", "O(1)"], 0, "O(log n)."),
  ],
  "ibps-po": [
    q("ie1", "english", 2025, "Synonym of Benevolent?", ["Cruel", "Kind", "Angry", "Greedy"], 1, "Kind."),
    q("iq1", "quant", 2025, "25% of 480?", ["100", "120", "140", "160"], 1, "120."),
    q("ir1", "reasoning", 2025, "If PAPER is coded as OZODQ, how is PENCIL coded?", ["ODMBHK", "ODMBHJ", "ODNAHK", "OEMBHK"], 0, "Each letter −1."),
  ],
};

/* ---- Helpers ---- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPaper(examId, year, opts = {}) {
  const pattern = EXAM_PATTERNS[examId] || EXAM_PATTERNS["ssc-cgl"];
  const bank = BANK[examId] || BANK["ssc-cgl"];
  const yearNum = year === "all" ? null : Number(year);
  const isSectional = opts.mode === "sectional";
  const targetSectionId = opts.sectionId;

  let sectionsToUse = pattern.sections;
  if (isSectional && targetSectionId) {
    sectionsToUse = pattern.sections.filter((s) => s.id === targetSectionId);
  }

  const questions = [];
  let qNum = 1;

  sectionsToUse.forEach((sec) => {
    let pool = bank.filter((x) => x.section === sec.id);
    if (yearNum) {
      const preferred = pool.filter((x) => x.year === yearNum);
      const rest = pool.filter((x) => x.year !== yearNum);
      pool = [...preferred, ...rest];
    }
    pool = shuffle(pool);

    let take = sec.qCount;
    if (isSectional) {
      take = Math.min(sec.qCount, Math.max(8, Math.round(sec.qCount * 0.5)));
    }
    // Safety: don't request more than available
    take = Math.min(take, pool.length || 5);

    const picked = pool.slice(0, take);
    // If bank is small, repeat some questions so the test still runs
    while (picked.length < take && pool.length > 0) {
      picked.push(...shuffle(pool).slice(0, take - picked.length));
    }

    picked.forEach((item) => {
      questions.push({
        ...item,
        uid: `${item.id}-${qNum}`,
        qNum,
        sectionId: sec.id,
        sectionName: sec.name,
        marksEach: sec.marksEach,
      });
      qNum += 1;
    });
  });

  return {
    pattern: {
      ...pattern,
      totalTimeMin: isSectional
        ? Math.max(8, Math.round((sectionsToUse[0]?.timeMin || 15) * 0.6))
        : pattern.totalTimeMin,
    },
    questions,
    mode: isSectional ? "sectional" : "full",
  };
}

function useTimer(totalSec, running, onExpire) {
  const [left, setLeft] = useState(totalSec);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    setLeft(totalSec);
  }, [totalSec]);

  useEffect(() => {
    if (!running || totalSec <= 0) return;
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          if (expireRef.current) expireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, totalSec]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return { display, left };
}

/* =========================================================
   RESULTS VIEW
========================================================= */
function ResultsView({
  exam,
  pattern,
  questions,
  answers,
  flagged,
  timeTakenSec,
  userId,
  mode,
  onRetry,
  onClose,
}) {
  const analysis = useMemo(() => {
    let score = 0;
    let maxScore = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const weakMap = {};
    const weakQuestions = [];

    questions.forEach((qu) => {
      maxScore += qu.marksEach;
      const ans = answers[qu.uid];
      const attempted = ans !== undefined && ans !== null;

      if (!attempted) {
        skipped += 1;
        return;
      }

      if (ans === qu.correctIndex) {
        score += qu.marksEach;
        correct += 1;
      } else {
        score -= pattern.negativeMark || 0;
        wrong += 1;
        weakMap[qu.sectionName] = (weakMap[qu.sectionName] || 0) + 1;
        weakQuestions.push(qu);
      }
    });

    score = Math.max(0, Math.round(score * 100) / 100);

    const weakSections = Object.entries(weakMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    return { score, maxScore, correct, wrong, skipped, weakSections, weakQuestions };
  }, [questions, answers, pattern]);

  // ★ Save to Firestore once
  useEffect(() => {
    if (!userId) return;

    saveAttempt(userId, {
      examId: exam.id,
      examName: exam.shortName || exam.name,
      mode: mode || "full",
      score: analysis.score,
      maxScore: analysis.maxScore,
      weakSections: analysis.weakSections,
      timeTakenSec: timeTakenSec || null,
    }).catch((err) => {
      console.error("Could not save attempt:", err);
    });
  }, [userId]);

  const pct = analysis.maxScore ? Math.round((analysis.score / analysis.maxScore) * 100) : 0;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: 20, background: C.ink, color: "#fff" }}>
        <div style={{ fontFamily: monoFont, fontSize: 12, opacity: 0.7 }}>RESULT</div>
        <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, marginTop: 4 }}>
          {exam.shortName} Mock
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 18, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>SCORE</div>
            <div style={{ fontFamily: monoFont, fontSize: 28, fontWeight: 700 }}>
              {analysis.score}/{analysis.maxScore}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>ACCURACY</div>
            <div style={{ fontFamily: monoFont, fontSize: 28, fontWeight: 700 }}>{pct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>TIME</div>
            <div style={{ fontFamily: monoFont, fontSize: 22, fontWeight: 700 }}>
              {Math.floor((timeTakenSec || 0) / 60)}m {(timeTakenSec || 0) % 60}s
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ background: C.softGreen, borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>CORRECT</div>
            <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700, color: C.green }}>
              {analysis.correct}
            </div>
          </div>
          <div style={{ background: C.softRed, borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>WRONG</div>
            <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700, color: C.red }}>
              {analysis.wrong}
            </div>
          </div>
          <div style={{ background: C.softYellow, borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>SKIPPED</div>
            <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700, color: C.yellow }}>
              {analysis.skipped}
            </div>
          </div>
        </div>

        {analysis.weakSections.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
              WEAK SECTIONS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {analysis.weakSections.map((s) => (
                <span
                  key={s}
                  style={{
                    background: C.softRed,
                    color: C.red,
                    borderRadius: 16,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, marginBottom: 10, color: C.ink }}>
          Answer review
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {questions.map((qu) => {
            const ans = answers[qu.uid];
            const attempted = ans !== undefined && ans !== null;
            const isRight = attempted && ans === qu.correctIndex;
            const isWrong = attempted && ans !== qu.correctIndex;
            return (
              <div
                key={qu.uid}
                style={{
                  border: `1px solid ${isRight ? C.green + "55" : isWrong ? C.red + "55" : C.line}`,
                  background: isRight ? C.softGreen : isWrong ? C.softRed : C.surface,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft }}>
                    Q{qu.qNum} · {qu.sectionName}
                    {qu.year ? ` · ${qu.year}-style` : ""}
                    {flagged[qu.uid] ? " · flagged" : ""}
                  </span>
                  {isRight && <CheckCircle2 size={18} color={C.green} />}
                  {isWrong && <XCircle size={18} color={C.red} />}
                  {!attempted && (
                    <span style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft }}>Skipped</span>
                  )}
                </div>
                <div style={{ fontFamily: bodyFont, fontSize: 13.5, color: C.ink, marginBottom: 8 }}>
                  {qu.text}
                </div>
                <div style={{ display: "grid", gap: 4 }}>
                  {qu.options.map((opt, i) => {
                    const isCorrectOpt = i === qu.correctIndex;
                    const isUserOpt = i === ans;
                    return (
                      <div
                        key={i}
                        style={{
                          fontFamily: bodyFont,
                          fontSize: 12.5,
                          padding: "6px 10px",
                          borderRadius: 8,
                          background: isCorrectOpt
                            ? C.softGreen
                            : isUserOpt && isWrong
                              ? C.softRed
                              : "#fff",
                          border: `1px solid ${
                            isCorrectOpt ? C.green : isUserOpt && isWrong ? C.red : C.line
                          }`,
                        }}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                        {isCorrectOpt ? " ✓" : ""}
                        {isUserOpt && isWrong ? " (your answer)" : ""}
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    padding: "12px 14px",
                    background: C.softBlue,
                    borderRadius: 8,
                    borderLeft: `3px solid ${C.blue}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: monoFont,
                      fontSize: 10,
                      color: C.blue,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      marginBottom: 8,
                    }}
                  >
                    Detailed solution
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {buildDetailedSolution(qu, ans).map((line, li) => (
                      <div
                        key={li}
                        style={{
                          fontFamily: bodyFont,
                          fontSize: 12.5,
                          color: C.ink,
                          lineHeight: 1.55,
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button
            onClick={onRetry}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: C.ink,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              fontFamily: bodyFont,
              fontWeight: 600,
            }}
          >
            <RotateCcw size={15} /> Retake
          </button>
          <button
            onClick={onClose}
            style={{
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              fontFamily: bodyFont,
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>
        <p style={{ marginTop: 14, fontSize: 11.5, color: C.inkSoft }}>
          Progress is saved to your account and syncs across devices.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   LIVE TEST
========================================================= */
function LiveTest({ exam, paper, onSubmit, onAbort }) {
  const { pattern, questions } = paper;
  const sections = pattern.sections || [];
  const locked = !!pattern.sectionalTimer;
  const totalSec = pattern.totalTimeMin * 60;

  const sectionRanges = useMemo(() => {
    const ranges = [];
    let start = 0;
    sections.forEach((sec) => {
      const count = questions.filter((q) => q.sectionId === sec.id).length;
      ranges.push({
        id: sec.id,
        name: sec.name,
        timeMin: sec.timeMin || Math.round(pattern.totalTimeMin / Math.max(sections.length, 1)),
        start,
        end: start + count - 1,
        qCount: count,
      });
      start += count;
    });
    return ranges;
  }, [sections, questions, pattern.totalTimeMin]);

  const [sectionIdx, setSectionIdx] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [running, setRunning] = useState(true);
  const [sectionFlash, setSectionFlash] = useState(null);
  const startRef = useRef(Date.now());
  const answersRef = useRef(answers);
  const flaggedRef = useRef(flagged);
  answersRef.current = answers;
  flaggedRef.current = flagged;

  const currentRange = sectionRanges[sectionIdx] || sectionRanges[0];
  const sectionSec = (currentRange?.timeMin || 0) * 60;

  const submit = useCallback(() => {
    setRunning(false);
    const timeTakenSec = Math.min(totalSec, Math.round((Date.now() - startRef.current) / 1000));
    onSubmit({
      answers: answersRef.current,
      flagged: flaggedRef.current,
      timeTakenSec,
    });
  }, [onSubmit, totalSec]);

  const advanceSection = useCallback(() => {
    setSectionIdx((si) => {
      const next = si + 1;
      if (next >= sectionRanges.length) {
        setTimeout(() => submit(), 0);
        return si;
      }
      const range = sectionRanges[next];
      setIdx(range.start);
      setSectionFlash(`Section time up — moved to ${range.name}`);
      setTimeout(() => setSectionFlash(null), 3500);
      return next;
    });
  }, [sectionRanges, submit]);

  const { display: overallDisplay, left: overallLeft } = useTimer(totalSec, running, submit);

  const onSectionExpire = useCallback(() => {
    if (!running || !locked) return;
    advanceSection();
  }, [running, locked, advanceSection]);

  const { display: sectionDisplay, left: sectionLeft } = useTimer(
    locked ? sectionSec : 0,
    running && locked && !!currentRange,
    onSectionExpire
  );

  useEffect(() => {
    if (!locked || !currentRange) return;
    if (idx < currentRange.start || idx > currentRange.end) {
      setIdx(currentRange.start);
    }
  }, [locked, currentRange, idx]);

  useEffect(() => {
    if (locked || !sectionRanges.length) return;
    const found = sectionRanges.findIndex((r) => idx >= r.start && idx <= r.end);
    if (found >= 0 && found !== sectionIdx) setSectionIdx(found);
  }, [locked, idx, sectionRanges, sectionIdx]);

  const timePct = totalSec > 0 ? Math.max(0, Math.min(100, (overallLeft / totalSec) * 100)) : 0;
  const sectionPct =
    locked && sectionSec > 0
      ? Math.max(0, Math.min(100, (sectionLeft / sectionSec) * 100))
      : timePct;
  const primaryLeft = locked ? sectionLeft : overallLeft;
  const timerColor =
    primaryLeft < 60 ? "#f0a0a0" : primaryLeft < 300 ? "#f5d76e" : "#8fdfb0";
  const barColor =
    primaryLeft < 60 ? C.red : primaryLeft < 300 ? C.yellow : C.green;

  const qu = questions[idx];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] != null).length;

  const canGoPrev = locked ? idx > (currentRange?.start ?? 0) : idx > 0;
  const canGoNext = locked
    ? idx < (currentRange?.end ?? questions.length - 1)
    : idx < questions.length - 1;

  const goPrev = () => {
    if (!canGoPrev) return;
    setIdx((i) => i - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    setIdx((i) => i + 1);
  };

  const jumpTo = (i) => {
    if (locked && currentRange && (i < currentRange.start || i > currentRange.end)) return;
    setIdx(i);
  };

  const finishSectionEarly = () => {
    if (!locked) return;
    if (sectionIdx >= sectionRanges.length - 1) {
      if (window.confirm("This is the last section. Submit the mock test?")) submit();
      return;
    }
    const next = sectionRanges[sectionIdx + 1];
    if (
      window.confirm(
        `Finish "${currentRange?.name}" and start "${next.name}"? You cannot return to this section.`
      )
    ) {
      setSectionIdx(sectionIdx + 1);
      setIdx(next.start);
    }
  };

  if (!qu) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 0", background: C.ink, color: "#fff" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            paddingBottom: 10,
          }}
        >
          <div>
            <div style={{ fontFamily: monoFont, fontSize: 11, opacity: 0.7 }}>{pattern.label}</div>
            <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 16 }}>
              {exam.shortName} Mock
            </div>
            {currentRange && sections.length > 1 && (
              <div style={{ fontFamily: bodyFont, fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                Section {sectionIdx + 1}/{sections.length}: {currentRange.name}
                {locked ? " · locked timer" : ""}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {locked && currentRange && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontSize: 22,
                    fontWeight: 700,
                    color: timerColor,
                    letterSpacing: 0.5,
                  }}
                >
                  <Clock size={15} style={{ display: "inline", marginRight: 5, verticalAlign: -2 }} />
                  {sectionDisplay}
                </div>
                <div style={{ fontSize: 10, opacity: 0.65 }}>
                  Section · {Math.round(sectionPct)}% left
                </div>
              </div>
            )}
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: locked ? 16 : 24,
                  fontWeight: 700,
                  color: locked ? "rgba(255,255,255,0.85)" : timerColor,
                  letterSpacing: 0.5,
                }}
              >
                {!locked && (
                  <Clock size={16} style={{ display: "inline", marginRight: 6, verticalAlign: -3 }} />
                )}
                {overallDisplay}
              </div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>
                {locked
                  ? "Overall"
                  : `${answeredCount}/${questions.length} answered · ${Math.round(timePct)}% left`}
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Submit the mock test now?")) submit();
              }}
              style={{
                background: C.green,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Submit
            </button>
          </div>
        </div>

        <div style={{ height: 5, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${locked ? sectionPct : timePct}%`,
              background: barColor,
              transition: "width 1s linear, background 0.3s ease",
            }}
          />
        </div>

        {sectionRanges.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "10px 0 8px" }}>
            {sectionRanges.map((r, i) => {
              const done = locked && i < sectionIdx;
              const active = i === sectionIdx;
              const answeredInSec = questions
                .slice(r.start, r.end + 1)
                .filter((q) => answers[q.uid] != null).length;
              return (
                <div
                  key={r.id}
                  style={{
                    fontFamily: monoFont,
                    fontSize: 10,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: active
                      ? "rgba(255,255,255,0.2)"
                      : done
                        ? "rgba(60,122,87,0.35)"
                        : "rgba(255,255,255,0.08)",
                    border: active ? "1px solid rgba(255,255,255,0.45)" : "1px solid transparent",
                    opacity: done ? 0.75 : 1,
                  }}
                >
                  {r.name.length > 14 ? r.name.slice(0, 13) + "…" : r.name}
                  {" · "}
                  {answeredInSec}/{r.qCount}
                </div>
              );
            })}
          </div>
        )}

        {sectionFlash && (
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 12,
              color: "#f5d76e",
              padding: "4px 0 8px",
              textAlign: "center",
            }}
          >
            {sectionFlash}
          </div>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
          Q{qu.qNum}/{questions.length} · {qu.sectionName} · +{qu.marksEach}
          {pattern.negativeMark ? ` / −${pattern.negativeMark}` : ""}
          {qu.year ? ` · ${qu.year}-style` : ""}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 15, color: C.ink, lineHeight: 1.5, marginBottom: 14 }}>
          {qu.text}
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          {qu.options.map((opt, i) => {
            const selected = answers[qu.uid] === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers((p) => ({ ...p, [qu.uid]: i }))}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `2px solid ${selected ? C.blue : C.line}`,
                  background: selected ? C.softBlue : "#fff",
                  cursor: "pointer",
                  fontFamily: bodyFont,
                  fontSize: 13.5,
                  color: C.ink,
                }}
              >
                <span style={{ fontFamily: monoFont, fontWeight: 700, marginRight: 8 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 10,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 14px",
              minHeight: 48,
              borderRadius: 10,
              border: `2px solid ${C.ink}`,
              background: "#fff",
              color: C.ink,
              opacity: !canGoPrev ? 0.4 : 1,
              cursor: !canGoPrev ? "not-allowed" : "pointer",
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.5} /> Prev
          </button>
          <button
            onClick={() =>
              setFlagged((f) => {
                const n = { ...f };
                if (n[qu.uid]) delete n[qu.uid];
                else n[qu.uid] = true;
                return n;
              })
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 16px",
              minHeight: 48,
              borderRadius: 10,
              border: `2px solid ${flagged[qu.uid] ? C.yellow : C.ink}`,
              background: flagged[qu.uid] ? C.softYellow : "#fff",
              color: flagged[qu.uid] ? "#8a6200" : C.ink,
              cursor: "pointer",
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <Flag size={18} strokeWidth={2.5} fill={flagged[qu.uid] ? C.yellow : "none"} />
            {flagged[qu.uid] ? "Flagged" : "Flag"}
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 14px",
              minHeight: 48,
              borderRadius: 10,
              border: `2px solid ${C.ink}`,
              background: C.ink,
              color: "#fff",
              opacity: !canGoNext ? 0.4 : 1,
              cursor: !canGoNext ? "not-allowed" : "pointer",
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Next <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {locked && (
          <button
            type="button"
            onClick={finishSectionEarly}
            style={{
              width: "100%",
              marginBottom: 14,
              padding: "9px 12px",
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: C.softBlue,
              color: C.ink,
              cursor: "pointer",
              fontFamily: bodyFont,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {sectionIdx >= sectionRanges.length - 1
              ? "Finish last section & submit"
              : `Finish section → next (${sectionRanges[sectionIdx + 1]?.name || ""})`}
          </button>
        )}

        <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, marginBottom: 6 }}>
          QUESTION PALETTE
          {locked ? " · current section only" : ""}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {questions.map((item, i) => {
            const answered = answers[item.uid] != null;
            const isFlag = flagged[item.uid];
            const isCurrent = i === idx;
            const inCurrentSection =
              !currentRange || (i >= currentRange.start && i <= currentRange.end);
            const disabled = locked && !inCurrentSection;
            return (
              <button
                key={item.uid}
                onClick={() => jumpTo(i)}
                disabled={disabled}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: isCurrent ? `2px solid ${C.ink}` : `1px solid ${C.line}`,
                  background: isFlag ? C.softYellow : answered ? C.softGreen : C.bg,
                  fontFamily: monoFont,
                  fontSize: 11,
                  cursor: disabled ? "not-allowed" : "pointer",
                  color: disabled ? C.inkSoft : C.ink,
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 12, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
          {answeredCount}/{questions.length} answered overall
        </div>

        <button
          onClick={onAbort}
          style={{
            marginTop: 12,
            background: "transparent",
            border: "none",
            color: C.red,
            cursor: "pointer",
            fontFamily: bodyFont,
            fontSize: 12,
          }}
        >
          Abort test
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LOBBY
========================================================= */
function MockLobby({
  exam,
  selectedYear,
  onYearChange,
  onStart,
  mode,
  onModeChange,
  sectionId,
  onSectionChange,
}) {
  const pattern = EXAM_PATTERNS[exam.id] || EXAM_PATTERNS["ssc-cgl"];
  const isSectional = mode === "sectional";
  const activeSec = isSectional
    ? pattern.sections.find((s) => s.id === sectionId) || pattern.sections[0]
    : null;
  const totalQ =
    isSectional && activeSec
      ? Math.min(activeSec.qCount, Math.max(8, Math.round(activeSec.qCount * 0.5)))
      : pattern.sections.reduce((a, s) => a + s.qCount, 0);
  const maxMarks =
    isSectional && activeSec
      ? totalQ * activeSec.marksEach
      : pattern.sections.reduce((a, s) => a + s.qCount * s.marksEach, 0);
  const timerMin =
    isSectional && activeSec
      ? Math.max(8, Math.round((activeSec.timeMin || 15) * 0.6))
      : pattern.totalTimeMin;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <ListChecks size={20} color={C.ink} />
        <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 18, color: C.ink }}>
          {isSectional ? "Sectional short test" : "Full-length mock · year-wise"}
        </h2>
      </div>
      <p style={{ margin: "0 0 14px", fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
        Original practice items (not verbatim past papers). Progress saves to your account.
      </p>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
          Test type
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { id: "full", label: "Full mock" },
            { id: "sectional", label: "Sectional short" },
          ].map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                style={{
                  fontFamily: bodyFont,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : C.ink,
                  background: active ? C.ink : C.bg,
                  border: `1px solid ${active ? C.ink : C.line}`,
                  borderRadius: 20,
                  padding: "7px 14px",
                  cursor: "pointer",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {isSectional && pattern.sections.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
            Section
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pattern.sections.map((s) => {
              const active = (sectionId || pattern.sections[0].id) === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSectionChange(s.id)}
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : C.ink,
                    background: active ? C.blue : C.bg,
                    border: `1px solid ${active ? C.blue : C.line}`,
                    borderRadius: 20,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
          Select year (style)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {YEAR_OPTIONS.map((y) => {
            const active = selectedYear === y;
            return (
              <button
                key={String(y)}
                type="button"
                onClick={() => onYearChange(y)}
                style={{
                  fontFamily: bodyFont,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : C.ink,
                  background: active ? C.ink : C.bg,
                  border: `1px solid ${active ? C.ink : C.line}`,
                  borderRadius: 20,
                  padding: "7px 14px",
                  cursor: "pointer",
                }}
              >
                {y === "all" ? "All years" : y}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 14 }}>
        <div style={{ background: C.softBlue, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>QUESTIONS</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>{totalQ}</div>
        </div>
        <div style={{ background: C.softGreen, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>TIMER</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>{timerMin} min</div>
        </div>
        <div style={{ background: C.softYellow, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>MAX MARKS</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>{maxMarks}</div>
        </div>
        <div style={{ background: C.softRed, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>NEGATIVE</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>−{pattern.negativeMark}</div>
        </div>
      </div>

      <button
        onClick={onStart}
        style={{
          width: "100%",
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: C.ink,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 16px",
          cursor: "pointer",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <Play size={18} />{" "}
        {isSectional
          ? `Start ${activeSec?.name || "section"} short test`
          : selectedYear === "all"
            ? "Start full mock"
            : `Start ${selectedYear}-style full mock`}
      </button>
    </div>
  );
}

/* =========================================================
   MAIN EXPORT
========================================================= */
export default function PracticeTestSection({ exam, user }) {
  const [phase, setPhase] = useState("lobby");
  const [paper, setPaper] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");
  const [mode, setMode] = useState("full");
  const pattern = EXAM_PATTERNS[exam.id];
  const [sectionId, setSectionId] = useState(pattern?.sections?.[0]?.id || null);

  const start = () => {
    setPaper(
      buildPaper(exam.id, selectedYear, {
        mode,
        sectionId: mode === "sectional" ? sectionId : null,
      })
    );
    setResult(null);
    setPhase("live");
  };

  if (!pattern) {
    return (
      <div style={{ padding: 16, background: C.bg, borderRadius: 12, fontSize: 13, color: C.inkSoft }}>
        <BookOpen size={18} style={{ marginBottom: 6 }} />
        Mock pattern coming soon for this exam.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      {phase === "lobby" && (
        <MockLobby
          exam={exam}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onStart={start}
          mode={mode}
          onModeChange={(m) => {
            setMode(m);
            if (m === "sectional" && !sectionId) {
              setSectionId(pattern.sections[0]?.id || null);
            }
          }}
          sectionId={sectionId}
          onSectionChange={setSectionId}
        />
      )}
      {phase === "live" && paper && (
        <LiveTest
          exam={exam}
          paper={paper}
          onSubmit={({ answers, flagged, timeTakenSec }) => {
            setResult({ answers, flagged, timeTakenSec });
            setPhase("results");
          }}
          onAbort={() => {
            if (window.confirm("Leave test? Progress will be lost.")) setPhase("lobby");
          }}
        />
      )}
      {phase === "results" && paper && result && (
        <ResultsView
          exam={exam}
          pattern={paper.pattern}
          questions={paper.questions}
          answers={result.answers}
          flagged={result.flagged}
          timeTakenSec={result.timeTakenSec}
          userId={user?.uid}
          mode={paper.mode || mode}
          onRetry={start}
          onClose={() => setPhase("lobby")}
        />
      )}
    </div>
  );
}