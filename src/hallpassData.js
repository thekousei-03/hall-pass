/**
 * Hall Pass — central data helpers
 * Exams live in Firestore (with hard-coded fallback for offline / first load)
 * Starred + Attempts are per-user and cloud-synced
 */
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

/* =========================================================
   HARD-CODED FALLBACK (same data you already have)
   Used only if Firestore is empty or offline
========================================================= */
export const FALLBACK_EXAMS = [{
        id: "upsc-cse",
        shortName: "UPSC CSE",
        name: "Civil Services Examination",
        category: "UPSC",
        examDate: "2027-05-30",
        applicationStart: "2027-02-10",
        applicationEnd: "2027-02-28",
        description: "India's premier civil services examination conducted by the Union Public Service Commission.",
        eligibility: {
            education: "Graduate degree",
            age: "21–32 years",
            attempts: "Varies by category",
        },
        stages: ["Preliminary Examination", "Main Examination", "Personality Test"],
        syllabus: [{
                stage: "Prelims",
                papers: [{
                        name: "GS Paper I",
                        topics: [
                            "Current events of national & international importance",
                            "History of India & Indian National Movement",
                            "Indian & World Geography (Physical, Social, Economic)",
                            "Indian Polity & Governance — Constitution, Political System, Panchayati Raj, Rights",
                            "Economic & Social Development — Sustainable Development, Poverty, Inclusion",
                            "Environmental ecology, Biodiversity & Climate Change",
                            "General Science",
                        ],
                    },
                    {
                        name: "CSAT (Paper II) — Qualifying",
                        topics: [
                            "Comprehension",
                            "Interpersonal skills including communication skills",
                            "Logical reasoning & analytical ability",
                            "Decision making & problem solving",
                            "General mental ability",
                            "Basic numeracy (Class X level) & Data interpretation",
                        ],
                    },
                ],
            },
            {
                stage: "Mains",
                papers: [{
                        name: "Essay",
                        topics: [
                            "Two essays (~1000 words each) from philosophical, governance, society, technology & current-event themes",
                        ],
                    },
                    {
                        name: "GS-I — Heritage, History, Geography, Society",
                        topics: [
                            "Indian culture — art forms, literature, architecture",
                            "Modern Indian history (mid-18th century onwards)",
                            "Freedom struggle — stages & contributors",
                            "Post-independence consolidation",
                            "History of the world (18th century events, industrial revolution, world wars, etc.)",
                            "Indian society — diversity, role of women, poverty, urbanization",
                            "World & Indian geography — physical, resources, industries",
                        ],
                    },
                    {
                        name: "GS-II — Governance, Constitution, Polity, Social Justice, IR",
                        topics: [
                            "Indian Constitution — evolution, features, amendments, basic structure",
                            "Functions & responsibilities of Union & States; federal issues",
                            "Separation of powers, dispute redressal mechanisms",
                            "Parliament & State legislatures; Executive & Judiciary",
                            "Statutory, regulatory & quasi-judicial bodies",
                            "Government policies & interventions for development",
                            "Welfare schemes, social sector, health, education, HRD",
                            "International relations — India & neighbourhood, bilateral/global groupings",
                        ],
                    },
                    {
                        name: "GS-III — Technology, Economy, Biodiversity, Security, Disaster Mgmt",
                        topics: [
                            "Indian economy — planning, growth, employment, inclusive growth",
                            "Agriculture, food processing, land reforms",
                            "Science & technology developments; indigenization",
                            "Environment, biodiversity, climate change, conservation",
                            "Disaster management",
                            "Internal security — extremism, cyber security, border management",
                        ],
                    },
                    {
                        name: "GS-IV — Ethics, Integrity & Aptitude",
                        topics: [
                            "Ethics & human interface — essence, determinants, consequences",
                            "Attitude, aptitude, emotional intelligence",
                            "Moral thinkers & philosophers (India & world)",
                            "Public/Civil service values & ethics in public administration",
                            "Probity in governance, RTI, codes of ethics/conduct",
                            "Case studies on above issues",
                        ],
                    },
                    {
                        name: "Optional Subject (2 papers)",
                        topics: [
                            "One optional subject chosen from the official list of ~48 subjects (literature & non-literature)",
                        ],
                    },
                ],
            },
        ],
        officialWebsite: "https://upsc.gov.in/",
        notificationUrl: "https://www.upsc.gov.in/examinations/previous-question-papers",
        status: "upcoming",
        lastVerified: null,
        source: "Hardcoded seed (replace with official notification)",
        sourceUrl: "https://upsc.gov.in/",
    },
    {
        id: "ssc-cgl",
        shortName: "SSC CGL",
        name: "Combined Graduate Level Examination",
        category: "SSC",
        examDate: "2027-06-15",
        applicationStart: "2027-03-15",
        applicationEnd: "2027-04-10",
        description: "A major recruitment examination for Group B and Group C posts in the Government of India.",
        eligibility: {
            education: "Graduate degree",
            age: "18–32 years depending on post",
            attempts: "No fixed attempt limit",
        },
        stages: ["Tier-I", "Tier-II", "Document Verification"],
        syllabus: [{
                stage: "Tier I",
                papers: [{
                        name: "General Intelligence & Reasoning",
                        topics: [
                            "Analogy, Classification, Series (number/figural)",
                            "Coding-Decoding, Blood Relations, Direction Sense",
                            "Venn Diagrams, Syllogism, Statement–Conclusion",
                            "Paper folding/cutting, Embedded figures, Matrix",
                            "Order & Ranking, Puzzles",
                        ],
                    },
                    {
                        name: "General Awareness",
                        topics: [
                            "Current events (national & international)",
                            "Indian History, Geography, Polity & Constitution",
                            "Economy, Budget, Government schemes",
                            "General Science & Everyday Science",
                            "Environment, Ecology, Sports, Awards, Books",
                        ],
                    },
                    {
                        name: "Quantitative Aptitude",
                        topics: [
                            "Number System, Simplification, LCM/HCF",
                            "Percentage, Ratio & Proportion, Average",
                            "Profit & Loss, Discount, SI & CI",
                            "Time & Work, Time-Speed-Distance, Mixture",
                            "Algebra, Geometry, Mensuration, Trigonometry",
                            "Data Interpretation (tables, graphs)",
                        ],
                    },
                    {
                        name: "English Comprehension",
                        topics: [
                            "Reading Comprehension, Cloze Test",
                            "Error Spotting, Sentence Improvement",
                            "Synonyms, Antonyms, Idioms & Phrases",
                            "One-word substitution, Fill in the blanks",
                            "Para Jumbles, Active/Passive, Direct/Indirect",
                        ],
                    },
                ],
            },
            {
                stage: "Tier II (Paper I — compulsory)",
                papers: [{
                        name: "Mathematical Abilities",
                        topics: [
                            "Advanced Arithmetic, Algebra, Geometry, Mensuration",
                            "Trigonometry, Statistics, Probability, Data Interpretation",
                        ],
                    },
                    {
                        name: "Reasoning & General Intelligence",
                        topics: [
                            "Higher-order puzzles, seating arrangements, critical thinking, emotional & social intelligence",
                        ],
                    },
                    {
                        name: "English Language & Comprehension",
                        topics: [
                            "Longer RC passages, para-jumbles, advanced grammar, complex cloze tests",
                        ],
                    },
                    {
                        name: "General Awareness",
                        topics: ["Static GK + recent current affairs (deeper than Tier I)"],
                    },
                    {
                        name: "Computer Knowledge + DEST",
                        topics: [
                            "Computer basics, OS, MS Office, Internet, Networking; Data Entry Speed Test (qualifying)",
                        ],
                    },
                ],
            },
        ],
        officialWebsite: "https://ssc.gov.in/",
        notificationUrl: "https://ssc.gov.in/for-candidates/previous-year-question-paper",
        status: "upcoming",
        lastVerified: null,
        source: "Hardcoded seed",
        sourceUrl: "https://ssc.gov.in/",
    },
    {
        id: "jee-main",
        shortName: "JEE Main",
        name: "Joint Entrance Examination Main",
        category: "Engineering",
        examDate: "2027-01-20",
        applicationStart: "2026-10-01",
        applicationEnd: "2026-11-15",
        description: "A national-level entrance examination for undergraduate engineering and related programs.",
        eligibility: {
            education: "Class 12 or equivalent",
            age: "No specific age limit",
            attempts: "As specified by NTA",
        },
        stages: ["Computer Based Test", "Result", "Counselling"],
        syllabus: [{
            stage: "Paper 1 (B.E./B.Tech)",
            papers: [{
                    name: "Physics",
                    topics: [
                        "Units & Measurements, Kinematics, Laws of Motion",
                        "Work, Energy & Power, Rotational Motion, Gravitation",
                        "Properties of Solids & Liquids, Thermodynamics, Kinetic Theory",
                        "Oscillations & Waves",
                        "Electrostatics, Current Electricity, Magnetic Effects",
                        "EMI & AC, Electromagnetic Waves, Optics",
                        "Dual Nature of Matter, Atoms & Nuclei, Electronic Devices",
                        "Experimental Skills",
                    ],
                },
                {
                    name: "Chemistry",
                    topics: [
                        "Physical: Basic Concepts, Atomic Structure, Chemical Bonding, Thermodynamics, Equilibrium, Redox & Electrochemistry, Chemical Kinetics, Solutions, Surface Chemistry",
                        "Inorganic: Periodic Table, s/p/d/f-Block, Coordination Compounds, Isolation of Metals",
                        "Organic: Basic Principles, Hydrocarbons, Haloalkanes/Haloarenes, Alcohols/Phenols/Ethers, Aldehydes/Ketones/Carboxylic Acids, Amines, Biomolecules, Polymers",
                    ],
                },
                {
                    name: "Mathematics",
                    topics: [
                        "Sets, Relations & Functions; Complex Numbers & Quadratic Equations",
                        "Matrices & Determinants; Permutations & Combinations; Binomial Theorem",
                        "Sequences & Series; Limits, Continuity & Differentiability",
                        "Integral Calculus; Differential Equations",
                        "Coordinate Geometry (2D); Three-Dimensional Geometry; Vector Algebra",
                        "Statistics & Probability; Trigonometry",
                    ],
                },
            ],
        }, ],
        officialWebsite: "https://jeemain.nta.nic.in/",
        notificationUrl: "https://www.nta.ac.in/Downloads",
        status: "upcoming",
        lastVerified: null,
        source: "Hardcoded seed",
        sourceUrl: "https://jeemain.nta.nic.in/",
    },
    {
        id: "gate",
        shortName: "GATE",
        name: "Graduate Aptitude Test in Engineering",
        category: "Engineering",
        examDate: "2027-02-07",
        applicationStart: "2026-08-25",
        applicationEnd: "2026-10-01",
        description: "A national examination used for postgraduate admissions and recruitment opportunities in engineering and science.",
        eligibility: {
            education: "Undergraduate degree or currently pursuing eligible degree",
            age: "No age limit",
            attempts: "No attempt limit",
        },
        stages: ["Computer Based Test", "Score", "Admission / Recruitment"],
        syllabus: [{
                stage: "Common to all papers",
                papers: [{
                        name: "General Aptitude (GA) — 15 marks",
                        topics: [
                            "Verbal Ability — English grammar, sentence completion, verbal analogies, word groups, instructions, critical reasoning, verbal deduction",
                            "Numerical Ability — Numerical computation, numerical estimation, numerical reasoning, data interpretation",
                        ],
                    },
                    {
                        name: "Engineering Mathematics (most engineering papers)",
                        topics: [
                            "Linear Algebra — matrices, determinants, systems of linear equations, eigenvalues/eigenvectors",
                            "Calculus — limits, continuity, differentiation, integration, maxima/minima, multiple integrals, vector calculus",
                            "Differential Equations — first order, higher order linear ODEs, partial differential equations (intro)",
                            "Complex Variables — analytic functions, Cauchy’s theorem/integral, Taylor & Laurent series, residues",
                            "Probability & Statistics — mean, median, mode, standard deviation, random variables, distributions, hypothesis testing",
                            "Numerical Methods — interpolation, numerical integration, solutions of linear/non-linear equations",
                        ],
                    },
                ],
            },
            {
                stage: "Major paper codes (core outline)",
                papers: [{
                        name: "CS — Computer Science & Information Technology",
                        topics: [
                            "Digital Logic, Computer Organization & Architecture",
                            "Programming & Data Structures, Algorithms",
                            "Theory of Computation, Compiler Design",
                            "Operating Systems, Databases",
                            "Computer Networks",
                            "Software Engineering, Discrete Mathematics",
                        ],
                    },
                    {
                        name: "ME — Mechanical Engineering",
                        topics: [
                            "Engineering Mechanics, Strength of Materials, Theory of Machines",
                            "Vibrations, Machine Design",
                            "Fluid Mechanics, Heat Transfer, Thermodynamics",
                            "Applications (Power Engineering, IC Engines, Refrigeration & AC, Turbomachinery)",
                            "Manufacturing Engineering, Industrial Engineering",
                        ],
                    },
                    {
                        name: "EE — Electrical Engineering",
                        topics: [
                            "Electric Circuits, Electromagnetic Fields",
                            "Signals & Systems, Electrical Machines",
                            "Power Systems, Control Systems",
                            "Electrical & Electronic Measurements",
                            "Analog & Digital Electronics, Power Electronics",
                        ],
                    },
                    {
                        name: "EC — Electronics & Communication",
                        topics: [
                            "Networks, Signals & Systems, Electronic Devices",
                            "Analog Circuits, Digital Circuits",
                            "Control Systems, Communications",
                            "Electromagnetics",
                            "Engineering Mathematics as applicable",
                        ],
                    },
                    {
                        name: "CE — Civil Engineering",
                        topics: [
                            "Engineering Mathematics, Structural Engineering",
                            "Geotechnical Engineering, Water Resources",
                            "Environmental Engineering",
                            "Transportation Engineering",
                            "Geomatics Engineering",
                        ],
                    },
                    {
                        name: "Other papers (examples)",
                        topics: [
                            "CH Chemical · BT Biotechnology · IN Instrumentation · AE Aerospace",
                            "PI Production & Industrial · MT Metallurgical · PE Petroleum · TF Textile",
                            "PH Physics · CY Chemistry · MA Mathematics · ST Statistics · XE / XL multi-section",
                            "Full syllabus for every paper code is in the official GATE brochure — always verify there",
                        ],
                    },
                ],
            },
        ],
        officialWebsite: "https://gate2027.iitg.ac.in/",
        notificationUrl: "https://gate2026.iitg.ac.in/download.html",
        status: "upcoming",
        lastVerified: null,
        source: "Hardcoded seed",
        sourceUrl: "https://gate2027.iitg.ac.in/",
    },
    {
        id: "cat",
        shortName: "CAT",
        name: "Common Admission Test",
        category: "Management",
        examDate: "2026-11-29",
        applicationStart: "2026-08-01",
        applicationEnd: "2026-09-15",
        description: "A national-level management entrance examination primarily used by IIMs and other business schools.",
        eligibility: {
            education: "Bachelor's degree",
            age: "No age limit",
            attempts: "No attempt limit",
        },
        stages: ["Computer Based Test", "Shortlisting", "Further admission process"],
        syllabus: [{
            stage: "Three sections (40 min each)",
            papers: [{
                    name: "VARC — Verbal Ability & Reading Comprehension",
                    topics: [
                        "Reading Comprehension (inference, specific detail, tone, critical analysis)",
                        "Para Jumbles / Jumbled Paragraphs",
                        "Para Summary",
                        "Odd Sentence Out",
                        "Verbal reasoning & logic (no direct grammar/spelling questions)",
                    ],
                },
                {
                    name: "DILR — Data Interpretation & Logical Reasoning",
                    topics: [
                        "Tables, Bar/Line/Pie/Column graphs, Caselets, Venn diagrams",
                        "Seating arrangements (linear/circular), Blood relations, Puzzles",
                        "Binary logic, Games & tournaments, Routes & networks",
                        "Data sufficiency, Sets, Ranking & ordering",
                    ],
                },
                {
                    name: "Quantitative Aptitude",
                    topics: [
                        "Arithmetic: Percentages, Ratio & Proportion, Averages, Profit & Loss, SI/CI, Time-Speed-Distance, Time & Work, Mixtures",
                        "Algebra: Equations, Inequalities, Functions, Logarithms, Progressions",
                        "Geometry & Mensuration: Triangles, Circles, Polygons, 2D/3D figures",
                        "Number System, Modern Math (Probability, Permutation & Combination, Set Theory)",
                    ],
                },
            ],
        }, ],
        officialWebsite: "https://iimcat.ac.in/",
        notificationUrl: "https://iimcat.ac.in/",
        status: "upcoming",
        lastVerified: null,
        source: "Hardcoded seed",
        sourceUrl: "https://iimcat.ac.in/",
    },
    {
        id: "neet-ug",
        shortName: "NEET UG",
        name: "National Eligibility cum Entrance Test",
        category: "Medical",
        examDate: "2027-05-02",
        applicationStart: "2027-02-01",
        applicationEnd: "2027-03-15",
        description: "The national entrance examination for undergraduate medical education in India.",
        eligibility: {
            education: "10+2 with required subjects",
            age: "As specified by NTA",
            attempts: "As specified by NTA",
        },
        stages: ["Entrance Examination", "Result", "Counselling"],
        syllabus: [{
            stage: "Single paper (PCB)",
            papers: [{
                    name: "Physics",
                    topics: [
                        "Physics & Measurement, Kinematics, Laws of Motion",
                        "Work, Energy & Power, Rotational Motion, Gravitation",
                        "Properties of Solids & Liquids, Thermodynamics, Kinetic Theory",
                        "Oscillations & Waves",
                        "Electrostatics, Current Electricity, Magnetic Effects & Magnetism",
                        "EMI & Alternating Currents, Electromagnetic Waves, Optics",
                        "Dual Nature of Matter & Radiation, Atoms & Nuclei, Electronic Devices",
                        "Experimental Skills",
                    ],
                },
                {
                    name: "Chemistry",
                    topics: [
                        "Physical: Basic Concepts, Atomic Structure, Chemical Bonding, Thermodynamics, Solutions, Equilibrium, Redox & Electrochemistry, Chemical Kinetics",
                        "Inorganic: Classification of Elements & Periodicity, p-Block, d- & f-Block, Coordination Compounds",
                        "Organic: Purification & Characterisation, Basic Principles, Hydrocarbons, Compounds containing Halogens/Oxygen/Nitrogen, Biomolecules",
                    ],
                },
                {
                    name: "Biology (Botany + Zoology)",
                    topics: [
                        "Diversity in the Living World",
                        "Structural Organisation in Animals & Plants",
                        "Cell Structure & Function",
                        "Plant Physiology",
                        "Human Physiology",
                        "Reproduction",
                        "Genetics & Evolution",
                        "Biology & Human Welfare",
                        "Biotechnology & Its Applications",
                        "Ecology & Environment",
                    ],
                },
            ],
        }, ],
        officialWebsite: "https://neet.nta.nic.in/",
        notificationUrl: "https://neet.nta.nic.in/archive/",
        status: "upcoming",
        lastVerified: null,
        source: "Hardcoded seed",
        sourceUrl: "https://neet.nta.nic.in/",
    },
    {
        id: "ibps-po",
        shortName: "IBPS PO",
        name: "IBPS Probationary Officer",
        category: "Banking",
        examDate: "2026-10-18",
        applicationStart: "2026-07-01",
        applicationEnd: "2026-07-28",
        description: "Recruitment examination for Probationary Officers / Management Trainees in participating public sector banks.",
        eligibility: {
            education: "Graduate degree",
            age: "20–30 years (relaxations as per rules)",
            attempts: "As per IBPS notification",
        },
        stages: ["Prelims", "Mains", "Interview"],
        syllabus: [{
            stage: "Prelims",
            papers: [{
                    name: "English Language",
                    topics: [
                        "Reading comprehension",
                        "Cloze test",
                        "Error spotting",
                        "Para jumbles",
                        "Fillers",
                    ],
                },
                {
                    name: "Quantitative Aptitude",
                    topics: [
                        "Simplification",
                        "Number series",
                        "Data interpretation",
                        "Arithmetic word problems",
                    ],
                },
                {
                    name: "Reasoning Ability",
                    topics: [
                        "Puzzles & seating",
                        "Syllogism",
                        "Inequality",
                        "Coding-decoding",
                        "Blood relations",
                    ],
                },
            ],
        }, ],
        officialWebsite: "https://www.ibps.in/",
        notificationUrl: "https://www.ibps.in/",
        status: "upcoming",
        lastVerified: null,
        source: "Hardcoded seed",
        sourceUrl: "https://www.ibps.in/",
    },
];

/* =========================================================
   EXAMS — load from Firestore (with fallback)
========================================================= */
export async function fetchExams() {
    try {
        const snap = await getDocs(collection(db, "exams"));
        if (snap.empty) {
            console.warn("[HallPass] exams collection empty → using fallback");
            return FALLBACK_EXAMS;
        }
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error("[HallPass] fetchExams failed, using fallback", err);
        return FALLBACK_EXAMS;
    }
}

/** One-time seed: writes FALLBACK_EXAMS into Firestore (safe to run multiple times) */
export async function seedExamsIfEmpty() {
    const snap = await getDocs(collection(db, "exams"));
    if (!snap.empty) {
        console.log("[HallPass] exams already seeded");
        return { seeded: false, count: snap.size };
    }

    const batch = writeBatch(db);
    FALLBACK_EXAMS.forEach((exam) => {
        const ref = doc(db, "exams", exam.id);
        batch.set(ref, {
            ...exam,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });
    await batch.commit();
    console.log("[HallPass] seeded", FALLBACK_EXAMS.length, "exams");
    return { seeded: true, count: FALLBACK_EXAMS.length };
}

/* =========================================================
   STARRED EXAMS (per user)
========================================================= */
export function listenStarred(userId, callback) {
    if (!userId) {
        callback(new Set());
        return () => {};
    }
    const q = query(collection(db, "users", userId, "starred"));
    return onSnapshot(
        q,
        (snap) => {
            const set = new Set(snap.docs.map((d) => d.id));
            callback(set);
        },
        (err) => {
            console.error("starred listener error", err);
            callback(new Set());
        }
    );
}

export async function toggleStarred(userId, examId, currentlyStarred) {
    if (!userId || !examId) return;
    const ref = doc(db, "users", userId, "starred", examId);
    if (currentlyStarred) {
        await deleteDoc(ref);
    } else {
        await setDoc(ref, {
            examId,
            starredAt: serverTimestamp(),
        });
    }
}

/* =========================================================
   ATTEMPTS / PROGRESS (per user)
========================================================= */
export function listenAttempts(userId, callback, max = 50) {
    if (!userId) {
        callback([]);
        return () => {};
    }
    const q = query(
        collection(db, "users", userId, "attempts"),
        orderBy("at", "desc"),
        limit(max)
    );
    return onSnapshot(
        q,
        (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            callback(list);
        },
        (err) => {
            console.error("attempts listener error", err);
            callback([]);
        }
    );
}

export async function saveAttempt(userId, attempt) {
    if (!userId) return null;
    const ref = await addDoc(collection(db, "users", userId, "attempts"), {
        ...attempt,
        at: serverTimestamp(),
    });
    return ref.id;
}

/* =========================================================
   HELPERS
========================================================= */
export function daysLeft(dateString) {
    if (!dateString) return null;
    const today = new Date();
    const examDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    return Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateString) {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function getCountdownText(days) {
    if (days === null || days === undefined) return "Date TBA";
    if (days < 0) return "Exam completed";
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
}