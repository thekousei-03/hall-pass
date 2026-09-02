import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Lock,
  Clock,
  Video,
  CreditCard,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const PACKAGES = [
  {
    id: "doubt",
    title: "Doubt Clearing",
    duration: "30 min",
    price: 499,
    desc: "Focused 1:1 call on specific topics or PYQs you're stuck on.",
  },
  {
    id: "strategy",
    title: "Strategy Review",
    duration: "45 min",
    price: 999,
    desc: "Personalised study plan + honest feedback on your current level.",
    popular: true,
  },
  {
    id: "mock",
    title: "Mock Interview",
    duration: "60 min",
    price: 1499,
    desc: "Full mock interview practice with detailed feedback (where applicable).",
  },
];

function fmtTs(ts) {
  try {
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MentorSession({ exam, user, colors, fonts }) {
  const T = colors || {
    surface: "#fff",
    bg: "#f4f1ea",
    ink: "#14213d",
    inkSoft: "#667085",
    line: "#d9d5cc",
    green: "#3c7a57",
    softGreen: "#e5f1e9",
    yellow: "#d99a27",
    softYellow: "#f8efd9",
  };
  const displayFont = fonts?.display || "'Space Grotesk', sans-serif";
  const bodyFont = fonts?.body || "'IBM Plex Sans', sans-serif";
  const monoFont = fonts?.mono || "'IBM Plex Mono', monospace";

  const storageKey = `mentor-booked:${exam?.id || "unknown"}`;

  const [selected, setSelected] = useState("strategy");
  const [step, setStep] = useState("browse");
  const [booked, setBooked] = useState(null);
  const [paying, setPaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setStep("browse");
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setBooked(parsed);
        setStep("success");
      } else {
        setBooked(null);
      }
    } catch {
      setBooked(null);
    }
    setLoaded(true);
  }, [exam?.id]);

  const pkg = PACKAGES.find((p) => p.id === selected) || PACKAGES[1];

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1200));
    const record = {
      packageId: pkg.id,
      title: pkg.title,
      price: pkg.price,
      examId: exam.id,
      examName: exam.shortName,
      bookedAt: Date.now(),
      userId: user?.uid || null,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {}
    setBooked(record);
    setPaying(false);
    setStep("success");
  };

  if (!loaded) {
    return (
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 14,
          padding: 24,
          textAlign: "center",
          marginTop: 18,
        }}
      >
        <Loader2 size={18} style={{ animation: "hp-spin 0.8s linear infinite" }} color={T.inkSoft} />
      </div>
    );
  }

  if (step === "success" && booked) {
    return (
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 14,
          padding: 16,
          marginTop: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <CheckCircle2 size={18} color={T.green} />
          <span style={{ fontFamily: bodyFont, fontSize: 14, fontWeight: 700, color: T.ink }}>
            Session booked
          </span>
        </div>

        <div
          style={{
            background: T.softGreen,
            border: `1px solid ${T.green}33`,
            borderRadius: 10,
            padding: 14,
          }}
        >
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 16, color: T.ink }}>
            {booked.title}
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: T.inkSoft, marginTop: 4 }}>
            for <strong style={{ color: T.ink }}>{exam.shortName}</strong>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              fontFamily: monoFont,
              fontSize: 12,
              color: T.inkSoft,
            }}
          >
            <span>₹{booked.price}</span>
            <span>·</span>
            <span>{fmtTs(booked.bookedAt)}</span>
          </div>
        </div>

        <p
          style={{
            fontFamily: bodyFont,
            fontSize: 12.5,
            color: T.inkSoft,
            marginTop: 12,
            lineHeight: 1.55,
          }}
        >
          A mentor will reach out within 24 hours to schedule the call. This is a{" "}
          <strong>demo booking</strong> — no real payment was taken.
        </p>

        <button
          onClick={() => {
            localStorage.removeItem(storageKey);
            setBooked(null);
            setStep("browse");
          }}
          style={{
            marginTop: 10,
            width: "100%",
            fontFamily: bodyFont,
            fontSize: 12.5,
            fontWeight: 600,
            color: T.inkSoft,
            background: T.bg,
            border: `1px solid ${T.line}`,
            borderRadius: 8,
            padding: "9px 12px",
            cursor: "pointer",
          }}
        >
          Book another session
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 14,
          padding: 16,
          marginTop: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <CreditCard size={15} color={T.inkSoft} />
          <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: T.ink }}>
            Confirm & pay
          </span>
        </div>

        <div
          style={{
            background: T.bg,
            border: `1px solid ${T.line}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 16, color: T.ink }}>
            {pkg.title}
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>
            {exam.shortName} · {pkg.duration}
          </div>
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: 22,
              color: T.ink,
              marginTop: 10,
            }}
          >
            ₹{pkg.price}
          </div>
        </div>

        <p
          style={{
            fontFamily: bodyFont,
            fontSize: 12,
            color: T.inkSoft,
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          Demo payment — no real charge. In production this opens Razorpay / UPI.
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setStep("browse")}
            disabled={paying}
            style={{
              flex: 1,
              fontFamily: bodyFont,
              fontSize: 12.5,
              fontWeight: 600,
              color: T.ink,
              background: T.bg,
              border: `1px solid ${T.line}`,
              borderRadius: 8,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <button
            onClick={handlePay}
            disabled={paying}
            style={{
              flex: 2,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: bodyFont,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#fff",
              background: paying ? T.inkSoft : T.green,
              border: "none",
              borderRadius: 8,
              padding: "10px 12px",
              cursor: paying ? "default" : "pointer",
            }}
          >
            {paying ? (
              <>
                <Loader2 size={14} style={{ animation: "hp-spin 0.8s linear infinite" }} /> Processing…
              </>
            ) : (
              <>
                <Lock size={13} /> Pay ₹{pkg.price}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: 14,
        padding: 16,
        marginTop: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GraduationCap size={18} color={T.ink} />
          <span style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, color: T.ink }}>
            Mentor Sessions
          </span>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: monoFont,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.4,
            color: T.yellow,
            background: T.softYellow,
            borderRadius: 20,
            padding: "3px 9px",
            textTransform: "uppercase",
          }}
        >
          <Lock size={10} /> Paid
        </span>
      </div>

      <p
        style={{
          fontFamily: bodyFont,
          fontSize: 12.5,
          color: T.inkSoft,
          marginBottom: 14,
          lineHeight: 1.55,
        }}
      >
        Book a 1:1 session with a mentor who has cleared{" "}
        <strong style={{ color: T.ink }}>{exam.shortName}</strong>. Strategy, doubt-clearing, or
        mock interviews — paid & private.
      </p>

      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
        {PACKAGES.map((p) => {
          const isSel = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              style={{
                textAlign: "left",
                background: isSel ? T.bg : "transparent",
                border: `1.5px solid ${isSel ? T.ink : T.line}`,
                borderRadius: 10,
                padding: "11px 12px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {p.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 10,
                    fontFamily: monoFont,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    color: "#fff",
                    background: T.ink,
                    borderRadius: 10,
                    padding: "2px 7px",
                    textTransform: "uppercase",
                  }}
                >
                  Popular
                </span>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: bodyFont, fontSize: 13.5, fontWeight: 600, color: T.ink }}>
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 12,
                      color: T.inkSoft,
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {p.desc}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 6,
                      fontFamily: monoFont,
                      fontSize: 11,
                      color: T.inkSoft,
                    }}
                  >
                    <Clock size={11} /> {p.duration}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: displayFont,
                    fontWeight: 700,
                    fontSize: 16,
                    color: T.ink,
                    flexShrink: 0,
                  }}
                >
                  ₹{p.price}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setStep("confirm")}
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: bodyFont,
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          background: T.ink,
          border: "none",
          borderRadius: 8,
          padding: "11px 14px",
          cursor: "pointer",
        }}
      >
        <Video size={15} /> Continue to book — ₹{pkg.price}
      </button>

      <div
        style={{
          fontFamily: bodyFont,
          fontSize: 11,
          color: T.inkSoft,
          marginTop: 10,
          textAlign: "center",
        }}
      >
        Secure demo checkout · Real payments with Razorpay coming soon
      </div>

      <style>{`
        @keyframes hp-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}