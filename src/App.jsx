import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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
  Moon,
  Sun,
  TrendingUp,
  Trash2,
} from "lucide-react";

import { subscribeExams } from "./services/examService";
import { SEED_EXAMS } from "./data/seedExamsData";
import { subscribeStarred, toggleStarred } from "./services/starredService";
import {
  subscribeAttempts,
  deleteAttempt,
  deleteAllAttempts,
} from "./services/progressService";

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
  primary: "#14213d",
  onPrimary: "#ffffff",
};

const OMR_BG = `radial-gradient(circle, rgba(20,33,61,0.055) 1px, transparent 1px)`;
const OMR_BG_DARK = `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`;

const THEMES = {
  light: {
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
    primary: "#14213d",
    onPrimary: "#ffffff",
    omr: OMR_BG,
  },
  dark: {
    bg: "#0f1419",
    surface: "#1a2332",
    ink: "#e8eef8",
    inkSoft: "#8b9bb4",
    line: "#2a3548",
    red: "#e07070",
    green: "#5cb88a",
    yellow: "#e0b04a",
    blue: "#6b8fd4",
    softRed: "#3a2222",
    softGreen: "#1e3328",
    softBlue: "#1a2740",
    softYellow: "#3a3020",
    primary: "#243447",
    onPrimary: "#ffffff",
    omr: OMR_BG_DARK,
  },
};

/* =========================================================
   PROGRESS DASHBOARD (with delete)
========================================================= */
function ProgressDashboard({ attempts, colors, userId }) {
  const T = colors || C;

  const handleDeleteOne = async (id) => {
    if (!window.confirm("Delete this attempt?")) return;
    try {
      await deleteAttempt(id);
    } catch (err) {
      console.error(err);
      alert("Could not delete attempt.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete ALL your progress? This cannot be undone.")) return;
    try {
      await deleteAllAttempts(userId);
    } catch (err) {
      console.error(err);
      alert("Could not clear progress.");
    }
  };

  if (false) {   // temporary – always show the full UI 
    return (
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <TrendingUp size={20} color={T.ink} />
          <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 18, color: T.ink }}>
            Your progress
          </h2>
        </div>
        <p style={{ margin: 0, fontFamily: bodyFont, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
          Complete a full or sectional mock to see scores, accuracy, and weak sections here.
          Progress now syncs across all your devices.
        </p>
      </div>
    );
  }

  const avgPct =
    attempts.reduce((a, x) => a + (x.maxScore ? (x.score / x.maxScore) * 100 : 0), 0) /
    attempts.length;

  const weakMap = {};
  attempts.forEach((a) => {
    (a.weakSections || []).forEach((w) => {
      weakMap[w] = (weakMap[w] || 0) + 1;
    });
  });
  const topWeak = Object.entries(weakMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={20} color={T.ink} />
          <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 18, color: T.ink }}>
            Your progress
          </h2>
        </div>

        <button
          onClick={handleClearAll}
          style={{
            fontFamily: bodyFont,
            fontSize: 12,
            fontWeight: 600,
            color: T.red,
            background: T.softRed,
            border: "none",
            borderRadius: 7,
            padding: "6px 10px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div style={{ background: T.softBlue, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: T.inkSoft }}>MOCKS</div>
          <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700, color: T.ink }}>
            {attempts.length}
          </div>
        </div>
        <div style={{ background: T.softGreen, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: T.inkSoft }}>AVG %</div>
          <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700, color: T.ink }}>
            {Math.round(avgPct)}%
          </div>
        </div>
        <div style={{ background: T.softYellow, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: T.inkSoft }}>LAST SCORE</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700, color: T.ink }}>
            {attempts[0].score}/{attempts[0].maxScore}
          </div>
        </div>
      </div>

      {topWeak.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 10,
              color: T.inkSoft,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Often weak
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {topWeak.map(([name, n]) => (
              <span
                key={name}
                style={{
                  background: T.softRed,
                  color: T.red,
                  borderRadius: 16,
                  padding: "5px 10px",
                  fontFamily: bodyFont,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {name} ×{n}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          fontFamily: monoFont,
          fontSize: 10,
          color: T.inkSoft,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Recent attempts
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {attempts.slice(0, 8).map((a) => (
          <div
            key={a.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              padding: "8px 10px",
              background: T.bg,
              borderRadius: 8,
              fontFamily: bodyFont,
              fontSize: 12.5,
              color: T.ink,
            }}
          >
            <span>
              <strong>{a.examName}</strong>
              <span style={{ color: T.inkSoft }}>
                {" "}
                · {a.mode === "sectional" ? "sectional" : "full"}
              </span>
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: monoFont, fontWeight: 600 }}>
                {a.score}/{a.maxScore}
                <span style={{ color: T.inkSoft, fontWeight: 400 }}>
                  {" "}
                  · {a.at ? new Date(a.at).toLocaleDateString("en-IN") : ""}
                </span>
              </span>

              <button
                onClick={() => handleDeleteOne(a.id)}
                title="Delete this attempt"
                style={{
                  border: "none",
                  background: T.softRed,
                  color: T.red,
                  borderRadius: 6,
                  padding: "5px 7px",
                  cursor: "pointer",
                  display: "inline-flex",
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

  const examByDate = (() => {
    const map = {};
    (exams || []).forEach((e) => {
      if (!e.examDate) return;
      const key = e.examDate;
      if (!map[key]) map[key] = [];
      map[key].push(e.shortName);
    });
    return map;
  })();

  const dateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const examsOnSelected = examByDate[dateKey(selectedDate)] || [];
  const brand = C.primary || "#14213d";
  const onBrand = C.onPrimary || "#fff";

  return (
    <div
      style={{
        marginBottom: 18,
        background: brand,
        color: onBrand,
        borderRadius: 14,
        padding: "22px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -25,
          top: -35,
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.12)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
            <Ticket size={27} />
            <div style={{ fontFamily: displayFont, fontSize: 27, fontWeight: 700 }}>Hall Pass</div>
          </div>
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 13,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 430,
            }}
          >
            Your simple dashboard for tracking important competitive exams.
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            textAlign: "center",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "9px 12px",
          }}
        >
          <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700 }}>{trackedCount}</div>
          <div style={{ fontFamily: bodyFont, fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
            TRACKED
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowCalendar(!showCalendar)}
        style={{
          marginTop: 18,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "11px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          cursor: "pointer",
          fontFamily: bodyFont,
          fontWeight: 600,
        }}
      >
        <CalendarDays size={18} />
        {showCalendar ? "Hide Calendar" : "Open full month calendar"}
      </button>

      {showCalendar && (
        <div
          style={{
            marginTop: 15,
            background: "#fff",
            borderRadius: 12,
            padding: 14,
            color: "#111",
            position: "relative",
            zIndex: 2,
          }}
        >
          <style>{`
            .hp-cal {
              width: 100% !important;
              max-width: 100%;
              border: none !important;
              font-family: ${bodyFont};
              background: transparent !important;
            }
            .hp-cal .react-calendar__navigation {
              display: flex;
              margin-bottom: 10px;
              height: 44px;
            }
            .hp-cal .react-calendar__navigation button {
              min-width: 44px;
              background: ${C.bg};
              border: 1px solid ${C.line};
              border-radius: 8px;
              color: ${C.ink};
              font-weight: 600;
              font-size: 14px;
            }
            .hp-cal .react-calendar__navigation button:enabled:hover {
              background: ${C.softBlue};
            }
            .hp-cal .react-calendar__navigation__label {
              font-family: ${displayFont};
              font-weight: 700;
              font-size: 16px !important;
              color: ${C.ink};
              flex-grow: 1;
            }
            .hp-cal .react-calendar__month-view__weekdays {
              text-align: center;
              text-transform: uppercase;
              font-size: 11px;
              font-weight: 600;
              color: ${C.inkSoft};
              margin-bottom: 4px;
            }
            .hp-cal .react-calendar__month-view__weekdays__weekday {
              padding: 8px 0;
            }
            .hp-cal .react-calendar__month-view__weekdays__weekday abbr {
              text-decoration: none;
            }
            .hp-cal .react-calendar__tile {
              max-width: 100%;
              padding: 10px 4px;
              min-height: 48px;
              background: none;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              color: ${C.ink};
              position: relative;
            }
            .hp-cal .react-calendar__tile:enabled:hover {
              background: ${C.softBlue};
            }
            .hp-cal .react-calendar__tile--now {
              background: ${C.softYellow};
              font-weight: 700;
            }
            .hp-cal .react-calendar__tile--active {
              background: ${C.ink} !important;
              color: #fff !important;
            }
            .hp-cal .react-calendar__month-view__days__day--neighboringMonth {
              color: ${C.inkSoft};
              opacity: 0.45;
            }
            .hp-cal-dot {
              display: block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${C.red};
              margin: 3px auto 0;
            }
            .hp-cal .react-calendar__tile--active .hp-cal-dot {
              background: #f4c64e;
            }
          `}</style>
          <Calendar
            className="hp-cal"
            value={selectedDate}
            onChange={setSelectedDate}
            calendarType="gregory"
            showNeighboringMonth
            next2Label={null}
            prev2Label={null}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const key = dateKey(date);
              if (!examByDate[key]) return null;
              return <span className="hp-cal-dot" title={examByDate[key].join(", ")} />;
            }}
          />
          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontFamily: bodyFont,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            {selectedDate.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          {examsOnSelected.length > 0 ? (
            <div
              style={{
                marginTop: 8,
                textAlign: "center",
                fontFamily: monoFont,
                fontSize: 13,
                color: C.red,
                fontWeight: 600,
              }}
            >
              Exam day: {examsOnSelected.join(" · ")}
            </div>
          ) : (
            <div
              style={{
                marginTop: 6,
                textAlign: "center",
                fontFamily: bodyFont,
                fontSize: 12,
                color: C.inkSoft,
              }}
            >
              No tracked exam on this date. Red dots mark exam days.
            </div>
          )}
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
    <div
      className="hp-card"
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: 16,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 10,
              textTransform: "uppercase",
              color: C.inkSoft,
              marginBottom: 5,
            }}
          >
            {exam.category}
          </div>
          <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: C.ink }}>
            {exam.shortName}
          </div>
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 12.5,
              color: C.inkSoft,
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {exam.name}
          </div>
        </div>

        <button
          className="hp-tap"
          onClick={() => onToggleStar(exam.id)}
          aria-label={starred ? `Unstar ${exam.shortName}` : `Star ${exam.shortName}`}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: starred ? C.yellow : C.inkSoft,
            padding: 0,
          }}
        >
          <Star size={20} fill={starred ? C.yellow : "none"} />
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, margin: "14px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 9.5,
              color: C.inkSoft,
              textTransform: "uppercase",
            }}
          >
            Exam date
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 3 }}>
            {formatDate(exam.examDate)}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 9.5,
              color: C.inkSoft,
              textTransform: "uppercase",
            }}
          >
            Countdown
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 13,
              fontWeight: 600,
              color: dl <= 14 ? C.red : dl <= 30 ? C.yellow : C.green,
              marginTop: 3,
            }}
          >
            {getCountdownText(dl)}
          </div>
        </div>
      </div>

      <button
        onClick={() => onOpen(exam.id)}
        style={{
          width: "100%",
          marginTop: 15,
          border: `1px solid ${C.line}`,
          background: C.bg,
          color: C.ink,
          borderRadius: 8,
          padding: "8px 10px",
          cursor: "pointer",
          fontFamily: bodyFont,
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        View exam details
      </button>
    </div>
  );
}

/* =========================================================
   SYLLABUS PANEL
========================================================= */
function SyllabusPanel({ exam }) {
  const stages = exam.syllabus || [];
  const [openKey, setOpenKey] = useState(() =>
    stages.length && stages[0].papers?.length ? `${stages[0].stage}-0` : null
  );

  if (stages.length === 0) return null;

  return (
    <section style={{ marginBottom: 22 }}>
      <h2
        style={{
          fontFamily: displayFont,
          fontSize: 18,
          margin: "0 0 8px",
          color: C.ink,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <List size={18} color={C.inkSoft} />
        Syllabus breakdown
      </h2>
      <div style={{ fontFamily: bodyFont, fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>
        Official topic outlines by stage. Always cross-check the latest notification on the official site.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.map((stage) =>
          stage.papers.map((paper, pi) => {
            const key = `${stage.stage}-${pi}`;
            const isOpen = openKey === key;
            return (
              <div
                key={key}
                style={{
                  border: `1px solid ${C.line}`,
                  overflow: "hidden",
                  background: C.surface,
                  borderRadius: 10,
                }}
              >
                <button
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className="hp-tap"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    background: C.bg,
                    border: "none",
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: monoFont,
                        fontSize: 10,
                        color: C.inkSoft,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      {stage.stage}
                    </div>
                    <div
                      style={{
                        fontFamily: bodyFont,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: C.ink,
                        marginTop: 2,
                      }}
                    >
                      {paper.name}
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    color={C.inkSoft}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform .15s",
                      flexShrink: 0,
                    }}
                  />
                </button>
                {isOpen && (
                  <ul style={{ margin: 0, padding: "8px 14px 12px 28px", background: "#fff" }}>
                    {paper.topics.map((t, ti) => (
                      <li
                        key={ti}
                        style={{
                          fontFamily: bodyFont,
                          fontSize: 12.5,
                          color: C.inkSoft,
                          lineHeight: 1.55,
                          marginTop: ti === 0 ? 0 : 6,
                        }}
                      >
                        {t}
                      </li>
                    ))}
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
        <ChevronLeft size={17} />
        Back to exams
      </button>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 20,
            background: C.primary || "#14213d",
            color: C.onPrimary || "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 15,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 10,
                  textTransform: "uppercase",
                  opacity: 0.65,
                  marginBottom: 6,
                }}
              >
                {exam.category}
              </div>
              <h1 style={{ fontFamily: displayFont, fontSize: 30, lineHeight: 1.1, margin: 0 }}>
                {exam.shortName}
              </h1>
              <div style={{ fontFamily: bodyFont, fontSize: 13, opacity: 0.75, marginTop: 6 }}>
                {exam.name}
              </div>
            </div>

            <button
              onClick={() => onToggleStar(exam.id)}
              aria-label={starred ? "Remove from starred" : "Add to starred"}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div style={{ background: C.softBlue, borderRadius: 10, padding: 12 }}>
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 9,
                  color: C.inkSoft,
                  textTransform: "uppercase",
                }}
              >
                Exam date
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink,
                  marginTop: 4,
                }}
              >
                {formatDate(exam.examDate)}
              </div>
            </div>
            <div
              style={{
                background: dl <= 14 ? C.softRed : C.softGreen,
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 9,
                  color: C.inkSoft,
                  textTransform: "uppercase",
                }}
              >
                Countdown
              </div>
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 14,
                  fontWeight: 700,
                  color: dl <= 14 ? C.red : C.green,
                  marginTop: 4,
                }}
              >
                {getCountdownText(dl)}
              </div>
            </div>
          </div>

          {(exam.lastVerified || exam.source) && (
            <div
              style={{
                background: C.softGreen,
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 18,
                fontFamily: bodyFont,
                fontSize: 12.5,
                color: C.ink,
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: C.green }}>✓ Verified data</strong>
              {exam.lastVerified && (
                <span style={{ color: C.inkSoft }}>
                  {" "}
                  · Last checked {formatDate(exam.lastVerified)}
                </span>
              )}
              {exam.source && (
                <div style={{ marginTop: 4, color: C.inkSoft, fontSize: 12 }}>
                  Source: {exam.source}
                  {exam.sourceUrl && (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={exam.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: C.blue }}
                      >
                        Official link
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 8px", color: C.ink }}>
              About the exam
            </h2>
            <p
              style={{
                fontFamily: bodyFont,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: C.inkSoft,
                margin: 0,
              }}
            >
              {exam.description}
            </p>
          </section>

          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 10px", color: C.ink }}>
              Eligibility
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="hp-eligibility-row">
                <strong
                  className="hp-eligibility-label"
                  style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.ink }}
                >
                  Education
                </strong>
                <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>
                  {exam.eligibility?.education}
                </span>
              </div>
              <div className="hp-eligibility-row">
                <strong
                  className="hp-eligibility-label"
                  style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.ink }}
                >
                  Age
                </strong>
                <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>
                  {exam.eligibility?.age}
                </span>
              </div>
              <div className="hp-eligibility-row">
                <strong
                  className="hp-eligibility-label"
                  style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.ink }}
                >
                  Attempts
                </strong>
                <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft }}>
                  {exam.eligibility?.attempts}
                </span>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 10px", color: C.ink }}>
              Selection process
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(exam.stages || []).map((stage, index) => (
                <div
                  key={stage}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontFamily: bodyFont,
                    fontSize: 13,
                    color: C.inkSoft,
                  }}
                >
                  <span
                    style={{
                      width: 23,
                      height: 23,
                      borderRadius: "50%",
                      background: C.ink,
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: monoFont,
                      fontSize: 10,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  {stage}
                </div>
              ))}
            </div>
          </section>

          <SyllabusPanel exam={exam} />

          <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              <a
                href={exam.officialWebsite}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: C.primary || C.ink,
                  color: C.onPrimary || "#fff",
                  textDecoration: "none",
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontFamily: bodyFont,
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Official website
                <ExternalLink size={14} />
              </a>
              <a
                href={exam.notificationUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: C.bg,
                  color: C.ink,
                  textDecoration: "none",
                  border: `1px solid ${C.line}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontFamily: bodyFont,
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Previous year papers
                <FileText size={14} />
              </a>
            </div>
            <p
              style={{
                marginTop: 10,
                fontFamily: bodyFont,
                fontSize: 11.5,
                color: C.inkSoft,
                lineHeight: 1.45,
              }}
            >
              Official previous papers open on the exam authority’s site. Hall Pass mocks use original
              practice items — not copied past papers.
            </p>
          </section>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <PracticeTestSection exam={exam} user={user} colors={C} />
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

  // Exams from Firestore
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examsError, setExamsError] = useState(null);

  // Starred (cloud)
  const [starred, setStarred] = useState(new Set());
  const [starLoaded, setStarLoaded] = useState(false);

  // Attempts / progress (cloud)
  const [attempts, setAttempts] = useState([]);

  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("hallpass-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const T = THEMES[theme] || THEMES.light;

  // Apply theme colors
  Object.assign(C, {
    bg: T.bg,
    surface: T.surface,
    ink: T.ink,
    inkSoft: T.inkSoft,
    line: T.line,
    red: T.red,
    green: T.green,
    yellow: T.yellow,
    blue: T.blue,
    softRed: T.softRed,
    softGreen: T.softGreen,
    softBlue: T.softBlue,
    softYellow: T.softYellow,
    primary: T.primary,
    onPrimary: T.onPrimary,
  });

  useEffect(() => {
    try {
      localStorage.setItem("hallpass-theme", theme);
    } catch (_) {}
    document.documentElement.setAttribute("data-hp-theme", theme);
    document.body.style.background = T.bg;
    document.body.style.color = T.ink;
  }, [theme, T]);

  // Notes
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [noteSearch, setNoteSearch] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("");

  /* =======================================================
     AUTH
  ======================================================= */
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      },
      (error) => {
        console.error("Firebase auth state error:", error);
        setUser(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  /* =======================================================
     EXAMS
  ======================================================= */
  useEffect(() => {
    setExamsLoading(true);
    setExamsError(null);

    const unsub = subscribeExams(
      (list) => {
        if (!list || list.length === 0) {
          console.warn("No exams in Firestore yet — using seed data as fallback");
          setExams(SEED_EXAMS);
        } else {
          setExams(list);
        }
        setExamsLoading(false);
      },
      (err) => {
        console.error("Exams listener error:", err);
        setExamsError("Could not load exams. Using offline seed data.");
        setExams(SEED_EXAMS);
        setExamsLoading(false);
      }
    );

    return () => unsub();
  }, []);

  /* =======================================================
     STARRED (cloud)
  ======================================================= */
  useEffect(() => {
    if (!user) {
      setStarred(new Set());
      setStarLoaded(false);
      return;
    }

    setStarLoaded(false);
    const unsub = subscribeStarred(
      user.uid,
      (ids) => {
        setStarred(ids);
        setStarLoaded(true);
      },
      (err) => {
        console.error("Starred load error:", err);
        setStarLoaded(true);
      }
    );
    return () => unsub();
  }, [user]);

  /* =======================================================
     ATTEMPTS / PROGRESS (cloud)
  ======================================================= */
  useEffect(() => {
    if (!user) {
      setAttempts([]);
      return;
    }

    const unsub = subscribeAttempts(
      user.uid,
      (list) => setAttempts(list),
      (err) => console.error("Attempts load error:", err)
    );
    return () => unsub();
  }, [user]);

  /* =======================================================
     NOTES
  ======================================================= */
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setNotesLoading(false);
      setNotesError(null);
      return;
    }

    setNotesLoading(true);
    setNotesError(null);

    let unsubscribe = () => {};
    try {
      const notesRef = collection(db, "notes");
      const notesQuery = firestoreQuery(notesRef, where("userId", "==", user.uid));

      unsubscribe = onSnapshot(
        notesQuery,
        (snapshot) => {
          const loadedNotes = snapshot.docs
            .map((noteDoc) => ({ id: noteDoc.id, ...noteDoc.data() }))
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return bTime - aTime;
            });
          setNotes(loadedNotes);
          setNotesLoading(false);
          setNotesError(null);
        },
        (error) => {
          console.error("Error loading notes:", error);
          setNotesError(
            error.code === "permission-denied"
              ? "Can't load notes — check Firestore security rules for the 'notes' collection."
              : "Can't load notes right now. Check your connection and try again."
          );
          setNotesLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up notes listener:", error);
      setNotesError("Can't load notes right now. Please refresh the page.");
      setNotesLoading(false);
    }

    return () => unsubscribe();
  }, [user]);

  const saveNote = async () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    if (!noteTitle.trim() && !noteContent.trim()) {
      alert("Please enter a title or note content.");
      return;
    }

    try {
      const tags = noteTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingNote) {
        await updateDoc(doc(db, "notes", editingNote), {
          title: noteTitle.trim(),
          content: noteContent.trim(),
          tags,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "notes"), {
          userId: user.uid,
          title: noteTitle.trim(),
          content: noteContent.trim(),
          tags,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setNoteTitle("");
      setNoteContent("");
      setNoteTags("");
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Could not save the note. Please try again.");
    }
  };

  const deleteNote = async (noteId) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteDoc(doc(db, "notes", noteId));

      if (editingNote === noteId) {
        setEditingNote(null);
        setNoteTitle("");
        setNoteContent("");
        setNoteTags("");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Could not delete the note.");
    }
  };

  /* =======================================================
     TOGGLE STAR (cloud)
  ======================================================= */
  const toggleStar = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await toggleStarred(user.uid, id);
      } catch (err) {
        console.error("Toggle star failed:", err);
        alert("Could not update starred status. Check connection / rules.");
      }
    },
    [user]
  );

  const categories = ["All", ...Array.from(new Set(exams.map((e) => e.category)))];

  const filtered = exams.filter((exam) => {
    const searchText = query.trim().toLowerCase();
    const matchesSearch =
      searchText === "" ||
      exam.shortName.toLowerCase().includes(searchText) ||
      exam.name.toLowerCase().includes(searchText) ||
      exam.category.toLowerCase().includes(searchText);
    const matchesCategory = category === "All" || exam.category === category;
    return matchesSearch && matchesCategory;
  });

  const starredExams = exams
    .filter((exam) => starred.has(exam.id))
    .sort((a, b) => daysLeft(a.examDate) - daysLeft(b.examDate));

  const selectedExam = exams.find((exam) => exam.id === selectedId);

  const filteredNotes = notes.filter((note) => {
    const search = noteSearch.trim().toLowerCase();
    if (!search) return true;
    return (
      note.title?.toLowerCase().includes(search) ||
      note.content?.toLowerCase().includes(search) ||
      note.tags?.some((tag) => tag.toLowerCase().includes(search))
    );
  });

  const startEditingNote = (note) => {
    setEditingNote(note.id);
    setNoteTitle(note.title || "");
    setNoteContent(note.content || "");
    setNoteTags(Array.isArray(note.tags) ? note.tags.join(", ") : "");
    setShowNotes(true);
  };

  /* =======================================================
     LOADING
  ======================================================= */
  if (authLoading || examsLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.bg,
          fontFamily: bodyFont,
          color: C.ink,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Ticket size={42} color={C.ink} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontFamily: displayFont, fontSize: 24, fontWeight: 700 }}>Hall Pass</div>
          <div style={{ marginTop: 6, color: C.inkSoft, fontSize: 13 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  /* =======================================================
     APP
  ======================================================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `${T.omr}, ${C.bg}`,
        backgroundSize: "18px 18px, auto",
        fontFamily: bodyFont,
        padding: "clamp(18px, 5vw, 28px) clamp(12px, 4vw, 16px) 60px",
        color: C.ink,
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        button, input { font: inherit; }
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
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <HeroPass trackedCount={starred.size} exams={exams} />

        {/* User bar */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "9px 12px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 12.5,
              color: C.inkSoft,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 120,
            }}
          >
            Signed in as <strong style={{ color: C.ink }}>{user.email}</strong>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: bodyFont,
                fontSize: 12,
                fontWeight: 600,
                color: C.ink,
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 7,
                padding: "6px 11px",
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              onClick={async () => {
                try {
                  await signOut(auth);
                } catch (e) {
                  console.error(e);
                }
              }}
              style={{
                fontFamily: bodyFont,
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                background: C.red,
                border: "none",
                borderRadius: 7,
                padding: "6px 11px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {examsError && (
          <div
            style={{
              background: C.softYellow,
              color: C.ink,
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 16,
              fontFamily: bodyFont,
              fontSize: 13,
            }}
          >
            {examsError}
          </div>
        )}

        {view !== "detail" && (
          <ProgressDashboard attempts={attempts} colors={C} userId={user.uid} />
        )}

        {view === "detail" && selectedExam ? (
          <ExamDetail
            exam={selectedExam}
            starred={starred.has(selectedExam.id)}
            onToggleStar={toggleStar}
            user={user}
            onBack={() => {
              setView("home");
              setSelectedId(null);
            }}
          />
        ) : (
          <>
            {/* Starred */}
            {starLoaded && starredExams.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontSize: 11,
                    color: C.inkSoft,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  ★ Your starred exams
                </div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                  {starredExams.map((exam) => {
                    const dl = daysLeft(exam.examDate);
                    return (
                      <button
                        key={exam.id}
                        onClick={() => {
                          setSelectedId(exam.id);
                          setView("detail");
                        }}
                        style={{
                          flexShrink: 0,
                          fontFamily: bodyFont,
                          fontSize: 12.5,
                          color: C.ink,
                          background: C.surface,
                          border: `1px solid ${C.line}`,
                          borderRadius: 20,
                          padding: "6px 12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {exam.shortName}
                        <span
                          style={{
                            fontFamily: monoFont,
                            color: dl <= 14 ? C.red : C.green,
                            fontWeight: 600,
                          }}
                        >
                          {dl}d
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
                background: C.surface,
                border: `1px solid ${C.line}`,
                borderRadius: 10,
                padding: "9px 12px",
              }}
            >
              <Search size={16} color={C.inkSoft} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exams — UPSC, SSC, JEE…"
                aria-label="Search exams"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: bodyFont,
                  fontSize: 13.5,
                  color: C.ink,
                  width: "100%",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: C.inkSoft,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  style={{
                    flexShrink: 0,
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    fontWeight: category === item ? 600 : 400,
                    color: category === item ? "#fff" : C.inkSoft,
                    background: category === item ? C.ink : C.surface,
                    border: `1px solid ${category === item ? C.ink : C.line}`,
                    borderRadius: 20,
                    padding: "6px 13px",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Notes Dashboard */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.line}`,
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={20} color={C.ink} />
                    <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 20, color: C.ink }}>
                      My Notes
                    </h2>
                  </div>
                  <div style={{ marginTop: 4, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
                    Save and sync your exam notes with your account.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNotes(!showNotes);
                    if (showNotes) {
                      setEditingNote(null);
                      setNoteTitle("");
                      setNoteContent("");
                      setNoteTags("");
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "none",
                    borderRadius: 8,
                    background: C.ink,
                    color: "#fff",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontFamily: bodyFont,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <FileText size={15} />
                  {showNotes ? "Close" : "Open Notes"}
                </button>
              </div>

              {showNotes && (
                <>
                  {notesError && (
                    <div
                      style={{
                        background: C.softRed,
                        color: C.red,
                        border: `1px solid ${C.red}55`,
                        borderRadius: 9,
                        padding: "9px 11px",
                        marginBottom: 14,
                        fontFamily: bodyFont,
                        fontSize: 12.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {notesError}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: C.bg,
                      border: `1px solid ${C.line}`,
                      borderRadius: 9,
                      padding: "8px 10px",
                      marginBottom: 14,
                    }}
                  >
                    <Search size={15} color={C.inkSoft} />
                    <input
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      placeholder="Search your notes..."
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        width: "100%",
                        fontFamily: bodyFont,
                        fontSize: 13,
                        color: C.ink,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      background: C.softBlue,
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: displayFont,
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.ink,
                        marginBottom: 10,
                      }}
                    >
                      {editingNote ? "Edit Note" : "Create a Note"}
                    </div>
                    <input
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note title"
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        border: `1px solid ${C.line}`,
                        borderRadius: 8,
                        marginBottom: 8,
                        background: "#fff",
                        color: C.ink,
                      }}
                    />
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your notes here..."
                      rows={5}
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        border: `1px solid ${C.line}`,
                        borderRadius: 8,
                        resize: "vertical",
                        background: "#fff",
                        color: C.ink,
                        fontFamily: bodyFont,
                        marginBottom: 8,
                      }}
                    />
                    <input
                      value={noteTags}
                      onChange={(e) => setNoteTags(e.target.value)}
                      placeholder="Tags: GATE, DSA, Maths"
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        border: `1px solid ${C.line}`,
                        borderRadius: 8,
                        marginBottom: 10,
                        background: "#fff",
                        color: C.ink,
                      }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={saveNote}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          border: "none",
                          borderRadius: 8,
                          background: C.green,
                          color: "#fff",
                          padding: "8px 13px",
                          cursor: "pointer",
                          fontFamily: bodyFont,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Save size={15} />
                        {editingNote ? "Update Note" : "Save Note"}
                      </button>
                      {editingNote && (
                        <button
                          onClick={() => {
                            setEditingNote(null);
                            setNoteTitle("");
                            setNoteContent("");
                            setNoteTags("");
                          }}
                          style={{
                            border: `1px solid ${C.line}`,
                            borderRadius: 8,
                            background: "#fff",
                            color: C.ink,
                            padding: "8px 13px",
                            cursor: "pointer",
                            fontFamily: bodyFont,
                            fontSize: 12,
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: monoFont,
                      fontSize: 10,
                      color: C.inkSoft,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    {filteredNotes.length} {filteredNotes.length === 1 ? "NOTE" : "NOTES"}
                  </div>

                  {notesLoading ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 25,
                        color: C.inkSoft,
                        fontFamily: bodyFont,
                        fontSize: 13,
                      }}
                    >
                      Loading your notes...
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 25,
                        border: `1px dashed ${C.line}`,
                        borderRadius: 10,
                        color: C.inkSoft,
                        fontFamily: bodyFont,
                        fontSize: 13,
                      }}
                    >
                      <BookOpen size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>
                        No notes yet
                      </div>
                      <div>Create your first exam note above.</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {filteredNotes.map((note) => (
                        <div
                          key={note.id}
                          style={{
                            border: `1px solid ${C.line}`,
                            borderRadius: 10,
                            padding: 13,
                            background: "#fff",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 10,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontFamily: displayFont,
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: C.ink,
                                }}
                              >
                                {note.title || "Untitled Note"}
                              </div>
                              <div
                                style={{
                                  marginTop: 6,
                                  fontFamily: bodyFont,
                                  fontSize: 13,
                                  lineHeight: 1.5,
                                  color: C.inkSoft,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {note.content}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                              <button
                                onClick={() => startEditingNote(note)}
                                style={{
                                  border: `1px solid ${C.line}`,
                                  background: C.bg,
                                  borderRadius: 7,
                                  padding: "6px 8px",
                                  cursor: "pointer",
                                  color: C.ink,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                style={{
                                  border: "none",
                                  background: C.softRed,
                                  borderRadius: 7,
                                  padding: "6px 8px",
                                  cursor: "pointer",
                                  color: C.red,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {Array.isArray(note.tags) && note.tags.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                              {note.tags.map((tag) => (
                                <span
                                  key={tag}
                                  style={{
                                    background: C.softYellow,
                                    color: C.ink,
                                    borderRadius: 20,
                                    padding: "4px 8px",
                                    fontFamily: monoFont,
                                    fontSize: 9,
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cloud Files */}
            <CloudFiles user={user} />

            {/* Results count */}
            <div
              style={{
                fontFamily: monoFont,
                fontSize: 10.5,
                color: C.inkSoft,
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              {filtered.length} {filtered.length === 1 ? "exam" : "exams"} found
            </div>

            {/* Exam cards */}
            {filtered.length === 0 ? (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  fontFamily: bodyFont,
                  fontSize: 13.5,
                  color: C.inkSoft,
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                <Search size={30} style={{ marginBottom: 10, opacity: 0.45 }} />
                <div style={{ fontWeight: 600, color: C.ink, marginBottom: 5 }}>No exams found</div>
                <div>
                  No exams match "{query}". Try a different search or category.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
                }}
              >
                {filtered.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    starred={starred.has(exam.id)}
                    onToggleStar={toggleStar}
                    onOpen={(id) => {
                      setSelectedId(id);
                      setView("detail");
                    }}
                  />
                ))}
              </div>
            )}

            <div
              style={{
                fontFamily: bodyFont,
                fontSize: 11.5,
                color: C.inkSoft,
                textAlign: "center",
                marginTop: 28,
                lineHeight: 1.5,
              }}
            >
              Exam data, starred list and progress are loaded from Firestore.
              <br />
              Everything syncs across your devices.
            </div>
          </>
        )}
      </div>
    </div>
  );
}