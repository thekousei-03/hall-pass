import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";
import { Ticket, Mail, Lock, ArrowRight, User } from "lucide-react";

/* =========================================================
   DESIGN TOKENS (same as main app)
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
  softRed: "#f8e4e1",
  softGreen: "#e5f1e9",
  softBlue: "#e8eef8",
};

const OMR_BG = `radial-gradient(circle, rgba(20,33,61,0.055) 1px, transparent 1px)`;

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setSuccess("Account created successfully! Welcome to Hall Pass.");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      console.error(err);
      // Friendly error messages
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `${OMR_BG}, ${C.bg}`,
        backgroundSize: "18px 18px, auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: bodyFont,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        input:focus {
          outline: 2px solid ${C.ink};
          outline-offset: 2px;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Logo / Branding */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: C.ink,
              color: "#fff",
              marginBottom: 14,
            }}
          >
            <Ticket size={32} />
          </div>
          <h1
            style={{
              fontFamily: displayFont,
              fontSize: 28,
              fontWeight: 700,
              color: C.ink,
              margin: "0 0 6px",
            }}
          >
            Hall Pass
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: C.inkSoft,
              lineHeight: 1.5,
            }}
          >
            Your simple dashboard for tracking<br />
            important competitive exams.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: "28px 24px",
            boxShadow: "0 8px 30px rgba(20,33,61,0.06)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: C.bg,
              borderRadius: 10,
              padding: 4,
              marginBottom: 24,
            }}
          >
            <button
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderRadius: 8,
                background: mode === "login" ? C.ink : "transparent",
                color: mode === "login" ? "#fff" : C.inkSoft,
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Log in
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccess("");
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderRadius: 8,
                background: mode === "signup" ? C.ink : "transparent",
                color: mode === "signup" ? "#fff" : C.inkSoft,
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: C.ink,
                    marginBottom: 6,
                  }}
                >
                  Full name
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    color={C.inkSoft}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required={mode === "signup"}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 38px",
                      border: `1px solid ${C.line}`,
                      borderRadius: 9,
                      fontSize: 14,
                      fontFamily: bodyFont,
                      background: "#fff",
                      color: C.ink,
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  color={C.inkSoft}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 38px",
                    border: `1px solid ${C.line}`,
                    borderRadius: 9,
                    fontSize: 14,
                    fontFamily: bodyFont,
                    background: "#fff",
                    color: C.ink,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  color={C.inkSoft}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 38px",
                    border: `1px solid ${C.line}`,
                    borderRadius: 9,
                    fontSize: 14,
                    fontFamily: bodyFont,
                    background: "#fff",
                    color: C.ink,
                  }}
                />
              </div>
            </div>

            {/* Error / Success messages */}
            {error && (
              <div
                style={{
                  background: C.softRed,
                  color: C.red,
                  border: `1px solid ${C.red}40`,
                  borderRadius: 9,
                  padding: "10px 12px",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  background: C.softGreen,
                  color: C.green,
                  border: `1px solid ${C.green}40`,
                  borderRadius: 9,
                  padding: "10px 12px",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: 10,
                background: C.ink,
                color: "#fff",
                fontFamily: bodyFont,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  {mode === "login" ? "Log in" : "Create account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer text */}
        <p
          style={{
            textAlign: "center",
            marginTop: 22,
            fontSize: 12.5,
            color: C.inkSoft,
            lineHeight: 1.5,
          }}
        >
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: C.ink,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 12.5,
                  padding: 0,
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: C.ink,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 12.5,
                  padding: 0,
                }}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}