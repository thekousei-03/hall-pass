import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { SEED_EXAMS } from "../data/seedExamsData";

const EXAMS_COL = "exams";

/**
 * One-time seed. Call this from the browser console once:
 *   import { seedExams } from "./services/examService";
 *   seedExams().then(console.log)
 *
 * Safe to run multiple times — it uses setDoc with merge.
 */
export async function seedExams() {
    const results = [];
    for (const exam of SEED_EXAMS) {
        const ref = doc(db, EXAMS_COL, exam.id);
        await setDoc(
            ref, {
                ...exam,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            }, { merge: true }
        );
        results.push(exam.id);
    }
    return { seeded: results.length, ids: results };
}

/**
 * Load all exams once (Promise)
 */
export async function fetchExams() {
    const snap = await getDocs(query(collection(db, EXAMS_COL), orderBy("examDate", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Live listener — preferred in the app
 */
export function subscribeExams(onData, onError) {
    const q = query(collection(db, EXAMS_COL), orderBy("examDate", "asc"));
    return onSnapshot(
        q,
        (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            onData(list);
        },
        (err) => {
            console.error("exams listener error:", err);
            if (onError) onError(err);
        }
    );
}

/**
 * Get a single exam
 */
export async function fetchExamById(examId) {
    const snap = await getDoc(doc(db, EXAMS_COL, examId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}