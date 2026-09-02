import React, { useState, useEffect } from "react";
import { Check, Crown, Zap, BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";
const monoFont = "'IBM Plex Mono', monospace";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect to get started",
    features: [
      "Exam tracking & countdowns",
      "Basic notes",
      "Limited practice mocks",
      "1 predicted paper preview",
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "predicted",
    name: "Predicted Paper",
    price: 49,
    period: "one-time",
    description: "Per exam",
    features: [
      "Full predicted paper (last 5 years)",
      "High-weightage topics",
      "Sample questions",
      "Unlocks for that exam only",
    ],
    cta: "Buy for ₹49",
    popular: false,
  },
  {
    id: "mocks",
    name: "Mock Series",
    price: 299,
    period: "per exam",
    description: "Serious practice",
    features: [
      "Full-length mocks",
      "Sectional tests",
      "Detailed performance analysis",
      "Weak topic insights",
    ],
    cta: "Buy for ₹299",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    period: "per year",
    description: "Best for serious aspirants",
    features: [
      "All predicted papers unlocked",
      "Unlimited full + sectional mocks",
      "Personalized study plans",
      "Priority mentor access",
      "Progress analytics across exams",
      "Early access to new features",
    ],
    cta: "Go Premium – ₹999/year",
    popular: true,
  },
];

export default function Pricing({ user, colors, onBack, currentPlan = "free" }) {
  const T = colors;
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(currentPlan);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const ref = doc(db, "users", user.uid, "subscription", "current");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setActivePlan(snap.data().plan || "free");
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user?.uid]);

  const handleSelect = async (planId) => {
    if (planId === "free" || planId === activePlan) return;
    if (!user) {
      alert("Please login to purchase a plan.");
      return;
    }

    setLoading(true);
    try {
      // Demo unlock — replace with Razorpay later
      const ref = doc(db, "users", user.uid, "subscription", "current");
      await setDoc(ref, {
        plan: planId,
        updatedAt: new Date().toISOString(),
        price: PLANS.find((p) => p.id === planId)?.price || 0,
      });

      setActivePlan(planId);
      alert(`Successfully unlocked ${PLANS.find((p) => p.id === planId)?.name}! (Demo mode)`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Header */}
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          color: T.inkSoft,
          cursor: "pointer",
          fontFamily: bodyFont,
          fontSize: 13,
          marginBottom: 20,
          padding: 0,
        }}
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: T.softYellow,
            color: T.ink,
            padding: "6px 14px",
            borderRadius: 20,
            fontFamily: monoFont,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          <Crown size={14} /> Simple pricing for serious aspirants
        </div>
        <h1
          style={{
            fontFamily: displayFont,
            fontSize: 32,
            fontWeight: 700,
            color: T.ink,
            margin: "0 0 10px",
          }}
        >
          Choose your plan
        </h1>
        <p style={{ fontFamily: bodyFont, fontSize: 15, color: T.inkSoft, margin: 0 }}>
          Start free. Upgrade when you’re ready to go all-in.
        </p>
      </div>

      {/* Plans Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {PLANS.map((plan) => {
          const isActive = activePlan === plan.id;
          const isPremium = plan.id === "premium";

          return (
            <div
              key={plan.id}
              style={{
                background: T.surface,
                border: isPremium ? `2px solid ${T.yellow}` : `1px solid ${T.line}`,
                borderRadius: 16,
                padding: 20,
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: T.yellow,
                    color: "#111",
                    fontFamily: monoFont,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontFamily: displayFont,
                    fontSize: 18,
                    fontWeight: 700,
                    color: T.ink,
                    marginBottom: 4,
                  }}
                >
                  {plan.name}
                </div>
                <div style={{ fontFamily: bodyFont, fontSize: 13, color: T.inkSoft }}>
                  {plan.description}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <span
                  style={{
                    fontFamily: displayFont,
                    fontSize: 28,
                    fontWeight: 700,
                    color: T.ink,
                  }}
                >
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 13,
                      color: T.inkSoft,
                      marginLeft: 4,
                    }}
                  >
                    / {plan.period}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, marginBottom: 20 }}>
                {plan.features.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 8,
                      fontFamily: bodyFont,
                      fontSize: 13,
                      color: T.ink,
                    }}
                  >
                    <Check size={15} color={T.green} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect(plan.id)}
                disabled={isActive || loading || plan.id === "free"}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  fontFamily: bodyFont,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isActive || plan.id === "free" ? "default" : "pointer",
                  background: isActive
                    ? T.softGreen
                    : isPremium
                    ? T.ink
                    : T.bg,
                  color: isActive ? T.green : isPremium ? "#fff" : T.ink,
                }}
              >
                {loading ? (
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                ) : isActive ? (
                  "Current Plan"
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: 28,
          fontFamily: bodyFont,
          fontSize: 12.5,
          color: T.inkSoft,
        }}
      >
        All plans are currently in demo mode. Real payments (Razorpay) coming soon.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}