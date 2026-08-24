import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";
import { Ticket, Mail, Lock, ArrowRight, User } from "lucide-react";

/* =========================================================
   DESIGN TOKENS (same as main app)
========================================================= */
const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";

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
};

const OMR_BG = `radial-gradient(circle, rgba(20,33,61,0.055) 1px, transparent 1px)`;

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged in App.jsx will handle the rest
    } catch (err) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        // User closed the popup — no need to show error
      } else if (err.code === "auth/cancelled-popup-request") {
        // Ignore
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; }
        input:focus {
          outline: 2px solid ${C.ink};
          outline-offset: 2px;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>
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

            {/* Error / Success */}
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
              disabled={loading || googleLoading}
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

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "22px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: C.line }} />
            <span style={{ fontSize: 12.5, color: C.inkSoft }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              background: "#fff",
              color: C.ink,
              fontFamily: bodyFont,
              fontSize: 14.5,
              fontWeight: 600,
              cursor: googleLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {/* Google Logo */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.96-2.18l-2.908-2.259c-.806.54-1.837.86-3.052.86-2.347 0-4.332-1.585-5.042-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.958 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.276-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.001-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.958 7.294C4.668 5.163 6.653 3.58 9 3.58z"
              />
            </svg>
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>
        </div>

        {/* Footer */}
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