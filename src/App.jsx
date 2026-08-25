import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Auth from "./Auth";
import PracticeTestSection, { loadProgress } from "./PracticeTest";
import CloudFiles from "./CloudFiles";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";

// Imported as a namespace (not destructured) to avoid a known Vite/Rollup
// production-build issue where some Firebase modular SDK named exports
// (e.g. onSnapshot) get dropped during tree-shaking despite working fine
// in dev mode. Using the namespace object sidesteps that entirely.
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
    omr: OMR_BG_DARK,
  },
};

/* =========================================================
   PROGRESS DASHBOARD
========================================================= */
function ProgressDashboard({ userId, colors }) {
  const [attempts, setAttempts] = useState([]);
  const T = colors || C;

  useEffect(() => {
    setAttempts(loadProgress(userId));
  }, [userId]);

  // Refresh when window regains focus (after a mock)
  useEffect(() => {
    const onFocus = () => setAttempts(loadProgress(userId));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [userId]);

  if (!attempts.length) {
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
          <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 18, color: T.ink }}>Your progress</h2>
        </div>
        <p style={{ margin: 0, fontFamily: bodyFont, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
          Complete a full or sectional mock to see scores, accuracy, and weak sections here.
        </p>
      </div>
    );
  }

  const avgPct =
    attempts.reduce((a, x) => a + (x.maxScore ? (x.score / x.maxScore) * 100 : 0), 0) / attempts.length;
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <TrendingUp size={20} color={T.ink} />
        <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 18, color: T.ink }}>Your progress</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 14 }}>
        <div style={{ background: T.softBlue, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: T.inkSoft }}>MOCKS</div>
          <div style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700, color: T.ink }}>{attempts.length}</div>
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
          <div style={{ fontFamily: monoFont, fontSize: 10, color: T.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
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
      <div style={{ fontFamily: monoFont, fontSize: 10, color: T.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
        Recent attempts
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {attempts.slice(0, 5).map((a) => (
          <div
            key={a.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
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
              <span style={{ color: T.inkSoft }}> · {a.mode === "sectional" ? "sectional" : "full"}</span>
            </span>
            <span style={{ fontFamily: monoFont, fontWeight: 600 }}>
              {a.score}/{a.maxScore}
              <span style={{ color: T.inkSoft, fontWeight: 400 }}>
                {" "}
                · {a.at ? new Date(a.at).toLocaleDateString("en-IN") : ""}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   EXAM DATA
   officialWebsite → main site
   notificationUrl → official previous year papers / archive
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
    eligibility: {
      education: "Graduate degree",
      age: "21–32 years",
      attempts: "Varies by category",
    },
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
          {
            name: "Essay",
            topics: ["Two essays (~1000 words each) from philosophical, governance, society, technology & current-event themes"],
          },
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
          {
            name: "Optional Subject (2 papers)",
            topics: ["One optional subject chosen from the official list of ~48 subjects (literature & non-literature)"],
          },
        ],
      },
    ],
    officialWebsite: "https://upsc.gov.in/",
    notificationUrl: "https://www.upsc.gov.in/examinations/previous-question-papers",
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
    eligibility: {
      education: "Graduate degree",
      age: "18–32 years depending on post",
      attempts: "No fixed attempt limit",
    },
    stages: ["Tier-I", "Tier-II", "Document Verification"],
    syllabus: [
      {
        stage: "Tier I",
        papers: [
          {
            name: "General Intelligence & Reasoning",
            topics: [
              "Analogy, Classification, Series (number/figural)",
              "Coding-Decoding, Blood Relations, Direction Sense",
              "Venn Diagrams, Syllogism, Statement–Conclusion",
              "Paper folding/cutting, Embedded figures, Matrix",
              "Order & Ranking, Puzzles",
            ],
          },
          {
            name: "General Awareness",
            topics: [
              "Current events (national & international)",
              "Indian History, Geography, Polity & Constitution",
              "Economy, Budget, Government schemes",
              "General Science & Everyday Science",
              "Environment, Ecology, Sports, Awards, Books",
            ],
          },
          {
            name: "Quantitative Aptitude",
            topics: [
              "Number System, Simplification, LCM/HCF",
              "Percentage, Ratio & Proportion, Average",
              "Profit & Loss, Discount, SI & CI",
              "Time & Work, Time-Speed-Distance, Mixture",
              "Algebra, Geometry, Mensuration, Trigonometry",
              "Data Interpretation (tables, graphs)",
            ],
          },
          {
            name: "English Comprehension",
            topics: [
              "Reading Comprehension, Cloze Test",
              "Error Spotting, Sentence Improvement",
              "Synonyms, Antonyms, Idioms & Phrases",
              "One-word substitution, Fill in the blanks",
              "Para Jumbles, Active/Passive, Direct/Indirect",
            ],
          },
        ],
      },
      {
        stage: "Tier II (Paper I — compulsory)",
        papers: [
          {
            name: "Mathematical Abilities",
            topics: ["Advanced Arithmetic, Algebra, Geometry, Mensuration", "Trigonometry, Statistics, Probability, Data Interpretation"],
          },
          {
            name: "Reasoning & General Intelligence",
            topics: ["Higher-order puzzles, seating arrangements, critical thinking, emotional & social intelligence"],
          },
          {
            name: "English Language & Comprehension",
            topics: ["Longer RC passages, para-jumbles, advanced grammar, complex cloze tests"],
          },
          {
            name: "General Awareness",
            topics: ["Static GK + recent current affairs (deeper than Tier I)"],
          },
          {
            name: "Computer Knowledge + DEST",
            topics: ["Computer basics, OS, MS Office, Internet, Networking; Data Entry Speed Test (qualifying)"],
          },
        ],
      },
    ],
    officialWebsite: "https://ssc.gov.in/",
    notificationUrl: "https://ssc.gov.in/for-candidates/previous-year-question-paper",
  },
  {
    id: "jee-main",
    shortName: "JEE Main",
    name: "Joint Entrance Examination Main",
    category: "Engineering",
    examDate: "2027-01-20",
    applicationStart: "2026-10-01",
    applicationEnd: "2026-11-15",
    description: "A national-level entrance examination for undergraduate engineering and related programs.",
    eligibility: {
      education: "Class 12 or equivalent",
      age: "No specific age limit",
      attempts: "As specified by NTA",
    },
    stages: ["Computer Based Test", "Result", "Counselling"],
    syllabus: [
      {
        stage: "Paper 1 (B.E./B.Tech)",
        papers: [
          {
            name: "Physics",
            topics: [
              "Units & Measurements, Kinematics, Laws of Motion",
              "Work, Energy & Power, Rotational Motion, Gravitation",
              "Properties of Solids & Liquids, Thermodynamics, Kinetic Theory",
              "Oscillations & Waves",
              "Electrostatics, Current Electricity, Magnetic Effects",
              "EMI & AC, Electromagnetic Waves, Optics",
              "Dual Nature of Matter, Atoms & Nuclei, Electronic Devices",
              "Experimental Skills",
            ],
          },
          {
            name: "Chemistry",
            topics: [
              "Physical: Basic Concepts, Atomic Structure, Chemical Bonding, Thermodynamics, Equilibrium, Redox & Electrochemistry, Chemical Kinetics, Solutions, Surface Chemistry",
              "Inorganic: Periodic Table, s/p/d/f-Block, Coordination Compounds, Isolation of Metals",
              "Organic: Basic Principles, Hydrocarbons, Haloalkanes/Haloarenes, Alcohols/Phenols/Ethers, Aldehydes/Ketones/Carboxylic Acids, Amines, Biomolecules, Polymers",
            ],
          },
          {
            name: "Mathematics",
            topics: [
              "Sets, Relations & Functions; Complex Numbers & Quadratic Equations",
              "Matrices & Determinants; Permutations & Combinations; Binomial Theorem",
              "Sequences & Series; Limits, Continuity & Differentiability",
              "Integral Calculus; Differential Equations",
              "Coordinate Geometry (2D); Three-Dimensional Geometry; Vector Algebra",
              "Statistics & Probability; Trigonometry",
            ],
          },
        ],
      },
    ],
    officialWebsite: "https://jeemain.nta.nic.in/",
    notificationUrl: "https://www.nta.ac.in/Downloads",
  },
  {
    id: "gate",
    shortName: "GATE",
    name: "Graduate Aptitude Test in Engineering",
    category: "Engineering",
    examDate: "2027-02-07",
    applicationStart: "2026-08-25",
    applicationEnd: "2026-10-01",
    description: "A national examination used for postgraduate admissions and recruitment opportunities in engineering and science.",
    eligibility: {
      education: "Undergraduate degree or currently pursuing eligible degree",
      age: "No age limit",
      attempts: "No attempt limit",
    },
    stages: ["Computer Based Test", "Score", "Admission / Recruitment"],
    syllabus: [
      {
        stage: "Common to all papers",
        papers: [
          {
            name: "General Aptitude (GA) — 15 marks",
            topics: [
              "Verbal Ability — English grammar, sentence completion, verbal analogies, word groups, instructions, critical reasoning, verbal deduction",
              "Numerical Ability — Numerical computation, numerical estimation, numerical reasoning, data interpretation",
            ],
          },
          {
            name: "Engineering Mathematics (most engineering papers)",
            topics: [
              "Linear Algebra — matrices, determinants, systems of linear equations, eigenvalues/eigenvectors",
              "Calculus — limits, continuity, differentiation, integration, maxima/minima, multiple integrals, vector calculus",
              "Differential Equations — first order, higher order linear ODEs, partial differential equations (intro)",
              "Complex Variables — analytic functions, Cauchy’s theorem/integral, Taylor & Laurent series, residues",
              "Probability & Statistics — mean, median, mode, standard deviation, random variables, distributions, hypothesis testing",
              "Numerical Methods — interpolation, numerical integration, solutions of linear/non-linear equations",
            ],
          },
        ],
      },
      {
        stage: "Major paper codes (core outline)",
        papers: [
          {
            name: "CS — Computer Science & Information Technology",
            topics: [
              "Digital Logic, Computer Organization & Architecture",
              "Programming & Data Structures, Algorithms",
              "Theory of Computation, Compiler Design",
              "Operating Systems, Databases",
              "Computer Networks",
              "Software Engineering, Discrete Mathematics",
            ],
          },
          {
            name: "ME — Mechanical Engineering",
            topics: [
              "Engineering Mechanics, Strength of Materials, Theory of Machines",
              "Vibrations, Machine Design",
              "Fluid Mechanics, Heat Transfer, Thermodynamics",
              "Applications (Power Engineering, IC Engines, Refrigeration & AC, Turbomachinery)",
              "Manufacturing Engineering, Industrial Engineering",
            ],
          },
          {
            name: "EE — Electrical Engineering",
            topics: [
              "Electric Circuits, Electromagnetic Fields",
              "Signals & Systems, Electrical Machines",
              "Power Systems, Control Systems",
              "Electrical & Electronic Measurements",
              "Analog & Digital Electronics, Power Electronics",
            ],
          },
          {
            name: "EC — Electronics & Communication",
            topics: [
              "Networks, Signals & Systems, Electronic Devices",
              "Analog Circuits, Digital Circuits",
              "Control Systems, Communications",
              "Electromagnetics",
              "Engineering Mathematics as applicable",
            ],
          },
          {
            name: "CE — Civil Engineering",
            topics: [
              "Engineering Mathematics, Structural Engineering",
              "Geotechnical Engineering, Water Resources",
              "Environmental Engineering",
              "Transportation Engineering",
              "Geomatics Engineering",
            ],
          },
          {
            name: "Other papers (examples)",
            topics: [
              "CH Chemical · BT Biotechnology · IN Instrumentation · AE Aerospace",
              "PI Production & Industrial · MT Metallurgical · PE Petroleum · TF Textile",
              "PH Physics · CY Chemistry · MA Mathematics · ST Statistics · XE / XL multi-section",
              "Full syllabus for every paper code is in the official GATE brochure — always verify there",
            ],
          },
        ],
      },
    ],
    officialWebsite: "https://gate2027.iitg.ac.in/",
    notificationUrl: "https://gate2026.iitg.ac.in/download.html",
  },
  {
    id: "cat",
    shortName: "CAT",
    name: "Common Admission Test",
    category: "Management",
    examDate: "2026-11-29",
    applicationStart: "2026-08-01",
    applicationEnd: "2026-09-15",
    description: "A national-level management entrance examination primarily used by IIMs and other business schools.",
    eligibility: {
      education: "Bachelor's degree",
      age: "No age limit",
      attempts: "No attempt limit",
    },
    stages: ["Computer Based Test", "Shortlisting", "Further admission process"],
    syllabus: [
      {
        stage: "Three sections (40 min each)",
        papers: [
          {
            name: "VARC — Verbal Ability & Reading Comprehension",
            topics: [
              "Reading Comprehension (inference, specific detail, tone, critical analysis)",
              "Para Jumbles / Jumbled Paragraphs",
              "Para Summary",
              "Odd Sentence Out",
              "Verbal reasoning & logic (no direct grammar/spelling questions)",
            ],
          },
          {
            name: "DILR — Data Interpretation & Logical Reasoning",
            topics: [
              "Tables, Bar/Line/Pie/Column graphs, Caselets, Venn diagrams",
              "Seating arrangements (linear/circular), Blood relations, Puzzles",
              "Binary logic, Games & tournaments, Routes & networks",
              "Data sufficiency, Sets, Ranking & ordering",
            ],
          },
          {
            name: "Quantitative Aptitude",
            topics: [
              "Arithmetic: Percentages, Ratio & Proportion, Averages, Profit & Loss, SI/CI, Time-Speed-Distance, Time & Work, Mixtures",
              "Algebra: Equations, Inequalities, Functions, Logarithms, Progressions",
              "Geometry & Mensuration: Triangles, Circles, Polygons, 2D/3D figures",
              "Number System, Modern Math (Probability, Permutation & Combination, Set Theory)",
            ],
          },
        ],
      },
    ],
    officialWebsite: "https://iimcat.ac.in/",
    // Official CAT past papers are released mainly for candidates who appeared (login on iimcat.ac.in).
    // NTA-style bulk archive is not public; this points students to the official CAT portal to find papers/mock.
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
    description: "The national entrance examination for undergraduate medical education in India.",
    eligibility: {
      education: "10+2 with required subjects",
      age: "As specified by NTA",
      attempts: "As specified by NTA",
    },
    stages: ["Entrance Examination", "Result", "Counselling"],
    syllabus: [
      {
        stage: "Single paper (PCB)",
        papers: [
          {
            name: "Physics",
            topics: [
              "Physics & Measurement, Kinematics, Laws of Motion",
              "Work, Energy & Power, Rotational Motion, Gravitation",
              "Properties of Solids & Liquids, Thermodynamics, Kinetic Theory",
              "Oscillations & Waves",
              "Electrostatics, Current Electricity, Magnetic Effects & Magnetism",
              "EMI & Alternating Currents, Electromagnetic Waves, Optics",
              "Dual Nature of Matter & Radiation, Atoms & Nuclei, Electronic Devices",
              "Experimental Skills",
            ],
          },
          {
            name: "Chemistry",
            topics: [
              "Physical: Basic Concepts, Atomic Structure, Chemical Bonding, Thermodynamics, Solutions, Equilibrium, Redox & Electrochemistry, Chemical Kinetics",
              "Inorganic: Classification of Elements & Periodicity, p-Block, d- & f-Block, Coordination Compounds",
              "Organic: Purification & Characterisation, Basic Principles, Hydrocarbons, Compounds containing Halogens/Oxygen/Nitrogen, Biomolecules",
            ],
          },
          {
            name: "Biology (Botany + Zoology)",
            topics: [
              "Diversity in the Living World",
              "Structural Organisation in Animals & Plants",
              "Cell Structure & Function",
              "Plant Physiology",
              "Human Physiology",
              "Reproduction",
              "Genetics & Evolution",
              "Biology & Human Welfare",
              "Biotechnology & Its Applications",
              "Ecology & Environment",
            ],
          },
        ],
      },
    ],
    officialWebsite: "https://neet.nta.nic.in/",
    notificationUrl: "https://neet.nta.nic.in/archive/",
  },
  {
    id: "ibps-po",
    shortName: "IBPS PO",
    name: "IBPS Probationary Officer",
    category: "Banking",
    examDate: "2026-10-18",
    applicationStart: "2026-07-01",
    applicationEnd: "2026-07-28",
    description: "Recruitment examination for Probationary Officers / Management Trainees in participating public sector banks.",
    eligibility: {
      education: "Graduate degree",
      age: "20–30 years (relaxations as per rules)",
      attempts: "As per IBPS notification",
    },
    stages: ["Prelims", "Mains", "Interview"],
    syllabus: [
      {
        stage: "Prelims",
        papers: [
          {
            name: "English Language",
            topics: ["Reading comprehension", "Cloze test", "Error spotting", "Para jumbles", "Fillers"],
          },
          {
            name: "Quantitative Aptitude",
            topics: ["Simplification", "Number series", "Data interpretation", "Arithmetic word problems"],
          },
          {
            name: "Reasoning Ability",
            topics: ["Puzzles & seating", "Syllogism", "Inequality", "Coding-decoding", "Blood relations"],
          },
        ],
      },
    ],
    officialWebsite: "https://www.ibps.in/",
    notificationUrl: "https://www.ibps.in/",
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
function HeroPass({ trackedCount }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Exam dates for calendar markers
  const examByDate = (() => {
    const map = {};
    EXAMS.forEach((e) => {
      if (!e.examDate) return;
      const key = e.examDate; // YYYY-MM-DD
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
          <div style={{ fontFamily: bodyFont, fontSize: 10, color: "rgba(255,255,255,0.65)" }}>TRACKED</div>
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
          <div style={{ marginTop: 14, textAlign: "center", fontFamily: bodyFont, fontWeight: 600, color: C.ink }}>
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
            <div style={{ marginTop: 6, textAlign: "center", fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
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
          <div style={{ fontFamily: monoFont, fontSize: 10, textTransform: "uppercase", color: C.inkSoft, marginBottom: 5 }}>
            {exam.category}
          </div>
          <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: C.ink }}>
            {exam.shortName}
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, marginTop: 3, lineHeight: 1.4 }}>
            {exam.name}
          </div>
        </div>

        <button
          className="hp-tap"
          onClick={() => onToggleStar(exam.id)}
          aria-label={starred ? `Unstar ${exam.shortName}` : `Star ${exam.shortName}`}
          style={{ border: "none", background: "transparent", cursor: "pointer", color: starred ? C.yellow : C.inkSoft, padding: 0 }}
        >
          <Star size={20} fill={starred ? C.yellow : "none"} />
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, margin: "14px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontFamily: monoFont, fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase" }}>Exam date</div>
          <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 3 }}>
            {formatDate(exam.examDate)}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: monoFont, fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase" }}>Countdown</div>
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
      <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 8px", color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
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
              <div key={key} style={{ border: `1px solid ${C.line}`, overflow: "hidden", background: C.surface, borderRadius: 10 }}>
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
                    <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.4 }}>
                      {stage.stage}
                    </div>
                    <div style={{ fontFamily: bodyFont, fontSize: 13.5, fontWeight: 600, color: C.ink, marginTop: 2 }}>
                      {paper.name}
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    color={C.inkSoft}
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }}
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

      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: 20, background: C.ink, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 15 }}>
            <div>
              <div style={{ fontFamily: monoFont, fontSize: 10, textTransform: "uppercase", opacity: 0.65, marginBottom: 6 }}>
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

          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 8px", color: C.ink }}>About the exam</h2>
            <p style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>
              {exam.description}
            </p>
          </section>

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

          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 18, margin: "0 0 10px", color: C.ink }}>Selection process</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exam.stages.map((stage, index) => (
                <div key={stage} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: bodyFont, fontSize: 13, color: C.inkSoft }}>
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
                Previous year papers
                <FileText size={14} />
              </a>
            </div>
            <p style={{ marginTop: 10, fontFamily: bodyFont, fontSize: 11.5, color: C.inkSoft, lineHeight: 1.45 }}>
              Official previous papers open on the exam authority’s site. Hall Pass mocks use original practice items — not copied past papers.
            </p>
          </section>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <PracticeTestSection exam={exam} user={user} />
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

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("hallpass-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const T = THEMES[theme] || THEMES.light;

  useEffect(() => {
    try {
      localStorage.setItem("hallpass-theme", theme);
    } catch (_) {}
    // Sync module-level C used by cards (best-effort for shared constants)
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
    });
  }, [theme, T]);

  const [starred, setStarred] = useState(new Set());
  const [starLoaded, setStarLoaded] = useState(false);

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
        console.error("Firebase auth state error:", error);
        setUser(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  /* =======================================================
     LIVE NOTES (onSnapshot)
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

  /* =======================================================
     LOAD STARRED EXAMS
  ======================================================= */
  useEffect(() => {
    if (!user) {
      setStarred(new Set());
      setStarLoaded(false);
      return;
    }
    try {
      const saved = localStorage.getItem(`hallpass-starred:${user.uid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStarred(Array.isArray(parsed) ? new Set(parsed) : new Set());
      } else {
        setStarred(new Set());
      }
    } catch (error) {
      console.error("Could not load starred exams:", error);
      setStarred(new Set());
    } finally {
      setStarLoaded(true);
    }
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
      const tags = noteTags.split(",").map((t) => t.trim()).filter(Boolean);

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
     STAR / TRACK EXAM
  ======================================================= */
  const toggleStar = useCallback(
    (id) => {
      if (!user) return;
      setStarred((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(`hallpass-starred:${user.uid}`, JSON.stringify([...next]));
        } catch (error) {
          console.error("Could not save starred exams:", error);
        }
        return next;
      });
    },
    [user]
  );

  const categories = ["All", ...Array.from(new Set(EXAMS.map((e) => e.category)))];

  const filtered = EXAMS.filter((exam) => {
    const searchText = query.trim().toLowerCase();
    const matchesSearch =
      searchText === "" ||
      exam.shortName.toLowerCase().includes(searchText) ||
      exam.name.toLowerCase().includes(searchText) ||
      exam.category.toLowerCase().includes(searchText);
    const matchesCategory = category === "All" || exam.category === category;
    return matchesSearch && matchesCategory;
  });

  const starredExams = EXAMS
    .filter((exam) => starred.has(exam.id))
    .sort((a, b) => daysLeft(a.examDate) - daysLeft(b.examDate));

  const selectedExam = EXAMS.find((exam) => exam.id === selectedId);

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
     AUTH LOADING SCREEN
  ======================================================= */
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: bodyFont, color: C.ink }}>
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
     HALL PASS APP
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
        <HeroPass trackedCount={starred.size} />

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
          <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 120 }}>
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
                try { await signOut(auth); } catch (e) { console.error(e); }
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

        {view !== "detail" && <ProgressDashboard userId={user.uid} colors={C} />}

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
                <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
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
                        <span style={{ fontFamily: monoFont, color: dl <= 14 ? C.red : C.green, fontWeight: 600 }}>
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
                style={{ border: "none", outline: "none", background: "transparent", fontFamily: bodyFont, fontSize: 13.5, color: C.ink, width: "100%" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ border: "none", background: "transparent", color: C.inkSoft, cursor: "pointer", fontSize: 12 }}>
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
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
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={20} color={C.ink} />
                    <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 20, color: C.ink }}>My Notes</h2>
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
                    <div style={{ background: C.softRed, color: C.red, border: `1px solid ${C.red}55`, borderRadius: 9, padding: "9px 11px", marginBottom: 14, fontFamily: bodyFont, fontSize: 12.5, lineHeight: 1.5 }}>
                      {notesError}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 10px", marginBottom: 14 }}>
                    <Search size={15} color={C.inkSoft} />
                    <input
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      placeholder="Search your notes..."
                      style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: bodyFont, fontSize: 13, color: C.ink }}
                    />
                  </div>

                  <div style={{ background: C.softBlue, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>
                      {editingNote ? "Edit Note" : "Create a Note"}
                    </div>
                    <input
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note title"
                      style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 8, background: "#fff", color: C.ink }}
                    />
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your notes here..."
                      rows={5}
                      style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, resize: "vertical", background: "#fff", color: C.ink, fontFamily: bodyFont, marginBottom: 8 }}
                    />
                    <input
                      value={noteTags}
                      onChange={(e) => setNoteTags(e.target.value)}
                      placeholder="Tags: GATE, DSA, Maths"
                      style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 10, background: "#fff", color: C.ink }}
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
                          style={{ border: `1px solid ${C.line}`, borderRadius: 8, background: "#fff", color: C.ink, padding: "8px 13px", cursor: "pointer", fontFamily: bodyFont, fontSize: 12 }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
                    {filteredNotes.length} {filteredNotes.length === 1 ? "NOTE" : "NOTES"}
                  </div>

                  {notesLoading ? (
                    <div style={{ textAlign: "center", padding: 25, color: C.inkSoft, fontFamily: bodyFont, fontSize: 13 }}>
                      Loading your notes...
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 25, border: `1px dashed ${C.line}`, borderRadius: 10, color: C.inkSoft, fontFamily: bodyFont, fontSize: 13 }}>
                      <BookOpen size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>No notes yet</div>
                      <div>Create your first exam note above.</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {filteredNotes.map((note) => (
                        <div key={note.id} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 13, background: "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                            <div>
                              <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, color: C.ink }}>
                                {note.title || "Untitled Note"}
                              </div>
                              <div style={{ marginTop: 6, fontFamily: bodyFont, fontSize: 13, lineHeight: 1.5, color: C.inkSoft, whiteSpace: "pre-wrap" }}>
                                {note.content}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                              <button
                                onClick={() => startEditingNote(note)}
                                style={{ border: `1px solid ${C.line}`, background: C.bg, borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: C.ink }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                style={{ border: "none", background: C.softRed, borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: C.red }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {Array.isArray(note.tags) && note.tags.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                              {note.tags.map((tag) => (
                                <span key={tag} style={{ background: C.softYellow, color: C.ink, borderRadius: 20, padding: "4px 8px", fontFamily: monoFont, fontSize: 9 }}>
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
            <div style={{ fontFamily: monoFont, fontSize: 10.5, color: C.inkSoft, marginBottom: 10, textTransform: "uppercase" }}>
              {filtered.length} {filtered.length === 1 ? "exam" : "exams"} found
            </div>

            {/* Exam cards */}
            {filtered.length === 0 ? (
              <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, fontFamily: bodyFont, fontSize: 13.5, color: C.inkSoft, textAlign: "center", padding: "40px 20px" }}>
                <Search size={30} style={{ marginBottom: 10, opacity: 0.45 }} />
                <div style={{ fontWeight: 600, color: C.ink, marginBottom: 5 }}>No exams found</div>
                <div>No exams match "{query}". Try a different search or category.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
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

            <div style={{ fontFamily: bodyFont, fontSize: 11.5, color: C.inkSoft, textAlign: "center", marginTop: 28, lineHeight: 1.5 }}>
              Sample exams shown for demo purposes.
              <br />
              Connect a live exam feed to replace them with real, verified dates.
            </div>
          </>
        )}
      </div>
    </div>
  );
}