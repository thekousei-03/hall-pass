import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    serverTimestamp,
    getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const STARRED_COL = "starred";

/**
 * Live listener for a user's starred exams.
 * Returns a Set of examIds.
 */
export function subscribeStarred(userId, onData, onError) {
    if (!userId) {
        onData(new Set());
        return () => {};
    }

    const q = query(
        collection(db, STARRED_COL),
        where("userId", "==", userId)
    );

    return onSnapshot(
        q,
        (snap) => {
            const ids = new Set(snap.docs.map((d) => d.data().examId));
            onData(ids);
        },
        (err) => {
            console.error("starred listener error:", err);
            if (onError) onError(err);
        }
    );
}

/**
 * Star an exam (idempotent)
 */
export async function starExam(userId, examId) {
    if (!userId || !examId) return;
    const ref = doc(db, STARRED_COL, `${userId}_${examId}`);
    await setDoc(
        ref, {
            userId,
            examId,
            starredAt: serverTimestamp(),
        }, { merge: true }
    );
}

/**
 * Unstar an exam
 */
export async function unstarExam(userId, examId) {
    if (!userId || !examId) return;
    const ref = doc(db, STARRED_COL, `${userId}_${examId}`);
    await deleteDoc(ref);
}

/**
 * Toggle star — used by App.jsx
 */
export async function toggleStarred(userId, examId) {
    if (!userId || !examId) return;
    const ref = doc(db, STARRED_COL, `${userId}_${examId}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        await deleteDoc(ref);
    } else {
        await setDoc(
            ref, {
                userId,
                examId,
                starredAt: serverTimestamp(),
            }, { merge: true }
        );
    }
}