import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Auth from "./Auth";
import { auth } from "./firebase";

import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  Search,
  Star,
  ExternalLink,
  ChevronLeft,
  FileText,
  BookOpen,
  Ticket,
  Save,
  Archive,
  ChevronDown,
  ShieldCheck,
  Download,
  CalendarDays,
} from "lucide-react";

/* =========================================================
   FONTS
========================================================= */

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";
const monoFont = "'IBM Plex Mono', monospace";

/* =========================================================
   COLORS
========================================================= */

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

/* =========================================================
   BACKGROUND
========================================================= */

const OMR_BG = `
  radial-gradient(circle, rgba(20,33,61,0.055) 1px, transparent 1px)
`;

/* =========================================================
   EXAM DATA
   Replace / expand this list with your actual exam data.
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

    description:
      "India's premier civil services examination conducted by the Union Public Service Commission.",

    eligibility: {
      education: "Graduate degree",
      age: "21–32 years",
      attempts: "Varies by category",
    },

    stages: [
      "Preliminary Examination",
      "Main Examination",
      "Personality Test",
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

    description:
      "A major recruitment examination for Group B and Group C posts in the Government of India.",

    eligibility: {
      education: "Graduate degree",
      age: "18–32 years depending on post",
      attempts: "No fixed attempt limit",
    },

    stages: [
      "Tier-I",
      "Tier-II",
      "Document Verification",
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

    description:
      "A national-level entrance examination for undergraduate engineering and related programs.",

    eligibility: {
      education: "Class 12 or equivalent",
      age: "No specific age limit",
      attempts: "As specified by NTA",
    },

    stages: [
      "Computer Based Test",
      "Result",
      "Counselling",
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

    description:
      "A national examination used for postgraduate admissions and recruitment opportunities in engineering and science.",

    eligibility: {
      education: "Undergraduate degree or currently pursuing eligible degree",
      age: "No age limit",
      attempts: "No attempt limit",
    },

    stages: [
      "Computer Based Test",
      "Score",
      "Admission / Recruitment",
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

    description:
      "A national-level management entrance examination primarily used by IIMs and other business schools.",

    eligibility: {
      education: "Bachelor's degree",
      age: "No age limit",
      attempts: "No attempt limit",
    },

    stages: [
      "Computer Based Test",
      "Shortlisting",
      "Further admission process",
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

    description:
      "The national entrance examination for undergraduate medical education in India.",

    eligibility: {
      education: "10+2 with required subjects",
      age: "As specified by NTA",
      attempts: "As specified by NTA",
    },

    stages: [
      "Entrance Examination",
      "Result",
      "Counselling",
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

  const difference = examDate.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCountdownText(days) {
  if (days < 0) {
    return "Exam completed";
  }

  if (days === 0) {
    return "Today";
  }

  if (days === 1) {
    return "1 day left";
  }

  return `${days} days left`;
}

/* =========================================================
   HERO
========================================================= */
function HeroPass({ trackedCount }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div
      style={{
        marginBottom: 18,
        background: C.ink,
        color: "#fff",
        borderRadius: 14,
        padding: "22px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circle */}
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

      {/* Top Section */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 7,
            }}
          >
            <Ticket size={27} />

            <div
              style={{
                fontFamily: displayFont,
                fontSize: 27,
                fontWeight: 700,
              }}
            >
              Hall Pass
            </div>
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

        {/* Tracked Counter */}
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
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {trackedCount}
          </div>

          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 10,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            TRACKED
          </div>
        </div>
      </div>

      {/* Calendar Button */}
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
        {showCalendar ? "Hide Calendar" : "Open Calendar"}
      </button>

      {/* Calendar */}
      {showCalendar && (
        <div
          style={{
            marginTop: 15,
            background: "#fff",
            borderRadius: 12,
            padding: 12,
            color: "#111",
          }}
        >
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
          />

          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              fontFamily: bodyFont,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            Selected Date
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 4,
              fontFamily: monoFont,
              color: C.green,
              fontSize: 15,
            }}
          >
            {selectedDate.toDateString()}
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   EXAM CARD
========================================================= */

function ExamCard({
  exam,
  starred,
  onToggleStar,
  onOpen,
}) {
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
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

          <div
            style={{
              fontFamily: displayFont,
              fontSize: 20,
              fontWeight: 700,
              color: C.ink,
            }}
          >
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
          aria-label={
            starred
              ? `Unstar ${exam.shortName}`
              : `Star ${exam.shortName}`
          }
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: starred ? C.yellow : C.inkSoft,
            padding: 0,
          }}
        >
          <Star
            size={20}
            fill={starred ? C.yellow : "none"}
          />
        </button>
      </div>

      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          margin: "14px 0",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
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

          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 13,
              fontWeight: 600,
              color: C.ink,
              marginTop: 3,
            }}
          >
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
              color:
                dl <= 14
                  ? C.red
                  : dl <= 30
                  ? C.yellow
                  : C.green,
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
   EXAM DETAIL
========================================================= */

function ExamDetail({
  exam,
  starred,
  onToggleStar,
  onBack,
}) {
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
            background: C.ink,
            color: "#fff",
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

              <h1
                style={{
                  fontFamily: displayFont,
                  fontSize: 30,
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {exam.shortName}
              </h1>

              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 13,
                  opacity: 0.75,
                  marginTop: 6,
                }}
              >
                {exam.name}
              </div>
            </div>

            <button
              onClick={() => onToggleStar(exam.id)}
              aria-label={
                starred
                  ? "Remove from starred"
                  : "Add to starred"
              }
              style={{
                border: "none",
                background: "rgba(255,255,255,0.1)",
                color: starred ? "#f4c64e" : "#fff",
                borderRadius: 9,
                padding: 9,
                cursor: "pointer",
              }}
            >
              <Star
                size={22}
                fill={starred ? "#f4c64e" : "none"}
              />
            </button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: C.softBlue,
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
                background:
                  dl <= 14
                    ? C.softRed
                    : C.softGreen,
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
                  color:
                    dl <= 14
                      ? C.red
                      : C.green,
                  marginTop: 4,
                }}
              >
                {getCountdownText(dl)}
              </div>
            </div>
          </div>

          <section style={{ marginBottom: 22 }}>
            <h2
              style={{
                fontFamily: displayFont,
                fontSize: 18,
                margin: "0 0 8px",
                color: C.ink,
              }}
            >
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
            <h2
              style={{
                fontFamily: displayFont,
                fontSize: 18,
                margin: "0 0 10px",
                color: C.ink,
              }}
            >
              Eligibility
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div className="hp-eligibility-row">
                <strong
                  className="hp-eligibility-label"
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    color: C.ink,
                  }}
                >
                  Education
                </strong>

                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    color: C.inkSoft,
                  }}
                >
                  {exam.eligibility.education}
                </span>
              </div>

              <div className="hp-eligibility-row">
                <strong
                  className="hp-eligibility-label"
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    color: C.ink,
                  }}
                >
                  Age
                </strong>

                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    color: C.inkSoft,
                  }}
                >
                  {exam.eligibility.age}
                </span>
              </div>

              <div className="hp-eligibility-row">
                <strong
                  className="hp-eligibility-label"
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    color: C.ink,
                  }}
                >
                  Attempts
                </strong>

                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    color: C.inkSoft,
                  }}
                >
                  {exam.eligibility.attempts}
                </span>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 22 }}>
            <h2
              style={{
                fontFamily: displayFont,
                fontSize: 18,
                margin: "0 0 10px",
                color: C.ink,
              }}
            >
              Selection process
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {exam.stages.map((stage, index) => (
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

          <section
            style={{
              borderTop: `1px solid ${C.line}`,
              paddingTop: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 9,
              }}
            >
              <a
                href={exam.officialWebsite}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: C.ink,
                  color: "#fff",
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
                Exam information
                <FileText size={14} />
              </a>
            </div>
          </section>
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

  /* =======================================================
     FIREBASE AUTH STATE
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
        console.error(
          "Firebase auth state error:",
          error
        );

        setUser(null);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =======================================================
     LOAD STARRED EXAMS

     Uses browser localStorage.
     This avoids requiring Firestore for this feature.
  ======================================================= */

  useEffect(() => {
    if (!user) {
      setStarred(new Set());
      setStarLoaded(false);
      return;
    }

    try {
      const saved = localStorage.getItem(
        `hallpass-starred:${user.uid}`
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setStarred(new Set(parsed));
        } else {
          setStarred(new Set());
        }
      } else {
        setStarred(new Set());
      }
    } catch (error) {
      console.error(
        "Could not load starred exams:",
        error
      );

      setStarred(new Set());
    } finally {
      setStarLoaded(true);
    }
  }, [user]);

  /* =======================================================
     STAR / TRACK EXAM
  ======================================================= */

  const toggleStar = useCallback(
    (id) => {
      if (!user) return;

      setStarred((prev) => {
        const next = new Set(prev);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        try {
          localStorage.setItem(
            `hallpass-starred:${user.uid}`,
            JSON.stringify([...next])
          );
        } catch (error) {
          console.error(
            "Could not save starred exams:",
            error
          );
        }

        return next;
      });
    },
    [user]
  );

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = [
    "All",
    ...Array.from(
      new Set(EXAMS.map((exam) => exam.category))
    ),
  ];

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filtered = EXAMS.filter((exam) => {
    const searchText = query.trim().toLowerCase();

    const matchesSearch =
      searchText === "" ||
      exam.shortName
        .toLowerCase()
        .includes(searchText) ||
      exam.name
        .toLowerCase()
        .includes(searchText) ||
      exam.category
        .toLowerCase()
        .includes(searchText);

    const matchesCategory =
      category === "All" ||
      exam.category === category;

    return matchesSearch && matchesCategory;
  });

  /* =======================================================
     STARRED EXAMS
  ======================================================= */

  const starredExams = EXAMS
    .filter((exam) => starred.has(exam.id))
    .sort(
      (a, b) =>
        daysLeft(a.examDate) -
        daysLeft(b.examDate)
    );

  /* =======================================================
     SELECTED EXAM
  ======================================================= */

  const selectedExam = EXAMS.find(
    (exam) => exam.id === selectedId
  );

  /* =======================================================
     AUTH LOADING SCREEN
  ======================================================= */

  if (authLoading) {
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
          <Ticket
            size={42}
            color={C.ink}
            style={{
              margin: "0 auto 12px",
            }}
          />

          <div
            style={{
              fontFamily: displayFont,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            Hall Pass
          </div>

          <div
            style={{
              marginTop: 6,
              color: C.inkSoft,
              fontSize: 13,
            }}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     SHOW FIREBASE LOGIN / SIGNUP
  ======================================================= */

  if (!user) {
    return <Auth />;
  }

  /* =======================================================
     HALL PASS APP
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `${OMR_BG}, ${C.bg}`,
        backgroundSize: "18px 18px, auto",
        fontFamily: bodyFont,
        padding:
          "clamp(18px, 5vw, 28px) clamp(12px, 4vw, 16px) 60px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        button,
        input {
          font: inherit;
        }

        input:focus,
        textarea:focus,
        button:focus-visible {
          outline: 2px solid ${C.ink};
          outline-offset: 2px;
        }

        .hp-tap {
          min-height: 34px;
          min-width: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .hp-eligibility-row {
          display: flex;
          gap: 8px;
        }

        .hp-eligibility-label {
          min-width: 84px;
          flex-shrink: 0;
        }

        .hp-card {
          transition:
            transform .15s ease,
            box-shadow .15s ease;
        }

        .hp-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 6px 16px rgba(20,33,61,0.1);
        }

        @media (prefers-reduced-motion: reduce) {
          .hp-card,
          .hp-card:hover {
            transition: none;
            transform: none;
          }
        }

        @media (max-width: 460px) {
          .hp-eligibility-row {
            flex-direction: column;
            gap: 1px;
          }

          .hp-eligibility-label {
            min-width: 0;
          }

          .hp-countdown-row {
            gap: 4px !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <HeroPass trackedCount={starred.size} />

        {/* =================================================
            LOGGED-IN USER BAR
        ================================================= */}

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
            }}
          >
            Signed in as{" "}
            <strong style={{ color: C.ink }}>
              {user.email}
            </strong>
          </div>

          <button
            onClick={async () => {
              try {
                await signOut(auth);
              } catch (error) {
                console.error(
                  "Logout error:",
                  error
                );
              }
            }}
            style={{
              flexShrink: 0,
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

        {/* =================================================
            DETAIL VIEW
        ================================================= */}

        {view === "detail" && selectedExam ? (
          <ExamDetail
            exam={selectedExam}
            starred={starred.has(selectedExam.id)}
            onToggleStar={toggleStar}
            onBack={() => {
              setView("home");
              setSelectedId(null);
            }}
          />
        ) : (
          <>
            {/* =============================================
                STARRED EXAMS
            ============================================= */}

            {starLoaded &&
              starredExams.length > 0 && (
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

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                      paddingBottom: 4,
                    }}
                  >
                    {starredExams.map((exam) => {
                      const dl = daysLeft(
                        exam.examDate
                      );

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
                              color:
                                dl <= 14
                                  ? C.red
                                  : C.green,
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

            {/* =============================================
                SEARCH
            ============================================= */}

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
              <Search
                size={16}
                color={C.inkSoft}
              />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
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

            {/* =============================================
                CATEGORIES
            ============================================= */}

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
                  onClick={() =>
                    setCategory(item)
                  }
                  style={{
                    flexShrink: 0,
                    fontFamily: bodyFont,
                    fontSize: 12.5,
                    fontWeight:
                      category === item
                        ? 600
                        : 400,
                    color:
                      category === item
                        ? "#fff"
                        : C.inkSoft,
                    background:
                      category === item
                        ? C.ink
                        : C.surface,
                    border: `1px solid ${
                      category === item
                        ? C.ink
                        : C.line
                    }`,
                    borderRadius: 20,
                    padding: "6px 13px",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* =============================================
                RESULTS COUNT
            ============================================= */}

            <div
              style={{
                fontFamily: monoFont,
                fontSize: 10.5,
                color: C.inkSoft,
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              {filtered.length}{" "}
              {filtered.length === 1
                ? "exam"
                : "exams"}{" "}
              found
            </div>

            {/* =============================================
                EXAM CARDS
            ============================================= */}

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
                <Search
                  size={30}
                  style={{
                    marginBottom: 10,
                    opacity: 0.45,
                  }}
                />

                <div
                  style={{
                    fontWeight: 600,
                    color: C.ink,
                    marginBottom: 5,
                  }}
                >
                  No exams found
                </div>

                <div>
                  No exams match "
                  {query}
                  ". Try a different
                  search or category.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
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

            {/* =============================================
                FOOTER
            ============================================= */}

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
              Sample exams shown for demo purposes.
              <br />
              Connect a live exam feed to replace them
              with real, verified dates.
            </div>
          </>
        )}
      </div>
    </div>
  );
}