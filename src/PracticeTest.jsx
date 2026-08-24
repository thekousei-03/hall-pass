/**
 * Hall Pass — Full-length Mock Test (with timer)
 * Original practice questions in exam-style patterns (not verbatim past papers).
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  ListChecks,
} from "lucide-react";

const C = {
  bg: "#f4f1ea",
  surface: "#ffffff",
  ink: "#14213d",
  inkSoft: "#667085",
  line: "#d9d5cc",
  red: "#c84c4c",
  green: "#3c7a57",
  yellow: "#d99a27",
  blue: "#4267a9",
  softRed: "#f8e4e1",
  softGreen: "#e5f1e9",
  softBlue: "#e8eef8",
  softYellow: "#f8efd9",
};

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'IBM Plex Sans', sans-serif";
const monoFont = "'IBM Plex Mono', monospace";

/* ---- Exam patterns (time + marks + negative) ---- */
const EXAM_PATTERNS = {
  "ssc-cgl": {
    label: "SSC CGL Tier-I style",
    totalTimeMin: 60,
    negativeMark: 0.5,
    sections: [
      { id: "reasoning", name: "General Intelligence & Reasoning", qCount: 25, marksEach: 2 },
      { id: "ga", name: "General Awareness", qCount: 25, marksEach: 2 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 25, marksEach: 2 },
      { id: "english", name: "English Comprehension", qCount: 25, marksEach: 2 },
    ],
  },
  cat: {
    label: "CAT style (short mock)",
    totalTimeMin: 40,
    negativeMark: 1,
    sections: [
      { id: "varc", name: "VARC", qCount: 8, marksEach: 3 },
      { id: "dilr", name: "DILR", qCount: 8, marksEach: 3 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 8, marksEach: 3 },
    ],
  },
  "jee-main": {
    label: "JEE Main style (short mock)",
    totalTimeMin: 45,
    negativeMark: 1,
    sections: [
      { id: "physics", name: "Physics", qCount: 10, marksEach: 4 },
      { id: "chemistry", name: "Chemistry", qCount: 10, marksEach: 4 },
      { id: "maths", name: "Mathematics", qCount: 10, marksEach: 4 },
    ],
  },
  "neet-ug": {
    label: "NEET UG style (short mock)",
    totalTimeMin: 45,
    negativeMark: 1,
    sections: [
      { id: "physics", name: "Physics", qCount: 10, marksEach: 4 },
      { id: "chemistry", name: "Chemistry", qCount: 10, marksEach: 4 },
      { id: "biology", name: "Biology", qCount: 15, marksEach: 4 },
    ],
  },
  "upsc-cse": {
    label: "UPSC CSE Prelims GS style",
    totalTimeMin: 30,
    negativeMark: 0.66,
    sections: [{ id: "gs", name: "General Studies", qCount: 20, marksEach: 2 }],
  },
  gate: {
    label: "GATE style (short mock)",
    totalTimeMin: 40,
    negativeMark: 0.33,
    sections: [
      { id: "ga", name: "General Aptitude", qCount: 10, marksEach: 1 },
      { id: "core", name: "Core", qCount: 15, marksEach: 2 },
    ],
  },
  "ibps-po": {
    label: "IBPS PO Prelims style",
    totalTimeMin: 60,
    negativeMark: 0.25,
    sections: [
      { id: "english", name: "English Language", qCount: 15, marksEach: 1 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 15, marksEach: 1 },
      { id: "reasoning", name: "Reasoning Ability", qCount: 15, marksEach: 1 },
    ],
  },
};

function q(id, section, year, text, options, correctIndex, explanation) {
  return { id, section, year, text, options, correctIndex, explanation };
}

/* ---- Compact practice bank (year-style tags) ---- */
const BANK = {
  "ssc-cgl": [
    q("r1", "reasoning", 2025, "If PAPER is coded as OZODQ, how is PENCIL coded?", ["ODMBHK", "ODMBHJ", "ODNAHK", "OEMBHK"], 0, "Each letter −1."),
    q("r2", "reasoning", 2024, "Series: 2, 6, 12, 20, 30, ?", ["40", "42", "44", "36"], 1, "Differences +4,+6,+8,+10,+12."),
    q("r3", "reasoning", 2023, "A is taller than B but shorter than C. D is between A and B. Shortest?", ["A", "B", "C", "D"], 1, "C > A > D > B."),
    q("r4", "reasoning", 2022, "Odd one: 3, 5, 11, 14, 17, 21", ["14", "17", "21", "11"], 0, "14 is even."),
    q("r5", "reasoning", 2021, "If 1 Jan 2023 was Sunday, 1 Jan 2024 was?", ["Sunday", "Monday", "Tuesday", "Saturday"], 1, "Non-leap year → +1 day."),
    q("r6", "reasoning", 2025, "All pens are books. Some books are desks. Conclusion: Some desks are books.", ["Only this follows", "Does not follow", "Both needed", "Either"], 0, "Some books are desks → some desks are books."),
    q("r7", "reasoning", 2024, "In a row of 40, R is 12th from left. Position from right?", ["28", "29", "30", "27"], 1, "40−12+1=29."),
    q("r8", "reasoning", 2023, "At 3:00, angle between clock hands?", ["90°", "60°", "75°", "105°"], 0, "90°."),
    q("r9", "reasoning", 2022, "AZ, BY, CX, ?", ["DW", "DU", "EV", "DX"], 0, "A↔Z pattern → DW."),
    q("r10", "reasoning", 2021, "5, 11, 24, 51, 106, ?", ["217", "215", "221", "225"], 0, "×2+1, +2, +3, +4, +5."),
    q("r11", "reasoning", 2025, "Book : Reading :: Fork : ?", ["Drawing", "Writing", "Eating", "Stirring"], 2, "Function of object."),
    q("r12", "reasoning", 2024, "How many 9s preceded by 5 and followed by 3 in: 593 259 593 1593?", ["1", "2", "3", "4"], 2, "Three matches."),
    q("r13", "reasoning", 2023, "A walks 5 km east, 3 km north, 5 km west. Distance from start?", ["3 km", "5 km", "8 km", "0"], 0, "3 km north."),
    q("r14", "reasoning", 2022, "Squares of primes: 4, 9, 25, 49, 121, ?", ["169", "144", "196", "225"], 0, "13²=169."),
    q("r15", "reasoning", 2021, "If water is called food, food called tree, tree called sky — birds live in?", ["Water", "Food", "Tree", "Sky"], 3, "Tree is called sky."),
    q("r16", "reasoning", 2025, "7, 10, 8, 11, 9, 12, ?", ["10", "13", "14", "15"], 0, "Two series: 7,8,9,10 and 10,11,12."),
    q("r17", "reasoning", 2024, "Code: 257=you are good, 263=we are bad, 259=good and bad. Code for 'and'?", ["9", "2", "5", "7"], 0, "9 is unique to third."),
    q("r18", "reasoning", 2023, "North-East becomes West when directions rotate. West becomes?", ["North-East", "South-East", "North-West", "South"], 1, "Rotate mapping."),
    q("r19", "reasoning", 2022, "Rita: 'He is the son of my mother's only daughter.' Boy is Rita's?", ["Brother", "Son", "Nephew", "Cousin"], 1, "She is the only daughter."),
    q("r20", "reasoning", 2021, "EMANATE cannot be formed from EXAMINATION because?", ["Missing M", "Needs two E's but only one E", "Missing T", "Missing N"], 1, "Only one E available."),
    q("r21", "reasoning", 2025, "LOGIC with A=1…Z=26 sums to?", ["46", "56", "57", "60"], 0, "12+15+7+9+3=46."),
    q("r22", "reasoning", 2024, "Six friends in circle; A between B,C; D opposite A. Between E and C often?", ["F", "B", "A", "D"], 0, "F in typical arrangement."),
    q("r23", "reasoning", 2023, "P÷ R× S− T+ ; 18 T 12 P 6 S 4 R 2 (BODMAS) ≈?", ["12", "22", "16", "14"], 0, "18+12÷6−4×2=12."),
    q("r24", "reasoning", 2022, "Which day after tomorrow if day before yesterday was Thursday?", ["Sunday", "Monday", "Saturday", "Tuesday"], 1, "Today Sat → Mon."),
    q("r25", "reasoning", 2021, "Complete: Pen is to Write as Knife is to?", ["Sharp", "Cut", "Steel", "Kitchen"], 1, "Use."),
    q("g1", "ga", 2025, "Father of the Indian Constitution?", ["Nehru", "Ambedkar", "Rajendra Prasad", "Patel"], 1, "B.R. Ambedkar."),
    q("g2", "ga", 2024, "RBI established in?", ["1935", "1947", "1950", "1921"], 0, "1935."),
    q("g3", "ga", 2023, "Red Planet?", ["Venus", "Mars", "Jupiter", "Mercury"], 1, "Mars."),
    q("g4", "ga", 2022, "UNESCO HQ?", ["Geneva", "New York", "Paris", "Rome"], 2, "Paris."),
    q("g5", "ga", 2021, "Right to Equality articles?", ["14–18", "19–22", "23–24", "25–28"], 0, "14–18."),
    q("g6", "ga", 2025, "Japan currency?", ["Yuan", "Yen", "Won", "Ringgit"], 1, "Yen."),
    q("g7", "ga", 2024, "Discovery of India author?", ["Gandhi", "Nehru", "Tagore", "Bose"], 1, "Nehru."),
    q("g8", "ga", 2023, "Largest desert?", ["Gobi", "Sahara", "Antarctic", "Arabian"], 2, "Antarctic."),
    q("g9", "ga", 2022, "Vitamin from sunlight?", ["A", "B", "C", "D"], 3, "D."),
    q("g10", "ga", 2021, "Tropic of Cancer does NOT pass through?", ["Rajasthan", "Gujarat", "Kerala", "MP"], 2, "Kerala."),
    q("g11", "ga", 2025, "GST started in India?", ["2015", "2016", "2017", "2018"], 2, "2017."),
    q("g12", "ga", 2024, "Sorrow of Bihar river?", ["Ganga", "Kosi", "Gandak", "Son"], 1, "Kosi."),
    q("g13", "ga", 2023, "First Indian satellite?", ["INSAT-1A", "Aryabhata", "Bhaskara", "Rohini"], 1, "Aryabhata."),
    q("g14", "ga", 2022, "First woman President of India?", ["Indira Gandhi", "Pratibha Patil", "Sarojini Naidu", "Sushma Swaraj"], 1, "Pratibha Patil."),
    q("g15", "ga", 2021, "Washing soda formula?", ["Na2CO3·10H2O", "NaHCO3", "CaOCl2", "NaOH"], 0, "Washing soda."),
    q("g16", "ga", 2025, "Longest Indian coastline state?", ["Gujarat", "AP", "TN", "Maharashtra"], 0, "Gujarat."),
    q("g17", "ga", 2024, "Battle of Plassey year?", ["1757", "1764", "1857", "1526"], 0, "1757."),
    q("g18", "ga", 2023, "Most abundant atmospheric gas?", ["Oxygen", "Nitrogen", "CO2", "Argon"], 1, "N2."),
    q("g19", "ga", 2022, "Minimum age for President of India?", ["25", "30", "35", "40"], 2, "35."),
    q("g20", "ga", 2021, "Atmospheric pressure instrument?", ["Hygrometer", "Barometer", "Anemometer", "Thermometer"], 1, "Barometer."),
    q("g21", "ga", 2025, "Capital of Australia?", ["Sydney", "Melbourne", "Canberra", "Perth"], 2, "Canberra."),
    q("g22", "ga", 2024, "Taj Mahal built by?", ["Akbar", "Jahangir", "Shah Jahan", "Aurangzeb"], 2, "Shah Jahan."),
    q("g23", "ga", 2023, "Olympics held every?", ["2", "3", "4", "5"], 2, "4 years."),
    q("g24", "ga", 2022, "Smallest Indian state by area?", ["Goa", "Sikkim", "Tripura", "Nagaland"], 0, "Goa."),
    q("g25", "ga", 2021, "Photosynthesis organelle?", ["Mitochondria", "Chloroplast", "Ribosome", "Nucleus"], 1, "Chloroplast."),
    q("q1", "quant", 2025, "25% of 480?", ["100", "120", "140", "160"], 1, "120."),
    q("q2", "quant", 2024, "SI on 5000 at 10% for 2 years?", ["500", "1000", "1500", "800"], 1, "1000."),
    q("q3", "quant", 2023, "Average of 5,10,15,20,25?", ["15", "16", "14", "17"], 0, "15."),
    q("q4", "quant", 2022, "CP 200, profit 20%, SP?", ["220", "240", "250", "260"], 1, "240."),
    q("q5", "quant", 2021, "Train 120 m at 54 km/h crosses pole in?", ["6s", "8s", "10s", "12s"], 1, "8 s."),
    q("q6", "quant", 2025, "LCM of 12 and 18?", ["36", "54", "72", "24"], 0, "36."),
    q("q7", "quant", 2024, "√144 + √81?", ["21", "23", "25", "19"], 0, "21."),
    q("q8", "quant", 2023, "3x+5=20, x=?", ["5", "4", "6", "3"], 0, "5."),
    q("q9", "quant", 2022, "Area of circle r=7 (π=22/7)?", ["154", "144", "164", "148"], 0, "154."),
    q("q10", "quant", 2021, "2:3 equals?", ["4:5", "6:9", "8:10", "5:7"], 1, "6:9."),
    q("q11", "quant", 2025, "A 10 days, B 15 days, together?", ["6", "5", "8", "7"], 0, "6 days."),
    q("q12", "quant", 2024, "CI on 1000 at 10% for 2 years?", ["200", "210", "220", "190"], 1, "210."),
    q("q13", "quant", 2023, "15% of 200 + 20% of 150?", ["60", "70", "50", "80"], 0, "60."),
    q("q14", "quant", 2022, "Median of 3,7,9,11,15?", ["9", "7", "11", "10"], 0, "9."),
    q("q15", "quant", 2021, "Square perimeter 40, area?", ["100", "64", "81", "121"], 0, "100."),
    q("q16", "quant", 2025, "Boat 12 km/h, current 3, upstream?", ["9", "15", "8", "10"], 0, "9."),
    q("q17", "quant", 2024, "HCF of 36 and 48?", ["6", "12", "18", "24"], 1, "12."),
    q("q18", "quant", 2023, "Number ÷5 leaves 3; square ÷5 remainder?", ["4", "3", "2", "1"], 0, "9≡4 mod 5."),
    q("q19", "quant", 2022, "2^x=32, x=?", ["4", "5", "6", "3"], 1, "5."),
    q("q20", "quant", 2021, "Average of first 10 natural numbers?", ["5", "5.5", "6", "4.5"], 1, "5.5."),
    q("q21", "quant", 2025, "SP 480 after 20% discount. MP?", ["500", "560", "600", "620"], 2, "600."),
    q("q22", "quant", 2024, "Sum of angles of a triangle?", ["90", "180", "270", "360"], 1, "180°."),
    q("q23", "quant", 2023, "x=3,y=4; x²+y²?", ["25", "12", "7", "24"], 0, "25."),
    q("q24", "quant", 2022, "Buy 10 pens ₹100, sell 8 for ₹100. Profit%?", ["20", "25", "15", "30"], 1, "25%."),
    q("q25", "quant", 2021, "150 km at 50 km/h takes?", ["2h", "3h", "4h", "2.5h"], 1, "3 h."),
    q("e1", "english", 2025, "Synonym of Benevolent?", ["Cruel", "Kind", "Angry", "Greedy"], 1, "Kind."),
    q("e2", "english", 2024, "Error: He don't know the answer.", ["He", "don't", "know", "No error"], 1, "doesn't."),
    q("e3", "english", 2023, "She has lived here ___ 2019.", ["for", "since", "from", "at"], 1, "since."),
    q("e4", "english", 2022, "Antonym of Ancient?", ["Old", "Modern", "Historic", "Past"], 1, "Modern."),
    q("e5", "english", 2021, "Correct spelling?", ["Recieve", "Receive", "Receeve", "Receve"], 1, "Receive."),
    q("e6", "english", 2025, "Lover of books?", ["Bibliophile", "Philosopher", "Audiophile", "Cartographer"], 0, "Bibliophile."),
    q("e7", "english", 2024, "Passive: They are building a bridge.", ["is built", "is being built", "was built", "has built"], 1, "is being built."),
    q("e8", "english", 2023, "Break the ice means?", ["Shatter glass", "Start a conversation", "Cool something", "End a fight"], 1, "Start talking."),
    q("e9", "english", 2022, "Article: ___ honest man", ["a", "an", "the", "none"], 1, "an."),
    q("e10", "english", 2021, "Plural of Analysis?", ["Analysises", "Analyses", "Analysis", "Analysii"], 1, "Analyses."),
    q("e11", "english", 2025, "Ephemeral means?", ["Permanent", "Short-lived", "Beautiful", "Dangerous"], 1, "Short-lived."),
    q("e12", "english", 2024, "Neither of the boys ___ present.", ["are", "is", "were", "have"], 1, "is."),
    q("e13", "english", 2023, "Synonym of Diligent?", ["Lazy", "Hardworking", "Careless", "Slow"], 1, "Hardworking."),
    q("e14", "english", 2022, "He said, 'I am tired.'", ["he was tired", "I am tired", "he is tired", "he says tired"], 0, "was tired."),
    q("e15", "english", 2021, "Good ___ mathematics", ["in", "at", "on", "with"], 1, "at."),
    q("e16", "english", 2025, "Antonym of Transparent?", ["Clear", "Opaque", "Bright", "Visible"], 1, "Opaque."),
    q("e17", "english", 2024, "Once in a blue moon means?", ["Often", "Rarely", "Monthly", "At night"], 1, "Rarely."),
    q("e18", "english", 2023, "Correct spelling?", ["Accomodation", "Accommodation", "Acommodation", "Accomadation"], 1, "Accommodation."),
    q("e19", "english", 2022, "Government by the people?", ["Monarchy", "Oligarchy", "Democracy", "Autocracy"], 2, "Democracy."),
    q("e20", "english", 2021, "The news ___ good.", ["are", "is", "were", "have"], 1, "is."),
    q("e21", "english", 2025, "Synonym of Obsolete?", ["Modern", "Outdated", "Useful", "Popular"], 1, "Outdated."),
    q("e22", "english", 2024, "Each of the students have submitted.", ["Each", "students", "have", "No error"], 2, "has."),
    q("e23", "english", 2023, "Passive of Open the door.", ["is opened", "Let the door be opened", "opened", "was open"], 1, "Let…be opened."),
    q("e24", "english", 2022, "Procrastinate means?", ["Hurry", "Delay", "Complete", "Argue"], 1, "Delay."),
    q("e25", "english", 2021, "Neither Ram nor Shyam ___ going.", ["are", "is", "were", "have"], 1, "is."),
  ],
  cat: [
    q("v1", "varc", 2025, "Tone that criticises but acknowledges benefits is?", ["Hostile", "Balanced", "Celebratory", "Indifferent"], 1, "Balanced."),
    q("v2", "varc", 2024, "Para-jumble opening sentence usually?", ["Has orphan pronoun", "Introduces main idea", "Starts with However", "Is conclusion"], 1, "Main idea."),
    q("v3", "varc", 2023, "Odd sentence out tests?", ["Grammar only", "Theme coherence", "Word count", "Translation"], 1, "Coherence."),
    q("v4", "varc", 2022, "Summary question asks you to?", ["Copy first line", "Capture central idea", "List examples", "Invent argument"], 1, "Central idea."),
    q("v5", "varc", 2021, "Inference questions need?", ["Only stated facts", "Supported conclusions", "Outside knowledge only", "Author bio"], 1, "Supported by text."),
    q("v6", "varc", 2025, "Ambiguous means?", ["Clear", "Multiple interpretations", "Angry", "Long"], 1, "Unclear / multi-meaning."),
    q("v7", "varc", 2024, "Critical reasoning often asks to?", ["Strengthen/weaken argument", "Solve equations", "Draw maps", "Count figures"], 0, "Argument structure."),
    q("v8", "varc", 2023, "Good long-RC strategy?", ["Options only", "Structure then details", "Memorise all", "Skip passage"], 1, "Structure first."),
    q("d1", "dilr", 2025, "A>B ranks, C worst of 4. Can D be rank 1?", ["Yes", "No", "Only if A is 4", "Impossible"], 0, "Yes."),
    q("d2", "dilr", 2024, "Bar graph growth means look at?", ["Heights only", "Change across periods", "Colours", "Title"], 1, "Change."),
    q("d3", "dilr", 2023, "Immediate neighbour means?", ["Adjacent", "Two away", "Same row only", "Facing"], 0, "Adjacent."),
    q("d4", "dilr", 2022, "Three-circle Venn shows?", ["At most one set", "Overlapping categories", "Only numbers", "Time"], 1, "Overlap."),
    q("d5", "dilr", 2021, "DS: I alone enough, II not → option?", ["A", "B", "C", "D"], 0, "A."),
    q("d6", "dilr", 2025, "90° sector of pie = ?", ["25%", "20%", "30%", "15%"], 0, "25%."),
    q("d7", "dilr", 2024, "Tournaments sets involve?", ["Points tables", "Grammar", "Chemistry", "Poetry"], 0, "Points/knockout."),
    q("d8", "dilr", 2023, "Incomplete table approach?", ["Random fill", "Use constraints", "Ignore set", "Average blindly"], 1, "Constraints."),
    q("cq1", "quant", 2025, "x+1/x=3 ⇒ x²+1/x²=?", ["7", "9", "8", "6"], 0, "7."),
    q("cq2", "quant", 2024, "Markup 40%, discount 10%. Net profit%?", ["26", "30", "24", "28"], 0, "26%."),
    q("cq3", "quant", 2023, "A twice B; together 12 days. A alone?", ["18", "16", "20", "24"], 0, "18."),
    q("cq4", "quant", 2022, "log10 2≈0.301 ⇒ log10 5≈?", ["0.699", "0.5", "0.301", "0.25"], 0, "0.699."),
    q("cq5", "quant", 2021, "Trains 100m+120m, 40 & 50 km/h opposite. Time≈?", ["9.6s", "12s", "15s", "8s"], 0, "~8.8–9.6s."),
    q("cq6", "quant", 2025, "GP: a=3,r=2, 5th term?", ["48", "24", "96", "12"], 0, "48."),
    q("cq7", "quant", 2024, "Fair coin P(Head)?", ["0", "0.5", "1", "0.25"], 1, "0.5."),
    q("cq8", "quant", 2023, "Roots of x²−5x+6=0?", ["2,3", "1,6", "−2,−3", "0,5"], 0, "2 and 3."),
  ],
  "jee-main": [
    q("p1", "physics", 2025, "SI unit of force?", ["Joule", "Newton", "Watt", "Pascal"], 1, "Newton."),
    q("p2", "physics", 2024, "g on Earth ≈?", ["9.8 m/s²", "8.9", "10.8", "6.7"], 0, "9.8."),
    q("p3", "physics", 2023, "Ohm's law relates?", ["V,I,R", "F,m,a", "P,V,T", "E,B,v"], 0, "V=IR."),
    q("p4", "physics", 2022, "Light year measures?", ["Time", "Distance", "Speed", "Energy"], 1, "Distance."),
    q("p5", "physics", 2021, "Energy dimension same as?", ["Force", "Work", "Pressure", "Momentum"], 1, "Work."),
    q("p6", "physics", 2025, "T=0.02 s, frequency?", ["50 Hz", "20", "100", "25"], 0, "50."),
    q("p7", "physics", 2024, "Which is scalar?", ["Velocity", "Force", "Work", "Acceleration"], 2, "Work."),
    q("p8", "physics", 2023, "Snell's law is about?", ["Reflection", "Refraction", "Diffraction", "Polarisation"], 1, "Refraction."),
    q("p9", "physics", 2022, "KE formula?", ["mv", "½mv²", "mv²", "½mv"], 1, "½mv²."),
    q("p10", "physics", 2021, "Constant velocity ⇒ net force?", ["Max", "Zero", "Increasing", "mg"], 1, "Zero."),
    q("c1", "chemistry", 2025, "Atomic number of C?", ["6", "12", "8", "14"], 0, "6."),
    q("c2", "chemistry", 2024, "pH of pure water 25°C?", ["0", "7", "14", "1"], 1, "7."),
    q("c3", "chemistry", 2023, "Alkali metal?", ["Ca", "Na", "Al", "Fe"], 1, "Na."),
    q("c4", "chemistry", 2022, "Avogadro number ≈?", ["6.022e23", "3.14e8", "1.6e-19", "9.8"], 0, "6.022×10²³."),
    q("c5", "chemistry", 2021, "NaCl bond type?", ["Covalent", "Ionic", "Metallic", "Hydrogen"], 1, "Ionic."),
    q("c6", "chemistry", 2025, "O oxidation in H2O?", ["−1", "−2", "+1", "0"], 1, "−2."),
    q("c7", "chemistry", 2024, "Gas from photosynthesis?", ["CO2", "O2", "N2", "H2"], 1, "O2."),
    q("c8", "chemistry", 2023, "Ideal gas law?", ["PV=nRT", "PV=RT", "P=nRT", "V=nRT"], 0, "PV=nRT."),
    q("c9", "chemistry", 2022, "Most electronegative?", ["O", "F", "Cl", "N"], 1, "F."),
    q("c10", "chemistry", 2021, "Isotopes differ in?", ["Z", "Mass number", "Electrons only", "Symbol"], 1, "Mass number."),
    q("m1", "maths", 2025, "d/dx(x²)=?", ["x", "2x", "2", "x²"], 1, "2x."),
    q("m2", "maths", 2024, "∫2x dx=?", ["x²+C", "2x²+C", "x+C", "2+C"], 0, "x²+C."),
    q("m3", "maths", 2023, "det(I₂)=?", ["0", "1", "2", "−1"], 1, "1."),
    q("m4", "maths", 2022, "sin²θ+cos²θ=?", ["0", "1", "2", "sin2θ"], 1, "1."),
    q("m5", "maths", 2021, "lim x→0 (sin x)/x=?", ["0", "1", "∞", "−1"], 1, "1."),
    q("m6", "maths", 2025, "x²−4=0 roots?", ["±2", "±4", "0,4", "2"], 0, "±2."),
    q("m7", "maths", 2024, "Distance (0,0) to (3,4)?", ["5", "7", "12", "1"], 0, "5."),
    q("m8", "maths", 2023, "⁵C₂=?", ["10", "20", "5", "15"], 0, "10."),
    q("m9", "maths", 2022, "log10(1000)=?", ["2", "3", "4", "1"], 1, "3."),
    q("m10", "maths", 2021, "Power set of {1,2} size?", ["2", "4", "3", "1"], 1, "4."),
  ],
  "neet-ug": [
    q("np1", "physics", 2025, "Unit of current?", ["Volt", "Ampere", "Ohm", "Watt"], 1, "Ampere."),
    q("np2", "physics", 2024, "Rear-view mirror type?", ["Concave", "Convex", "Plane only", "Cylindrical"], 1, "Convex."),
    q("np3", "physics", 2023, "Lens power unit?", ["Dioptre", "Watt", "Lux", "Candela"], 0, "Dioptre."),
    q("np4", "physics", 2022, "Sound cannot travel in?", ["Air", "Water", "Steel", "Vacuum"], 3, "Vacuum."),
    q("np5", "physics", 2021, "Pendulum KE max at?", ["Extreme", "Mean position", "Halfway", "Rest"], 1, "Mean."),
    q("np6", "physics", 2025, "Longest visible wavelength colour?", ["Violet", "Blue", "Green", "Red"], 3, "Red."),
    q("np7", "physics", 2024, "Earth escape velocity ≈?", ["11.2 km/s", "8", "3e8 m/s", "9.8 m/s"], 0, "11.2."),
    q("np8", "physics", 2023, "Capacitance unit?", ["Farad", "Henry", "Tesla", "Weber"], 0, "Farad."),
    q("np9", "physics", 2022, "Newton 3rd law?", ["Inertia", "F=ma", "Action-reaction", "Gravity only"], 2, "Action-reaction."),
    q("np10", "physics", 2021, "Refractive index of air ≈?", ["1", "1.5", "2.4", "0"], 0, "≈1."),
    q("nc1", "chemistry", 2025, "Atomic number of O?", ["8", "16", "6", "12"], 0, "8."),
    q("nc2", "chemistry", 2024, "Greenhouse gas?", ["O2", "N2", "CO2", "Ar"], 2, "CO2."),
    q("nc3", "chemistry", 2023, "pH < 7 means?", ["Acidic", "Basic", "Neutral", "Saline"], 0, "Acidic."),
    q("nc4", "chemistry", 2022, "Common salt?", ["NaCl", "KCl", "NaOH", "CaCl2"], 0, "NaCl."),
    q("nc5", "chemistry", 2021, "Haber process catalyst?", ["Iron", "Platinum", "Nickel", "Copper"], 0, "Iron."),
    q("nc6", "chemistry", 2025, "Electrons in Na atom?", ["11", "12", "10", "23"], 0, "11."),
    q("nc7", "chemistry", 2024, "Not carbon allotrope?", ["Diamond", "Graphite", "Ozone", "Fullerene"], 2, "Ozone."),
    q("nc8", "chemistry", 2023, "Molar mass H2O?", ["16", "18", "20", "17"], 1, "18."),
    q("nc9", "chemistry", 2022, "Strong acid?", ["CH3COOH", "HCl", "H2CO3", "H2S"], 1, "HCl."),
    q("nc10", "chemistry", 2021, "Alcohol functional group?", ["−CHO", "−OH", "−COOH", "−NH2"], 1, "−OH."),
    q("nb1", "biology", 2025, "Powerhouse of cell?", ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], 1, "Mitochondria."),
    q("nb2", "biology", 2024, "Blood red due to?", ["Haemoglobin", "Chlorophyll", "Melanin", "Keratin"], 0, "Haemoglobin."),
    q("nb3", "biology", 2023, "DNA stands for?", ["Deoxyribonucleic acid", "Ribonucleic acid", "Dual nuclear acid", "Other"], 0, "Deoxyribonucleic acid."),
    q("nb4", "biology", 2022, "Photosynthesis mainly in?", ["Roots", "Leaves", "Flowers", "Stem"], 1, "Leaves."),
    q("nb5", "biology", 2021, "Largest human gland?", ["Thyroid", "Liver", "Pancreas", "Pituitary"], 1, "Liver."),
    q("nb6", "biology", 2025, "Normal body temp ≈?", ["37°C", "98°C", "27°C", "42°C"], 0, "37°C."),
    q("nb7", "biology", 2024, "Universal donor group?", ["A", "B", "AB", "O"], 3, "O."),
    q("nb8", "biology", 2023, "Nephron is unit of?", ["Liver", "Kidney", "Lung", "Heart"], 1, "Kidney."),
    q("nb9", "biology", 2022, "Vitamin C deficiency?", ["Scurvy", "Rickets", "Beriberi", "Night blindness"], 0, "Scurvy."),
    q("nb10", "biology", 2021, "Insects phylum?", ["Annelida", "Arthropoda", "Mollusca", "Porifera"], 1, "Arthropoda."),
    q("nb11", "biology", 2025, "Prokaryote example?", ["Amoeba", "Bacteria", "Yeast", "Fungi"], 1, "Bacteria."),
    q("nb12", "biology", 2024, "Xylem transports?", ["Food", "Water & minerals", "Hormones only", "CO2"], 1, "Water & minerals."),
    q("nb13", "biology", 2023, "Insulin from?", ["Liver", "Pancreas", "Kidney", "Thyroid"], 1, "Pancreas."),
    q("nb14", "biology", 2022, "Growth cell division mainly?", ["Meiosis", "Mitosis", "Binary in humans", "Budding"], 1, "Mitosis."),
    q("nb15", "biology", 2021, "Ozone protects from?", ["IR", "UV", "Visible", "Radio"], 1, "UV."),
  ],
  "upsc-cse": [
    q("u1", "gs", 2025, "States & UTs listed in which Schedule?", ["First", "Second", "Third", "Fourth"], 0, "First."),
    q("u2", "gs", 2024, "DPSP in which Part?", ["III", "IV", "IV-A", "V"], 1, "Part IV."),
    q("u3", "gs", 2023, "CJI appointed by?", ["PM", "President", "Parliament", "SC only"], 1, "President."),
    q("u4", "gs", 2022, "Zero Hour is?", ["First hour", "After Question Hour without notice", "Budget only", "Adjournment"], 1, "After QH."),
    q("u5", "gs", 2021, "Fundamental Duties added by?", ["42nd", "44th", "52nd", "61st"], 0, "42nd."),
    q("u6", "gs", 2025, "GNP includes?", ["Only domestic", "Net factor income from abroad", "Services only", "Black money"], 1, "NFIA."),
    q("u7", "gs", 2024, "Tropic of Cancer through ~ how many states?", ["5", "8", "10", "12"], 1, "Eight."),
    q("u8", "gs", 2023, "Kesari newspaper started by?", ["Gokhale", "Tilak", "Banerjea", "Pal"], 1, "Tilak."),
    q("u9", "gs", 2022, "Montreal Protocol on?", ["Climate finance", "Ozone depleting substances", "Wetlands", "Deserts"], 1, "ODS."),
    q("u10", "gs", 2021, "RTE is?", ["DPSP only", "FR under 21A", "State law only", "Preamble only"], 1, "21A."),
    q("u11", "gs", 2025, "Finance Commission Article?", ["280", "360", "356", "370"], 0, "280."),
    q("u12", "gs", 2024, "Indus Water Treaty year?", ["1947", "1960", "1971", "1999"], 1, "1960."),
    q("u13", "gs", 2023, "Not a Fundamental Right now?", ["Equality", "Property as FR", "Freedom", "Against exploitation"], 1, "Property is legal right."),
    q("u14", "gs", 2022, "NITI Aayog replaced?", ["Planning Commission", "Finance Commission", "EC", "UPSC"], 0, "Planning Commission."),
    q("u15", "gs", 2021, "Preamble amended in?", ["1950", "1976", "1989", "Never"], 1, "1976."),
    q("u16", "gs", 2025, "El Niño is?", ["Pacific cooling", "Pacific warming phase", "Africa monsoon only", "Ozone hole"], 1, "Warm ENSO."),
    q("u17", "gs", 2024, "Viceroy during Quit India?", ["Linlithgow", "Wavell", "Mountbatten", "Irwin"], 0, "Linlithgow."),
    q("u18", "gs", 2023, "Fiscal deficit is?", ["Exp − receipts excl. borrowings", "Interest only", "Export−import", "Tax−nontax"], 0, "Standard def."),
    q("u19", "gs", 2022, "Biodiversity hotspot includes?", ["Western Ghats", "Thar only", "Sundarbans as desert", "Deccan only"], 0, "Western Ghats."),
    q("u20", "gs", 2021, "Concurrent List Schedule?", ["Sixth", "Seventh", "Eighth", "Ninth"], 1, "Seventh."),
  ],
  gate: [
    q("ga1", "ga", 2025, "Similar to Candid?", ["Secretive", "Frank", "Rude", "Silent"], 1, "Frank."),
    q("ga2", "ga", 2024, "5 workers 12 days; 6 workers take?", ["10", "8", "9", "14"], 0, "10."),
    q("ga3", "ga", 2023, "2,6,12,20,30,?", ["42", "40", "36", "44"], 0, "42."),
    q("ga4", "ga", 2022, "Avg of 5 nums=20; replace 30 by 10. New avg?", ["16", "18", "15", "17"], 0, "16."),
    q("ga5", "ga", 2021, "P(ace) from 52 cards?", ["1/13", "1/4", "4/13", "1/52"], 0, "1/13."),
    q("ga6", "ga", 2025, "Opposite of Scarce?", ["Rare", "Abundant", "Little", "Sparse"], 1, "Abundant."),
    q("ga7", "ga", 2024, "25% of 25% of 400?", ["25", "50", "100", "20"], 0, "25."),
    q("ga8", "ga", 2023, "x:y=2:3, y:z=4:5 ⇒ x:z?", ["8:15", "2:5", "4:5", "8:9"], 0, "8:15."),
    q("ga9", "ga", 2022, "150 m train crosses pole in 10 s. Speed?", ["54 km/h", "15", "36", "72"], 0, "54."),
    q("ga10", "ga", 2021, "log2 8=?", ["2", "3", "4", "8"], 1, "3."),
    q("co1", "core", 2025, "Binary search complexity?", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 1, "O(log n)."),
    q("co2", "core", 2024, "LIFO structure?", ["Queue", "Stack", "Tree", "Graph"], 1, "Stack."),
    q("co3", "core", 2023, "Deadlock Coffman conditions?", ["2", "3", "4", "5"], 2, "4."),
    q("co4", "core", 2022, "HTTP 404 means?", ["OK", "Not Found", "Server error", "Redirect"], 1, "Not Found."),
    q("co5", "core", 2021, "Primary key must be?", ["Nullable", "Unique & not null", "Numeric only", "Always composite"], 1, "Unique not null."),
    q("co6", "core", 2025, "TCP is?", ["Connectionless", "Connection-oriented", "Unreliable only", "App layer only"], 1, "Connection-oriented."),
    q("co7", "core", 2024, "Max edges simple undirected n vertices?", ["n", "n(n-1)/2", "n²", "2n"], 1, "n(n-1)/2."),
    q("co8", "core", 2023, "Replace least recently used page?", ["FIFO", "LRU", "Optimal only", "Random"], 1, "LRU."),
    q("co9", "core", 2022, "ACID 'I' means?", ["Index", "Isolation", "Integrity only", "Instance"], 1, "Isolation."),
    q("co10", "core", 2021, "Grammar-checking compiler phase?", ["Lexical", "Syntax analysis", "Code gen", "Linking"], 1, "Syntax."),
    q("co11", "core", 2025, "Nested i=1..n, j=1..i complexity?", ["O(n)", "O(n²)", "O(n log n)", "O(1)"], 1, "O(n²)."),
    q("co12", "core", 2024, "Not a programming paradigm name?", ["OOP", "Functional", "Relational algebra only", "Procedural"], 2, "Query model."),
    q("co13", "core", 2023, "192.168.0.1 is typically?", ["Public", "Private", "Multicast", "Loopback"], 1, "Private."),
    q("co14", "core", 2022, "Semaphore used for?", ["Deadlock only", "Synchronisation", "Compilation", "GUI"], 1, "Sync."),
    q("co15", "core", 2021, "Removes transitive dependency?", ["1NF", "2NF", "3NF", "BCNF only"], 2, "3NF."),
  ],
  "ibps-po": [
    q("ie1", "english", 2025, "Synonym of Rapid?", ["Slow", "Quick", "Late", "Dull"], 1, "Quick."),
    q("ie2", "english", 2024, "The team are playing well — error?", ["The team", "are", "playing", "None"], 1, "is."),
    q("ie3", "english", 2023, "Senior ___ me", ["than", "to", "from", "of"], 1, "to."),
    q("ie4", "english", 2022, "Antonym of Optimistic?", ["Hopeful", "Pessimistic", "Happy", "Confident"], 1, "Pessimistic."),
    q("ie5", "english", 2021, "Hit the nail on the head means?", ["Hurt", "Exactly right", "Build", "Miss"], 1, "Exactly right."),
    q("ie6", "english", 2025, "Hates mankind?", ["Philanthropist", "Misanthrope", "Optimist", "Altruist"], 1, "Misanthrope."),
    q("ie7", "english", 2024, "Spelling?", ["Seperate", "Separate", "Seperete", "Saparate"], 1, "Separate."),
    q("ie8", "english", 2023, "Someone stole my bag → passive?", ["was stolen", "is stolen", "stole", "was stole"], 0, "was stolen."),
    q("ie9", "english", 2022, "She has ___ finished.", ["yet", "already", "since", "for"], 1, "already."),
    q("ie10", "english", 2021, "Plural of Crisis?", ["Crisises", "Crises", "Crisis", "Crisii"], 1, "Crises."),
    q("ie11", "english", 2025, "Inevitable means?", ["Avoidable", "Certain", "Unlikely", "Optional"], 1, "Certain."),
    q("ie12", "english", 2024, "Neither of them ___ come.", ["have", "has", "are", "were"], 1, "has."),
    q("ie13", "english", 2023, "Synonym of Fragile?", ["Strong", "Delicate", "Heavy", "Rough"], 1, "Delicate."),
    q("ie14", "english", 2022, "Interested ___ music", ["on", "in", "at", "for"], 1, "in."),
    q("ie15", "english", 2021, "Article before university?", ["a", "an", "the", "none"], 0, "a (/ju/)."),
    q("iq1", "quant", 2025, "12.5% of 640?", ["80", "70", "90", "60"], 0, "80."),
    q("iq2", "quant", 2024, "SI 8000 at 5% for 3 yrs?", ["1200", "1000", "1500", "800"], 0, "1200."),
    q("iq3", "quant", 2023, "Avg of 10,20,30?", ["20", "15", "25", "30"], 0, "20."),
    q("iq4", "quant", 2022, "CP150 SP180 profit%?", ["20", "15", "25", "18"], 0, "20%."),
    q("iq5", "quant", 2021, "2/5 of 250?", ["100", "50", "150", "200"], 0, "100."),
    q("iq6", "quant", 2025, "LCM 8 and 12?", ["24", "16", "36", "48"], 0, "24."),
    q("iq7", "quant", 2024, "√196?", ["12", "14", "16", "13"], 1, "14."),
    q("iq8", "quant", 2023, "3:5 equals?", ["6:10", "9:10", "3:10", "5:3"], 0, "6:10."),
    q("iq9", "quant", 2022, "A 20 days; 5 days work?", ["1/4", "1/5", "1/2", "1/3"], 0, "1/4."),
    q("iq10", "quant", 2021, "60 km/h × 2.5 h?", ["150", "120", "100", "180"], 0, "150."),
    q("iq11", "quant", 2025, "CI 1000 @10% 2 yrs ≈?", ["210", "200", "220", "180"], 0, "210."),
    q("iq12", "quant", 2024, "Perimeter rect 10×5?", ["30", "50", "15", "25"], 0, "30."),
    q("iq13", "quant", 2023, "15% of x = 45 ⇒ x?", ["300", "250", "350", "200"], 0, "300."),
    q("iq14", "quant", 2022, "Median 2,4,6,8,10?", ["6", "4", "8", "5"], 0, "6."),
    q("iq15", "quant", 2021, "3²+4²?", ["25", "12", "7", "24"], 0, "25."),
    q("ir1", "reasoning", 2025, "A brother of B; B sister of C (male). A to C?", ["Brother", "Sister", "Father", "Uncle"], 0, "Brother."),
    q("ir2", "reasoning", 2024, "5,10,20,40,?", ["60", "80", "70", "100"], 1, "80."),
    q("ir3", "reasoning", 2023, "Odd: Cat Dog Tiger Chair", ["Cat", "Dog", "Tiger", "Chair"], 3, "Chair."),
    q("ir4", "reasoning", 2022, "NORTH→OPSUI; EAST→?", ["FBTU", "FBSU", "FBTP", "GCTU"], 0, "+1 each."),
    q("ir5", "reasoning", 2021, "All A are B; all B are C ⇒ all A are C?", ["Follows", "Does not", "Either", "Neither"], 0, "Follows."),
    q("ir6", "reasoning", 2025, "R 5th of 20 from left; from right?", ["15", "16", "14", "17"], 1, "16."),
    q("ir7", "reasoning", 2024, "North then right then right. Facing?", ["North", "South", "East", "West"], 1, "South."),
    q("ir8", "reasoning", 2023, "Pen:Write :: Knife:?", ["Sharp", "Cut", "Steel", "Kitchen"], 1, "Cut."),
    q("ir9", "reasoning", 2022, "CAT=24 (A=1); DOG=?", ["26", "28", "30", "22"], 0, "26."),
    q("ir10", "reasoning", 2021, "Day before yesterday Thursday → day after tomorrow?", ["Sun", "Mon", "Sat", "Tue"], 1, "Mon."),
    q("ir11", "reasoning", 2025, "Doctors & singers Venn?", ["Always disjoint", "May overlap", "Always nested", "Impossible"], 1, "May overlap."),
    q("ir12", "reasoning", 2024, "Input-output next step skill?", ["See pattern", "Guess", "Ignore", "Count only"], 0, "Pattern."),
    q("ir13", "reasoning", 2023, "P father of Q; Q mother of R. P is R's?", ["Father", "Grandfather", "Uncle", "Brother"], 1, "Grandfather."),
    q("ir14", "reasoning", 2022, "4 floors; A above B; C lowest. Who can be top?", ["A", "B", "C", "Only C"], 0, "A."),
    q("ir15", "reasoning", 2021, "Coding TREE letters +1 style practice?", ["USFF", "USFE", "USFD", "VRFF"], 0, "U S F F."),
  ],
};

function buildPaper(examId) {
  const pattern = EXAM_PATTERNS[examId] || EXAM_PATTERNS["ssc-cgl"];
  const bank = BANK[examId] || BANK["ssc-cgl"];
  const questions = [];
  pattern.sections.forEach((sec) => {
    const pool = bank.filter((x) => x.section === sec.id);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = [];
    for (let i = 0; i < sec.qCount; i++) {
      picked.push(shuffled[i % Math.max(shuffled.length, 1)] || pool[0]);
    }
    picked.forEach((item, i) => {
      if (!item) return;
      questions.push({
        ...item,
        uid: `${sec.id}-${i}-${item.id}`,
        sectionId: sec.id,
        sectionName: sec.name,
        marksEach: sec.marksEach,
        qNum: questions.length + 1,
      });
    });
  });
  return { pattern, questions };
}

/** Countdown timer — calls onExpire at 0 */
function useTimer(seconds, running, onExpire) {
  const [left, setLeft] = useState(seconds);
  const expRef = useRef(onExpire);
  expRef.current = onExpire;

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return undefined;
    if (left <= 0) {
      expRef.current?.();
      return undefined;
    }
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, left]);

  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");
  return { left, display: `${mm}:${ss}`, expired: left <= 0 };
}

function ResultsView({ exam, pattern, questions, answers, flagged, timeTakenSec, onRetry, onClose }) {
  const analysis = useMemo(() => {
    let correct = 0,
      wrong = 0,
      unattempted = 0,
      score = 0;
    const bySection = {};
    pattern.sections.forEach((s) => {
      bySection[s.id] = {
        name: s.name,
        correct: 0,
        wrong: 0,
        unattempted: 0,
        score: 0,
        max: s.qCount * s.marksEach,
      };
    });
    questions.forEach((qu) => {
      const ans = answers[qu.uid];
      const sec = bySection[qu.sectionId];
      if (ans === undefined || ans === null) {
        unattempted++;
        if (sec) sec.unattempted++;
      } else if (ans === qu.correctIndex) {
        correct++;
        score += qu.marksEach;
        if (sec) {
          sec.correct++;
          sec.score += qu.marksEach;
        }
      } else {
        wrong++;
        score -= pattern.negativeMark;
        if (sec) {
          sec.wrong++;
          sec.score -= pattern.negativeMark;
        }
      }
    });
    const maxScore = questions.reduce((a, qu) => a + qu.marksEach, 0);
    return {
      correct,
      wrong,
      unattempted,
      score: Math.round(score * 100) / 100,
      maxScore,
      bySection,
    };
  }, [questions, answers, pattern]);

  const pct = analysis.maxScore
    ? Math.round((Math.max(0, analysis.score) / analysis.maxScore) * 100)
    : 0;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: 20, background: C.ink, color: "#fff" }}>
        <div style={{ fontFamily: monoFont, fontSize: 11, opacity: 0.7 }}>MOCK RESULT · {pattern.label}</div>
        <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, marginTop: 6 }}>{exam.shortName}</div>
        <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: monoFont, fontSize: 28, fontWeight: 700 }}>
              {analysis.score}
              <span style={{ fontSize: 14, opacity: 0.7 }}> / {analysis.maxScore}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Score ({pct}%)</div>
          </div>
          <div>
            <div style={{ fontFamily: monoFont, fontSize: 22, fontWeight: 700, color: "#8fdfb0" }}>{analysis.correct}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Correct</div>
          </div>
          <div>
            <div style={{ fontFamily: monoFont, fontSize: 22, fontWeight: 700, color: "#f0a0a0" }}>{analysis.wrong}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Wrong</div>
          </div>
          <div>
            <div style={{ fontFamily: monoFont, fontSize: 22, fontWeight: 700 }}>{analysis.unattempted}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Skipped</div>
          </div>
          <div>
            <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 600 }}>
              {String(Math.floor(timeTakenSec / 60)).padStart(2, "0")}:{String(timeTakenSec % 60).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Time used</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, marginBottom: 10, color: C.ink }}>
          Section-wise
        </div>
        <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
          {Object.values(analysis.bySection).map((s) => (
            <div
              key={s.name}
              style={{
                background: C.bg,
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.ink }}>{s.name}</span>
              <span style={{ fontFamily: monoFont, fontSize: 12, color: C.inkSoft }}>
                <span style={{ color: C.green }}>{s.correct}✓</span> ·{" "}
                <span style={{ color: C.red }}>{s.wrong}✗</span> · {s.unattempted}— ·{" "}
                <strong style={{ color: C.ink }}>
                  {Math.round(s.score * 100) / 100}/{s.max}
                </strong>
              </span>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, marginBottom: 10, color: C.ink }}>
          Answer review
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {questions.map((qu) => {
            const ans = answers[qu.uid];
            const attempted = ans !== undefined && ans !== null;
            const isRight = attempted && ans === qu.correctIndex;
            const isWrong = attempted && ans !== qu.correctIndex;
            return (
              <div
                key={qu.uid}
                style={{
                  border: `1px solid ${isRight ? C.green + "55" : isWrong ? C.red + "55" : C.line}`,
                  background: isRight ? C.softGreen : isWrong ? C.softRed : C.surface,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft }}>
                    Q{qu.qNum} · {qu.sectionName}
                    {qu.year ? ` · ${qu.year}-style` : ""}
                    {flagged[qu.uid] ? " · flagged" : ""}
                  </span>
                  {isRight && <CheckCircle2 size={18} color={C.green} />}
                  {isWrong && <XCircle size={18} color={C.red} />}
                  {!attempted && (
                    <span style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft }}>Skipped</span>
                  )}
                </div>
                <div style={{ fontFamily: bodyFont, fontSize: 13.5, color: C.ink, marginBottom: 8 }}>{qu.text}</div>
                <div style={{ display: "grid", gap: 4 }}>
                  {qu.options.map((opt, i) => {
                    const isCorrectOpt = i === qu.correctIndex;
                    const isUserOpt = i === ans;
                    return (
                      <div
                        key={i}
                        style={{
                          fontFamily: bodyFont,
                          fontSize: 12.5,
                          padding: "6px 10px",
                          borderRadius: 8,
                          background: isCorrectOpt ? C.softGreen : isUserOpt && isWrong ? C.softRed : "#fff",
                          border: `1px solid ${isCorrectOpt ? C.green : isUserOpt && isWrong ? C.red : C.line}`,
                        }}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                        {isCorrectOpt ? " ✓" : ""}
                        {isUserOpt && isWrong ? " (your answer)" : ""}
                      </div>
                    );
                  })}
                </div>
                {qu.explanation && (
                  <div style={{ marginTop: 8, fontSize: 12, color: C.inkSoft, fontStyle: "italic" }}>
                    {qu.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button
            onClick={onRetry}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: C.ink,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              fontFamily: bodyFont,
              fontWeight: 600,
            }}
          >
            <RotateCcw size={15} /> Retake
          </button>
          <button
            onClick={onClose}
            style={{
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              fontFamily: bodyFont,
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>
        <p style={{ marginTop: 14, fontSize: 11.5, color: C.inkSoft }}>
          Practice items follow typical last-5-year patterns. Not verbatim copyrighted past papers.
        </p>
      </div>
    </div>
  );
}

function LiveTest({ exam, paper, onSubmit, onAbort }) {
  const { pattern, questions } = paper;
  const totalSec = pattern.totalTimeMin * 60;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [running, setRunning] = useState(true);
  const startRef = useRef(Date.now());

  const submit = useCallback(() => {
    setRunning(false);
    const timeTakenSec = Math.min(totalSec, Math.round((Date.now() - startRef.current) / 1000));
    onSubmit({ answers, flagged, timeTakenSec });
  }, [answers, flagged, onSubmit, totalSec]);

  const { display, left } = useTimer(totalSec, running, submit);

  const qu = questions[idx];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] != null).length;
  if (!qu) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      {/* TIMER BAR */}
      <div
        style={{
          padding: "12px 16px",
          background: C.ink,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontFamily: monoFont, fontSize: 11, opacity: 0.7 }}>{pattern.label}</div>
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 16 }}>{exam.shortName} Mock</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: monoFont,
                fontSize: 22,
                fontWeight: 700,
                color: left < 60 ? "#f0a0a0" : left < 300 ? "#f5d76e" : "#fff",
              }}
            >
              <Clock size={16} style={{ display: "inline", marginRight: 6, verticalAlign: -3 }} />
              {display}
            </div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>
              {answeredCount}/{questions.length} answered
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Submit the mock test now?")) submit();
            }}
            style={{
              background: C.green,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontFamily: bodyFont,
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Submit
          </button>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: monoFont, fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
          Q{qu.qNum}/{questions.length} · {qu.sectionName} · +{qu.marksEach}
          {pattern.negativeMark ? ` / −${pattern.negativeMark}` : ""}
          {qu.year ? ` · ${qu.year}-style` : ""}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 15, color: C.ink, lineHeight: 1.5, marginBottom: 14 }}>
          {qu.text}
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          {qu.options.map((opt, i) => {
            const selected = answers[qu.uid] === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers((p) => ({ ...p, [qu.uid]: i }))}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `2px solid ${selected ? C.blue : C.line}`,
                  background: selected ? C.softBlue : "#fff",
                  cursor: "pointer",
                  fontFamily: bodyFont,
                  fontSize: 13.5,
                  color: C.ink,
                }}
              >
                <span style={{ fontFamily: monoFont, fontWeight: 700, marginRight: 8 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: C.bg,
              opacity: idx === 0 ? 0.5 : 1,
              cursor: idx === 0 ? "default" : "pointer",
              fontFamily: bodyFont,
              fontSize: 13,
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            onClick={() =>
              setFlagged((f) => {
                const n = { ...f };
                if (n[qu.uid]) delete n[qu.uid];
                else n[qu.uid] = true;
                return n;
              })
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${flagged[qu.uid] ? C.yellow : C.line}`,
              background: flagged[qu.uid] ? C.softYellow : C.bg,
              cursor: "pointer",
              fontFamily: bodyFont,
              fontSize: 13,
            }}
          >
            <Flag size={14} /> {flagged[qu.uid] ? "Flagged" : "Flag"}
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
            disabled={idx === questions.length - 1}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: C.bg,
              opacity: idx === questions.length - 1 ? 0.5 : 1,
              cursor: idx === questions.length - 1 ? "default" : "pointer",
              fontFamily: bodyFont,
              fontSize: 13,
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft, marginBottom: 6 }}>QUESTION PALETTE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {questions.map((item, i) => {
            const answered = answers[item.uid] != null;
            const isFlag = flagged[item.uid];
            const isCurrent = i === idx;
            return (
              <button
                key={item.uid}
                onClick={() => setIdx(i)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: isCurrent ? `2px solid ${C.ink}` : `1px solid ${C.line}`,
                  background: isFlag ? C.softYellow : answered ? C.softGreen : C.bg,
                  fontFamily: monoFont,
                  fontSize: 11,
                  cursor: "pointer",
                  color: C.ink,
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={onAbort}
          style={{
            marginTop: 16,
            background: "transparent",
            border: "none",
            color: C.red,
            cursor: "pointer",
            fontFamily: bodyFont,
            fontSize: 12,
          }}
        >
          Abort test
        </button>
      </div>
    </div>
  );
}

function MockLobby({ exam, onStart }) {
  const pattern = EXAM_PATTERNS[exam.id] || EXAM_PATTERNS["ssc-cgl"];
  const totalQ = pattern.sections.reduce((a, s) => a + s.qCount, 0);
  const maxMarks = pattern.sections.reduce((a, s) => a + s.qCount * s.marksEach, 0);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <ListChecks size={20} color={C.ink} />
        <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 18, color: C.ink }}>Full-length practice mock</h2>
      </div>
      <p style={{ margin: "0 0 14px", fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
        Timed mock with live countdown. Auto-submits when time ends. Pattern matches typical {exam.shortName} papers.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 14 }}>
        <div style={{ background: C.softBlue, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>QUESTIONS</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>{totalQ}</div>
        </div>
        <div style={{ background: C.softGreen, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>TIMER</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>{pattern.totalTimeMin} min</div>
        </div>
        <div style={{ background: C.softYellow, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>MAX MARKS</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>{maxMarks}</div>
        </div>
        <div style={{ background: C.softRed, borderRadius: 10, padding: 10 }}>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: C.inkSoft }}>NEGATIVE</div>
          <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700 }}>−{pattern.negativeMark}</div>
        </div>
      </div>

      {pattern.sections.map((s) => (
        <div
          key={s.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: C.inkSoft,
            padding: "4px 0",
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <span style={{ color: C.ink }}>{s.name}</span>
          <span style={{ fontFamily: monoFont }}>
            {s.qCount} Q · +{s.marksEach}
          </span>
        </div>
      ))}

      <button
        onClick={onStart}
        style={{
          width: "100%",
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: C.ink,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 16px",
          cursor: "pointer",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <Play size={18} /> Start full mock (timer on)
      </button>
    </div>
  );
}

export default function PracticeTestSection({ exam }) {
  const [phase, setPhase] = useState("lobby");
  const [paper, setPaper] = useState(null);
  const [result, setResult] = useState(null);

  const start = () => {
    setPaper(buildPaper(exam.id));
    setResult(null);
    setPhase("live");
  };

  if (!EXAM_PATTERNS[exam.id]) {
    return (
      <div style={{ padding: 16, background: C.bg, borderRadius: 12, fontSize: 13, color: C.inkSoft }}>
        <BookOpen size={18} style={{ marginBottom: 6 }} />
        Mock pattern coming soon for this exam.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      {phase === "lobby" && <MockLobby exam={exam} onStart={start} />}
      {phase === "live" && paper && (
        <LiveTest
          exam={exam}
          paper={paper}
          onSubmit={({ answers, flagged, timeTakenSec }) => {
            setResult({ answers, flagged, timeTakenSec });
            setPhase("results");
          }}
          onAbort={() => {
            if (window.confirm("Leave test? Progress will be lost.")) setPhase("lobby");
          }}
        />
      )}
      {phase === "results" && paper && result && (
        <ResultsView
          exam={exam}
          pattern={paper.pattern}
          questions={paper.questions}
          answers={result.answers}
          flagged={result.flagged}
          timeTakenSec={result.timeTakenSec}
          onRetry={start}
          onClose={() => setPhase("lobby")}
        />
      )}
    </div>
  );
}