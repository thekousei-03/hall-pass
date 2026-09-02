import React, { useState, useEffect } from "react";
import { Sparkles, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";
const monoFont = "'IBM Plex Mono', monospace";

const C = {
  bg: "#f4f1ea",
  surface: "#ffffff",
  paper: "#FFFDF6",
  ink: "#14213d",
  inkSoft: "#667085",
  line: "#d9d5cc",
  red: "#c84c4c",
  green: "#3c7a57",
  amber: "#d99a27",
  greenSoft: "#e5f1e9",
  redSoft: "#f8e4e1",
  amberSoft: "#f8efd9",
};

/* ---------------------------------------------------------
   PREDICTED PAPERS DATA (Last 5 Years trends)
--------------------------------------------------------- */
const PREDICTED_PAPERS = {
  "upsc-cse": {
    price: 49,
    title: "UPSC CSE Predicted Paper",
    topics: [
      { name: "Polity – Fundamental Rights & DPSP", weight: "High", note: "Appeared almost every year" },
      { name: "Economy – Inflation, Monetary Policy, Budget", weight: "High", note: "Current + static mix" },
      { name: "Environment – Climate, Biodiversity, Conventions", weight: "High", note: "Rising weightage" },
      { name: "Modern History – Freedom Struggle (1885–1947)", weight: "Medium-High", note: "Core area" },
      { name: "Geography – Monsoon, Resources, Mapping", weight: "Medium", note: "Map questions common" },
      { name: "Current Affairs – Last 12–18 months", weight: "Very High", note: "Linked with static" },
    ],
    sampleQuestions: [
      "Discuss the significance of the recent amendments related to Fundamental Rights in the context of privacy and digital age.",
      "How does the Monetary Policy Committee balance growth and inflation? Illustrate with recent decisions.",
      "Examine the role of India in global climate negotiations after the Paris Agreement.",
    ],
  },
  "ssc-cgl": {
    price: 49,
    title: "SSC CGL Predicted Paper",
    topics: [
      { name: "Quantitative Aptitude – Arithmetic (Profit, SI/CI, Time-Work)", weight: "Very High", note: "Highest scoring" },
      { name: "Reasoning – Puzzles, Seating, Syllogism", weight: "High", note: "Practice sets daily" },
      { name: "English – Error Detection, Cloze, Vocabulary", weight: "High", note: "Grammar rules key" },
      { name: "General Awareness – Current + Static GK", weight: "High", note: "Last 6–8 months focus" },
    ],
    sampleQuestions: [
      "A shopkeeper marks up goods by 40% and gives 15% discount. Find profit %.",
      "In a row of 40 students, A is 12th from left. What is his position from right?",
      "Choose the correct synonym of ‘Ephemeral’.",
    ],
  },
  "jee-main": {
    price: 49,
    title: "JEE Main Predicted Paper",
    topics: [
      { name: "Physics – Mechanics, Electrostatics, Modern Physics", weight: "High", note: "Core scoring" },
      { name: "Chemistry – Organic (GOC, Named Reactions), Physical", weight: "High", note: "NCERT heavy" },
      { name: "Maths – Calculus, Coordinate Geometry, Algebra", weight: "High", note: "Practice timed" },
    ],
    sampleQuestions: [
      "A particle moves with velocity v = 3t² – 2t. Find acceleration at t = 2s.",
      "Arrange the following compounds in increasing order of boiling point (with reason).",
      "Find the area bounded by y = x² and y = 4x.",
    ],
  },
  "neet-ug": {
    price: 49,
    title: "NEET UG Predicted Paper",
    topics: [
      { name: "Biology – Human Physiology, Genetics, Ecology", weight: "Very High", note: "NCERT line-by-line" },
      { name: "Chemistry – Organic + Physical equilibrium", weight: "High", note: "Diagrams important" },
      { name: "Physics – Mechanics, Optics, Modern Physics", weight: "Medium-High", note: "Formula application" },
    ],
    sampleQuestions: [
      "Explain the mechanism of muscle contraction with suitable diagram.",
      "Differentiate between mitotic and meiotic cell division with examples.",
      "A convex lens of focal length 20 cm forms a real image. Calculate magnification.",
    ],
  },
  "cat": {
    price: 49,
    title: "CAT Predicted Paper",
    topics: [
      { name: "VARC – Reading Comprehension + Para Summary", weight: "High", note: "Reading habit key" },
      { name: "DILR – Sets (Tables, Graphs, Arrangements)", weight: "High", note: "Practice full sets" },
      { name: "Quant – Arithmetic + Algebra", weight: "High", note: "Speed + accuracy" },
    ],
    sampleQuestions: [
      "Based on the passage, which of the following is the author’s main argument?",
      "From the given data set, find the ratio of average sales of Product A to Product B.",
      "Solve for x: 2x² – 5x + 3 = 0 and interpret the roots.",
    ],
  },
  "ibps-po": {
    price: 49,
    title: "IBPS PO Predicted Paper",
    topics: [
      { name: "Reasoning – Puzzles, Inequality, Coding", weight: "High", note: "Speed matters" },
      { name: "Quant – Data Interpretation + Arithmetic", weight: "High", note: "DI is scoring" },
      { name: "English – Reading + Grammar", weight: "Medium-High", note: "Banking vocab useful" },
      { name: "GA – Banking Awareness + Current Affairs", weight: "High", note: "Last 6 months" },
    ],
    sampleQuestions: [
      "Study the following information and answer the seating arrangement questions.",
      "What is the ratio of total expenditure of Company X in 2023 to 2024?",
      "Which of the following is not a function of RBI?",
    ],
  },
};

/* ---------------------------------------------------------
   COMPONENT
--------------------------------------------------------- */
export default function PredictedPaperPanel({ examId, colors, user }) {
  const T = colors || C;
  const data = PREDICTED_PAPERS[examId];

  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [paying, setPaying] = useState(false);

  // Load unlock status (Firebase if logged in, else localStorage)
  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setLoading(true);
      try {
        if (user?.uid) {
          const ref = doc(db, "users", user.uid, "unlockedPredicted", examId);
          const snap = await getDoc(ref);
          if (!cancelled) {
            setUnlocked(snap.exists() && snap.data()?.unlocked === true);
          }
        } else {
          // fallback for non-logged-in users
          const local = localStorage.getItem(`predicted-unlocked:${examId}`);
          if (!cancelled) setUnlocked(local === "true");
        }
      } catch (err) {
        console.error("Failed to load predicted unlock status:", err);
        // fallback to localStorage
        try {
          const local = localStorage.getItem(`predicted-unlocked:${examId}`);
          if (!cancelled) setUnlocked(local === "true");
        } catch {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();
    return () => { cancelled = true; };
  }, [examId, user?.uid]);

  if (!data) return null;

  const handleUnlock = async () => {
    setPaying(true);
    try {
      if (user?.uid) {
        // Save to Firebase
        const ref = doc(db, "users", user.uid, "unlockedPredicted", examId);
        await setDoc(ref, {
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          examId,
          price: data.price,
        });
      }
      // Also save to localStorage as backup
      localStorage.setItem(`predicted-unlocked:${examId}`, "true");
      setUnlocked(true);
      setShowPay(false);
    } catch (err) {
      console.error("Failed to unlock:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div
      style={{
        background: T.surface || C.paper,
        border: `1px solid ${T.line}`,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color={T.yellow || C.amber} />
          <span style={{ fontFamily: bodyFont, fontSize: 14, fontWeight: 600, color: T.ink }}>
            Predicted Paper – Last 5 Years
          </span>
        </div>
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 12,
            fontWeight: 700,
            color: T.green,
            background: T.softGreen || C.greenSoft,
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          ₹{data.price}
        </span>
      </div>

      <p style={{ fontFamily: bodyFont, fontSize: 13, color: T.inkSoft, marginBottom: 14, lineHeight: 1.5 }}>
        High-probability topics and sample questions based on the last 5 years’ papers and trends.
      </p>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.inkSoft, fontFamily: bodyFont, fontSize: 13 }}>
          <Loader2 size={16} style={{ animation: "hp-spin 0.8s linear infinite" }} />
          Checking unlock status…
        </div>
      ) : !unlocked ? (
        <>
          <button
            onClick={() => setShowPay(true)}
            style={{
              width: "100%",
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: T.ink,
              border: "none",
              borderRadius: 10,
              padding: "12px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Lock size={15} /> Unlock for ₹{data.price}
          </button>

          {showPay && (
            <div
              style={{
                marginTop: 14,
                background: T.bg,
                border: `1px solid ${T.line}`,
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ fontFamily: bodyFont, fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 6 }}>
                Confirm Payment
              </div>
              <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: T.inkSoft, marginBottom: 12 }}>
                You are unlocking <strong>{data.title}</strong> for ₹{data.price}.
                <br />
                <span style={{ fontSize: 11, fontStyle: "italic" }}>
                  {user ? "(Demo mode – no real payment. Unlock will sync across devices)" : "(Demo mode – no real payment)"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleUnlock}
                  disabled={paying}
                  style={{
                    flex: 1,
                    fontFamily: bodyFont,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    background: paying ? T.line : T.green,
                    border: "none",
                    borderRadius: 8,
                    padding: "10px",
                    cursor: paying ? "default" : "pointer",
                  }}
                >
                  {paying ? "Processing…" : `Pay ₹${data.price}`}
                </button>
                <button
                  onClick={() => setShowPay(false)}
                  disabled={paying}
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 13,
                    color: T.inkSoft,
                    background: "transparent",
                    border: `1px solid ${T.line}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 11,
              color: T.green,
              fontWeight: 600,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ShieldCheck size={13} /> Unlocked {user ? "• synced across devices" : ""}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
              High-Weightage Topics
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {data.topics.map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.line}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: T.ink }}>
                      {t.name}
                    </span>
                    <span
                      style={{
                        fontFamily: monoFont,
                        fontSize: 10,
                        fontWeight: 700,
                        color: t.weight.includes("Very") || t.weight === "High" ? T.red : T.yellow,
                        background: t.weight.includes("Very") || t.weight === "High" ? (T.softRed || C.redSoft) : (T.softYellow || C.amberSoft),
                        padding: "2px 7px",
                        borderRadius: 20,
                        flexShrink: 0,
                      }}
                    >
                      {t.weight}
                    </span>
                  </div>
                  <div style={{ fontFamily: bodyFont, fontSize: 12, color: T.inkSoft, marginTop: 3 }}>
                    {t.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
              Sample Predicted Questions
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {data.sampleQuestions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.line}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontFamily: bodyFont,
                    fontSize: 13,
                    color: T.ink,
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: T.inkSoft, fontFamily: monoFont, fontSize: 11, marginRight: 6 }}>
                    Q{i + 1}.
                  </span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes hp-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}