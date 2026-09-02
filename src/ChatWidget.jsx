import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";

function mockReply(question) {
  const q = (question || "").toLowerCase();
  if (q.includes("upsc") || q.includes("cse") || q.includes("ias"))
    return "UPSC CSE has three stages: Prelims (objective), Mains (9 descriptive papers) and Interview.\n\nFocus areas:\n• Polity, Economy, History, Geography, Environment, Current Affairs\n• Answer writing practice is critical for Mains\n• Prelims rewards accuracy + elimination\n\nAlways verify the latest notification on upsc.gov.in.";
  if (q.includes("jee") || q.includes("advanced"))
    return "JEE Main tests Physics, Chemistry and Maths (90 questions).\n\nStrategy tips:\n• Master NCERT (especially Chemistry)\n• Timed previous-year papers\n• High-weightage chapters first\n• Two sessions/year — use Session 1 as a benchmark\n\nConfirm dates on the official NTA site.";
  if (q.includes("neet") || q.includes("medical") || q.includes("biology"))
    return "NEET UG = Physics + Chemistry + Biology (180 questions).\n\nBiology carries the highest weight — master NCERT line by line.\n• Daily diagram/process revision\n• Weekly full-length mocks closer to the exam\n• Analyse every wrong answer\n\nConfirm eligibility & date on neet.nta.nic.in.";
  if (q.includes("ssc") || q.includes("cgl"))
    return "SSC CGL: Tier I (objective) → Tier II.\n\nKey areas: Quant, Reasoning, English, General Awareness.\n• Daily quant + reasoning sets\n• Current affairs + static GK\n• Speed + accuracy > attempting everything\n\nCheck ssc.nic.in for official notifications.";
  if (q.includes("cat") || q.includes("mba") || q.includes("iim"))
    return "CAT: VARC, DILR, Quant (66 questions, sectional time limits).\n\n• Build reading habit for VARC\n• Practise DILR sets (not single questions)\n• Strengthen arithmetic + algebra\n• Take mocks seriously under timed conditions\n\nConfirm registration on iimcat.ac.in.";
  if (q.includes("ibps") || q.includes("bank") || q.includes("po"))
    return "IBPS PO: Prelims → Mains → Interview.\n\nPrelims: Reasoning, Quant, English.\nMains adds GA + descriptive writing.\n• Speed in quant & reasoning for Prelims\n• Banking awareness + current affairs for Mains\n• Practise letter/essay writing\n\nVerify dates on ibps.in.";
  if (q.includes("gate"))
    return "GATE is a single paper (mostly MCQ + NAT) testing core engineering + aptitude.\n\n• Strengthen core subjects from standard textbooks\n• Practise previous year papers thoroughly\n• Virtual calculator practice helps\n• General Aptitude is scoring — don't ignore it\n\nConfirm on the organising IIT site for the year.";
  if (q.includes("syllabus") || q.includes("pattern"))
    return "Open any exam card in Hall Pass for a quick pattern & eligibility summary.\n\nFor the full official syllabus always download the latest notification from the exam authority's website.";
  if (q.includes("study plan") || q.includes("timetable") || q.includes("how to prepare") || q.includes("strategy"))
    return "A solid plan has three layers:\n\n1. Daily — fixed hours for core subjects + current affairs\n2. Weekly — one full mock or focused revision block\n3. Monthly — analyse weak areas and re-allocate time\n\nUse Notes in Hall Pass to tag weak topics. Consistency beats intensity.";
  if (q.includes("age") || q.includes("eligibility") || q.includes("attempt"))
    return "Eligibility (age, attempts, qualification) differs by exam and category (General / OBC / SC / ST / EWS / PwD).\n\nHall Pass shows the general-category summary. For exact figures including relaxations, always read the latest official notification.";
  return "I'm Hall Pass's study assistant. I can help with:\n\n• Exam patterns & strategy (UPSC, SSC, JEE, NEET, CAT, IBPS, GATE…)\n• Syllabus approach & revision tips\n• Study plans and weak-area guidance\n• General eligibility questions\n\nAsk me something specific about an exam or topic.\nFor exact dates, fees or notifications, always double-check the official website.";
}

export default function ChatWidget({ colors, fonts }) {
  const T = colors || {
    bg: "#f4f1ea",
    surface: "#ffffff",
    ink: "#14213d",
    inkSoft: "#667085",
    line: "#d9d5cc",
    red: "#c84c4c",
  };
  const displayFont = fonts?.display || "'Space Grotesk', sans-serif";
  const bodyFont = fonts?.body || "'IBM Plex Sans', sans-serif";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hp-chat-history");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  const persist = useCallback((list) => {
    try {
      localStorage.setItem("hp-chat-history", JSON.stringify(list));
    } catch {}
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
    const final = [...next, { role: "assistant", content: mockReply(text) }];
    setMessages(final);
    persist(final);
    setSending(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            right: "clamp(12px, 4vw, 24px)",
            bottom: "clamp(78px, 14vw, 92px)",
            width: "min(360px, calc(100vw - 24px))",
            height: "min(520px, calc(100vh - 140px))",
            background: T.bg,
            border: `1px solid ${T.line}`,
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(20,33,61,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 80,
          }}
        >
          <div
            style={{
              background: T.ink,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot size={16} color="#fff" />
              <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 14, color: "#fff" }}>
                Ask Hall Pass
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 4 }}
            >
              <X size={17} />
            </button>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {loaded && messages.length === 0 && (
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 12.5,
                  color: T.inkSoft,
                  textAlign: "center",
                  padding: "16px 6px",
                  lineHeight: 1.5,
                }}
              >
                Ask me anything about your exam — pattern, syllabus, strategy, or a concept you are stuck on.
                <div style={{ fontSize: 11, marginTop: 8, fontStyle: "italic" }}>
                  For dates, fees and notifications, always confirm on the official site.
                </div>
              </div>
            )}
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
                >
                  <div
                    style={{
                      maxWidth: "84%",
                      fontFamily: bodyFont,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: isUser ? "#fff" : T.ink,
                      background: isUser ? T.ink : T.surface,
                      border: isUser ? "none" : `1px solid ${T.line}`,
                      borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                      padding: "9px 12px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: bodyFont,
                  fontSize: 12,
                  color: T.inkSoft,
                  padding: "4px 2px",
                }}
              >
                <Loader2 size={13} style={{ animation: "hp-spin 0.8s linear infinite" }} /> Thinking…
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: `1px solid ${T.line}`,
              background: T.surface,
              padding: 10,
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask a question…"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                maxHeight: 90,
                fontFamily: bodyFont,
                fontSize: 13,
                color: T.ink,
                background: T.bg,
                border: `1px solid ${T.line}`,
                borderRadius: 9,
                padding: "8px 10px",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              aria-label="Send"
              style={{
                background: input.trim() && !sending ? T.ink : T.line,
                border: "none",
                borderRadius: 9,
                color: "#fff",
                cursor: input.trim() && !sending ? "pointer" : "default",
                flexShrink: 0,
                padding: 8,
                display: "inline-flex",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open AI study chat"}
        style={{
          position: "fixed",
          right: "clamp(12px, 4vw, 24px)",
          bottom: "clamp(16px, 4vw, 24px)",
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: T.ink,
          border: "none",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(20,33,61,0.28)",
          cursor: "pointer",
          zIndex: 80,
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <style>{`
        @keyframes hp-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}