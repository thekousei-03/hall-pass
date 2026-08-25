import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    limit,
    deleteDoc,
    doc,
    getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const ATTEMPTS_COL = "testAttempts";

/**
 * Live listener – newest first (client-side sort)
 */
export function subscribeAttempts(userId, onData, onError) {
    if (!userId) {
        onData([]);
        return () => {};
    }

    const q = query(
        collection(db, ATTEMPTS_COL),
        where("userId", "==", userId),
        limit(50)
    );

    return onSnapshot(
        q,
        (snap) => {
            const list = snap.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    at: data.at ? .toDate ?
                        data.at.toDate().toISOString() :
                        data.at || null,
                };
            });

            list.sort((a, b) => {
                const ta = a.at ? new Date(a.at).getTime() : 0;
                const tb = b.at ? new Date(b.at).getTime() : 0;
                return tb - ta;
            });

            onData(list);
        },
        (err) => {
            console.error("attempts listener error:", err);
            if (onError) onError(err);
        }
    );
}

/**
 * Save a completed mock attempt
 */
export async function saveAttempt(userId, attempt) {
    if (!userId) {
        console.warn("saveAttempt: no userId");
        return null;
    }

    try {
        const payload = {
            userId,
            examId: attempt.examId || null,
            examName: attempt.examName || "Unknown",
            mode: attempt.mode || "full",
            score: Number(attempt.score) || 0,
            maxScore: Number(attempt.maxScore) || 0,
            weakSections: Array.isArray(attempt.weakSections) ?
                attempt.weakSections :
                [],
            answersSummary: attempt.answersSummary || null,
            timeTakenSec: attempt.timeTakenSec ? ? null,
            yearStyle: attempt.yearStyle || null,
            section: attempt.section || null,
            at: serverTimestamp(),
        };

        const ref = await addDoc(collection(db, ATTEMPTS_COL), payload);
        return ref.id;
    } catch (err) {
        console.error("saveAttempt failed:", err);
        throw err;
    }
}

/**
 * Delete a single attempt
 */
export async function deleteAttempt(attemptId) {
    if (!attemptId) return;
    await deleteDoc(doc(db, ATTEMPTS_COL, attemptId));
}

/**
 * Delete all attempts of a user
 */
export async function deleteAllAttempts(userId) {
    if (!userId) return;

    const q = query(
        collection(db, ATTEMPTS_COL),
        where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    const promises = snap.docs.map((d) =>
        deleteDoc(doc(db, ATTEMPTS_COL, d.id))
    );
    await Promise.all(promises);
}