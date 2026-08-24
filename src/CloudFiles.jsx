/**
 * Hall Pass — Cloud Files (NO Firebase Storage required)
 *
 * - ≤700 KB → base64 in Firestore (syncs across devices)
 * - Larger  → IndexedDB only on this device
 * - Organize by exam
 * - PDF viewer (online or offline cache)
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Cloud, Upload, FileText, Trash2, Download, Loader2,
  WifiOff, Eye, FolderOpen, X, HardDrive,
} from "lucide-react";
import { db } from "./firebase";
import * as firestore from "firebase/firestore";

const {
  collection, addDoc, deleteDoc, doc, where, serverTimestamp, onSnapshot,
} = firestore;
const firestoreQuery = firestore.query;

const C = {
  bg: "#f4f1ea",
  surface: "#ffffff",
  ink: "#14213d",
  inkSoft: "#667085",
  line: "#d9d5cc",
  red: "#c84c4c",
  green: "#3c7a57",
  blue: "#4267a9",
  yellow: "#d99a27",
  softRed: "#f8e4e1",
  softBlue: "#e8eef8",
  softGreen: "#e5f1e9",
  softYellow: "#f8efd9",
};

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";
const monoFont = "'IBM Plex Mono', monospace";

const CLOUD_MAX_BYTES = 700 * 1024;
const LOCAL_MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
];

const EXAM_OPTIONS = [
  { id: "", label: "No exam (general)" },
  { id: "upsc-cse", label: "UPSC CSE" },
  { id: "ssc-cgl", label: "SSC CGL" },
  { id: "jee-main", label: "JEE Main" },
  { id: "gate", label: "GATE" },
  { id: "cat", label: "CAT" },
  { id: "neet-ug", label: "NEET UG" },
  { id: "ibps-po", label: "IBPS PO" },
];

const IDB_NAME = "hallpass-offline";
const IDB_STORE = "files";

function formatBytes(n) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(ts) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function examLabel(id) {
  const found = EXAM_OPTIONS.find((e) => e.id === id);
  return found ? found.label : "General";
}

function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(IDB_STORE)) {
        d.createObjectStore(IDB_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(record) {
  const d = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(id) {
  const d = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(id) {
  const d = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbKeys() {
  const d = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).getAllKeys();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  const mime = (parts[0].match(/:(.*?);/) || [])[1] || "application/pdf";
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8 = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

const iconBtnStyle = {
  border: "1px solid #d9d5cc",
  background: "#f4f1ea",
  borderRadius: 7,
  padding: "7px 8px",
  color: "#14213d",
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
};

function IconBtn({ children, onClick, title, disabled }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...iconBtnStyle,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: bodyFont,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? "#fff" : C.inkSoft,
        background: active ? C.ink : C.bg,
        border: "1px solid " + (active ? C.ink : C.line),
        borderRadius: 16,
        padding: "5px 11px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export default function CloudFiles({ user, examId: preselectExamId = "" }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");
  const [examFilter, setExamFilter] = useState(preselectExamId || "all");
  const [uploadExam, setUploadExam] = useState(preselectExamId || "");
  const [offlineIds, setOfflineIds] = useState(new Set());
  const [viewer, setViewer] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const inputRef = useRef(null);

  const refreshOfflineIds = useCallback(async () => {
    try {
      const keys = await idbKeys();
      setOfflineIds(new Set(keys.map(String)));
    } catch {
      setOfflineIds(new Set());
    }
  }, []);

  useEffect(() => {
    refreshOfflineIds();
  }, [refreshOfflineIds]);

  useEffect(() => {
    if (preselectExamId) {
      setUploadExam(preselectExamId);
      setExamFilter(preselectExamId);
    }
  }, [preselectExamId]);

  useEffect(() => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsub = () => {};
    try {
      const q = firestoreQuery(
        collection(db, "cloudFiles"),
        where("userId", "==", user.uid)
      );

      unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const at = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const bt = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return bt - at;
            });
          setFiles(list);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError(
            err.code === "permission-denied"
              ? "Can't load cloud files — publish the cloudFiles Firestore rules."
              : "Can't load cloud files. Check connection."
          );
          setLoading(false);
        }
      );
    } catch (e) {
      console.error(e);
      setError("Cloud files setup error. Refresh the page.");
      setLoading(false);
    }

    return () => unsub();
  }, [user]);

  const filtered = useMemo(() => {
    if (examFilter === "all") return files;
    if (examFilter === "none") return files.filter((f) => !f.examId);
    return files.filter((f) => f.examId === examFilter);
  }, [files, examFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((f) => {
      const key = f.examId || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    });
    const order = EXAM_OPTIONS.map((e) => e.id);
    return Array.from(map.entries()).sort(
      (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
    );
  }, [filtered]);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    if (!ALLOWED.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Allowed: PDF, JPG, PNG, WEBP, or TXT.");
      return;
    }
    if (file.size > LOCAL_MAX_BYTES) {
      alert("Max file size is 15 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const syncToCloud = file.size <= CLOUD_MAX_BYTES;
      let dataUrl = null;
      if (syncToCloud) dataUrl = await fileToBase64(file);

      if (syncToCloud && dataUrl) {
        const docRef = await addDoc(collection(db, "cloudFiles"), {
          userId: user.uid,
          name: label.trim() || file.name,
          originalName: file.name,
          contentType: file.type || "application/pdf",
          size: file.size,
          dataUrl,
          storageMode: "firestore",
          examId: uploadExam || null,
          examLabel: examLabel(uploadExam),
          createdAt: serverTimestamp(),
        });

        await idbPut({
          id: docRef.id,
          name: label.trim() || file.name,
          contentType: file.type || "application/pdf",
          blob: file,
          savedAt: Date.now(),
        });
      } else {
        const docRef = await addDoc(collection(db, "cloudFiles"), {
          userId: user.uid,
          name: label.trim() || file.name,
          originalName: file.name,
          contentType: file.type || "application/pdf",
          size: file.size,
          storageMode: "local-only",
          localOnly: true,
          examId: uploadExam || null,
          examLabel: examLabel(uploadExam),
          createdAt: serverTimestamp(),
          note: "File larger than 700 KB — stored only on this device (Spark plan).",
        });

        await idbPut({
          id: docRef.id,
          name: label.trim() || file.name,
          contentType: file.type || "application/pdf",
          blob: file,
          savedAt: Date.now(),
        });
      }

      await refreshOfflineIds();
      setLabel("");
    } catch (err) {
      console.error(err);
      setError(
        err.code === "permission-denied"
          ? "Upload blocked — check cloudFiles Firestore rules."
          : "Upload failed. Try a smaller file or check connection."
      );
    } finally {
      setUploading(false);
    }
  };

  const openViewer = async (item) => {
    setBusyId(item.id);
    try {
      const cached = await idbGet(item.id);
      if (cached?.blob) {
        const url = URL.createObjectURL(cached.blob);
        setViewer({ url, name: item.name, offline: true, revoke: true });
        return;
      }

      if (item.dataUrl) {
        const blob = base64ToBlob(item.dataUrl);
        try {
          await idbPut({
            id: item.id,
            name: item.name,
            contentType: item.contentType || blob.type,
            blob,
            savedAt: Date.now(),
          });
          await refreshOfflineIds();
        } catch (_) {}
        const url = URL.createObjectURL(blob);
        setViewer({ url, name: item.name, offline: false, revoke: true });
        return;
      }

      alert(
        item.localOnly
          ? "This file was uploaded on another device (or cache cleared). Re-upload here, or use a file under 700 KB so it syncs."
          : "File data not available on this device."
      );
    } finally {
      setBusyId(null);
    }
  };

  const saveOffline = async (item) => {
    setBusyId(item.id);
    try {
      if (item.dataUrl) {
        const blob = base64ToBlob(item.dataUrl);
        await idbPut({
          id: item.id,
          name: item.name,
          contentType: item.contentType || blob.type,
          blob,
          savedAt: Date.now(),
        });
        await refreshOfflineIds();
        return;
      }
      const cached = await idbGet(item.id);
      if (cached?.blob) {
        await refreshOfflineIds();
        return;
      }
      alert("No file data to cache on this device.");
    } catch (err) {
      console.error(err);
      alert("Could not save offline.");
    } finally {
      setBusyId(null);
    }
  };

  const removeOffline = async (id) => {
    try {
      await idbDelete(id);
      await refreshOfflineIds();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadFile = async (item) => {
    try {
      let blob = null;
      const cached = await idbGet(item.id);
      if (cached?.blob) blob = cached.blob;
      else if (item.dataUrl) blob = base64ToBlob(item.dataUrl);
      if (!blob) {
        alert("File not available to download on this device.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.originalName || item.name || "file.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed.");
    }
  };

  const removeFile = async (item) => {
    if (!user) return;
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "cloudFiles", item.id));
      await idbDelete(item.id).catch(() => {});
      await refreshOfflineIds();
    } catch (err) {
      console.error(err);
      alert("Could not delete file.");
    }
  };

  const closeViewer = () => {
    if (viewer?.revoke && viewer.url) URL.revokeObjectURL(viewer.url);
    setViewer(null);
  };

  if (!user) return null;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Cloud size={20} color={C.ink} />
          <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 20, color: C.ink }}>
            Cloud files
          </h2>
        </div>
        <div style={{ marginTop: 4, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft, maxWidth: 480, lineHeight: 1.45 }}>
          Synced to <strong style={{ color: C.ink }}>{user.email}</strong> via Firestore.
          Files under ~700 KB sync across devices; larger ones stay on this device.
        </div>
      </div>

      <div style={{ background: C.softYellow, borderRadius: 9, padding: "9px 11px", marginBottom: 12, fontSize: 12, fontFamily: bodyFont, color: C.ink, lineHeight: 1.45 }}>
        <strong>Free plan tip:</strong> compress PDFs under 700 KB for full cloud sync.
      </div>

      {error && (
        <div style={{ background: C.softRed, color: C.red, borderRadius: 9, padding: "9px 11px", marginBottom: 12, fontSize: 12.5, fontFamily: bodyFont }}>
          {error}
        </div>
      )}

      {/* Upload form */}
      <div style={{ background: C.softBlue, borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ fontFamily: displayFont, fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
          Upload
        </div>

        <label style={{ display: "block", fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 4 }}>
          Organize under exam (optional)
        </label>
        <select
          value={uploadExam}
          onChange={(e) => setUploadExam(e.target.value)}
          style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 8, background: "#fff", color: C.ink, fontFamily: bodyFont, fontSize: 13 }}
        >
          {EXAM_OPTIONS.map((e) => (
            <option key={e.id || "none"} value={e.id}>{e.label}</option>
          ))}
        </select>

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Optional label — e.g. Polity handout"
          style={{ width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 8, background: "#fff", color: C.ink, fontFamily: bodyFont, fontSize: 13 }}
        />

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf,image/*,.txt,text/plain"
          style={{ display: "none" }}
          onChange={onPick}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            border: "none", borderRadius: 8,
            background: uploading ? C.inkSoft : C.ink,
            color: "#fff", padding: "9px 14px",
            cursor: uploading ? "default" : "pointer",
            fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600,
          }}
        >
          {uploading ? (
            <><Loader2 size={15} style={{ animation: "hp-spin 1s linear infinite" }} /> Saving…</>
          ) : (
            <><Upload size={15} /> Choose PDF / image / txt</>
          )}
        </button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
          Filter by exam
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <FilterChip active={examFilter === "all"} onClick={() => setExamFilter("all")} label="All" />
          {EXAM_OPTIONS.filter((e) => e.id).map((e) => (
            <FilterChip key={e.id} active={examFilter === e.id} onClick={() => setExamFilter(e.id)} label={e.label} />
          ))}
          <FilterChip active={examFilter === "none"} onClick={() => setExamFilter("none")} label="General" />
        </div>
      </div>

      <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
        {filtered.length} {filtered.length === 1 ? "file" : "files"}
        {offlineIds.size > 0 ? ` · ${offlineIds.size} offline` : ""}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 24, color: C.inkSoft, fontFamily: bodyFont, fontSize: 13 }}>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 28, border: `1px dashed ${C.line}`, borderRadius: 10, color: C.inkSoft, fontFamily: bodyFont, fontSize: 13 }}>
          <FolderOpen size={28} style={{ opacity: 0.45, marginBottom: 8 }} />
          <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>No files here</div>
          <div>Upload a PDF and optionally tag it with an exam.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {grouped.map(([exId, group]) => (
            <div key={exId || "general"}>
              <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <FolderOpen size={14} />
                {examLabel(exId)} · {group.length}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {group.map((f) => {
                  const isOffline = offlineIds.has(f.id);
                  const isPdf = (f.contentType || "").includes("pdf") || (f.originalName || f.name || "").toLowerCase().endsWith(".pdf");
                  const isLocalOnly = f.localOnly || f.storageMode === "local-only";

                  return (
                    <div
                      key={f.id}
                      style={{
                        border: `1px solid ${C.line}`, borderRadius: 10, padding: "11px 12px",
                        background: "#fff", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 8,
                        background: isOffline ? C.softGreen : isLocalOnly ? C.softYellow : C.softBlue,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {isLocalOnly && !isOffline
                          ? <HardDrive size={18} color={C.yellow} />
                          : <FileText size={18} color={isOffline ? C.green : C.blue} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontFamily: bodyFont, fontSize: 13.5, fontWeight: 600, color: C.ink }}>
                          {f.name}
                        </div>
                        <div style={{ fontFamily: monoFont, fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>
                          {formatBytes(f.size)}
                          {f.createdAt ? ` · ${formatDate(f.createdAt)}` : ""}
                          {isPdf ? " · PDF" : ""}
                          {isOffline ? " · Offline ready" : ""}
                          {isLocalOnly ? " · This device" : " · Cloud sync"}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {isPdf && (
                          <IconBtn title="View" onClick={() => openViewer(f)} disabled={busyId === f.id}>
                            <Eye size={15} />
                          </IconBtn>
                        )}
                        {!isOffline && (f.dataUrl || isLocalOnly) && (
                          <IconBtn title="Save offline" onClick={() => saveOffline(f)} disabled={busyId === f.id}>
                            {busyId === f.id
                              ? <Loader2 size={15} style={{ animation: "hp-spin 1s linear infinite" }} />
                              : <WifiOff size={15} />}
                          </IconBtn>
                        )}
                        {isOffline && (
                          <IconBtn title="Remove offline copy" onClick={() => removeOffline(f.id)}>
                            <span style={{ fontSize: 10, fontFamily: monoFont }}>-OFF</span>
                          </IconBtn>
                        )}
                        <IconBtn title="Download" onClick={() => downloadFile(f)}>
                          <Download size={15} />
                        </IconBtn>
                        <button
                          type="button"
                          onClick={() => removeFile(f)}
                          title="Delete"
                          style={{ border: "none", background: C.softRed, borderRadius: 7, padding: "7px 8px", cursor: "pointer", color: C.red, display: "inline-flex" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewer && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(20,33,61,0.85)",
          display: "flex", flexDirection: "column", padding: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, color: "#fff" }}>
            <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {viewer.name}{viewer.offline ? " · Offline" : ""}
            </div>
            <button
              type="button"
              onClick={closeViewer}
              style={{
                border: "none", background: "rgba(255,255,255,0.15)", color: "#fff",
                borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: bodyFont, fontWeight: 600,
              }}
            >
              <X size={16} /> Close
            </button>
          </div>
          <iframe
            title={viewer.name}
            src={viewer.url}
            style={{ flex: 1, width: "100%", border: "none", borderRadius: 10, background: "#fff" }}
          />
        </div>
      )}

      <style>{`
        @keyframes hp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}