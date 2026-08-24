/**
 * Hall Pass — Full-length Mock Test (with timer)
 * Original practice questions in exam-style patterns (not verbatim past papers).
 * Expanded banks + visual result graphs.
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

/* ---- Real full-length patterns (approx official structure) ---- */
const EXAM_PATTERNS = {
  "ssc-cgl": {
    label: "SSC CGL Tier-I (full length)",
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
    label: "CAT (full-length practice)",
    totalTimeMin: 120,
    negativeMark: 1,
    sections: [
      { id: "varc", name: "VARC", qCount: 22, marksEach: 3 },
      { id: "dilr", name: "DILR", qCount: 20, marksEach: 3 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 22, marksEach: 3 },
    ],
  },
  "jee-main": {
    label: "JEE Main (full length)",
    totalTimeMin: 180,
    negativeMark: 1,
    sections: [
      { id: "physics", name: "Physics", qCount: 30, marksEach: 4 },
      { id: "chemistry", name: "Chemistry", qCount: 30, marksEach: 4 },
      { id: "maths", name: "Mathematics", qCount: 30, marksEach: 4 },
    ],
  },
  "neet-ug": {
    label: "NEET UG (full length)",
    totalTimeMin: 200,
    negativeMark: 1,
    sections: [
      { id: "physics", name: "Physics", qCount: 45, marksEach: 4 },
      { id: "chemistry", name: "Chemistry", qCount: 45, marksEach: 4 },
      { id: "biology", name: "Biology", qCount: 90, marksEach: 4 },
    ],
  },
  "upsc-cse": {
    label: "UPSC CSE Prelims GS (full length)",
    totalTimeMin: 120,
    negativeMark: 0.66,
    sections: [{ id: "gs", name: "General Studies", qCount: 100, marksEach: 2 }],
  },
  gate: {
    label: "GATE (full length)",
    totalTimeMin: 180,
    negativeMark: 0.33,
    sections: [
      { id: "ga", name: "General Aptitude", qCount: 10, marksEach: 1 },
      { id: "core", name: "Core", qCount: 55, marksEach: 2 },
    ],
  },
  "ibps-po": {
    label: "IBPS PO Prelims (full length)",
    totalTimeMin: 60,
    negativeMark: 0.25,
    sections: [
      { id: "english", name: "English Language", qCount: 30, marksEach: 1 },
      { id: "quant", name: "Quantitative Aptitude", qCount: 35, marksEach: 1 },
      { id: "reasoning", name: "Reasoning Ability", qCount: 35, marksEach: 1 },
    ],
  },
};

const YEAR_OPTIONS = [2025, 2024, 2023, 2022, 2021, "all"];

function q(id, section, year, text, options, correctIndex, explanation) {
  return { id, section, year, text, options, correctIndex, explanation };
}

/* ---- Expanded original practice bank (year-style tags, not verbatim past papers) ---- */
const BANK = {
  "ssc-cgl": [
    // Reasoning (~55)
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
    q("r26", "reasoning", 2025, "If in a certain code 'MANGO' is written as 'NZOHP', how is 'APPLE' written?", ["BQQMF", "ZOOKE", "BQQME", "ZPPKD"], 0, "Each letter +1."),
    q("r27", "reasoning", 2024, "Find the missing number: 3, 5, 9, 17, 33, ?", ["65", "49", "57", "61"], 0, "×2−1 pattern."),
    q("r28", "reasoning", 2023, "Pointing to a photo, Ravi said 'He is the son of my grandfather's only son.' Who is in the photo?", ["Ravi's brother", "Ravi's father", "Ravi himself or brother", "Uncle"], 2, "Grandfather's only son is father."),
    q("r29", "reasoning", 2022, "Which does not belong: Square, Circle, Triangle, Rectangle", ["Circle", "Square", "Triangle", "Rectangle"], 0, "Only curved shape."),
    q("r30", "reasoning", 2021, "If '+' means ×, '×' means −, '−' means ÷, '÷' means +, then 18÷6−3×2+4 =?", ["15", "12", "18", "10"], 0, "18+6÷3−2×4 → careful BODMAS with new ops."),
    q("r31", "reasoning", 2025, "A is 2 years older than B. B is twice as old as C. If C is 10, A is?", ["22", "20", "24", "18"], 0, "C=10, B=20, A=22."),
    q("r32", "reasoning", 2024, "In a certain language, if 'FRIEND' is coded as 'GSJFOE', how is 'ENEMY' coded?", ["FOFNZ", "FOFNX", "FNFNZ", "GOFNZ"], 0, "Each letter +1."),
    q("r33", "reasoning", 2023, "Series: 8, 27, 64, 125, ?", ["216", "196", "243", "256"], 0, "Cubes 2³ to 6³."),
    q("r34", "reasoning", 2022, "If South-East becomes North, North-East becomes West, what does South become?", ["North-East", "North-West", "South-East", "East"], 0, "90° rotation mapping."),
    q("r35", "reasoning", 2021, "How many meaningful English words can be formed with letters of 'NOTE' using each once?", ["1", "2", "3", "4"], 2, "NOTE, TONE, etc."),
    q("r36", "reasoning", 2025, "Statement: All mangoes are fruits. Some fruits are sweet. Conclusion: Some mangoes are sweet.", ["Follows", "Does not follow", "Either", "Both needed"], 1, "No definite link."),
    q("r37", "reasoning", 2024, "A man walks 10 m north, turns right, walks 5 m, turns right, walks 10 m. How far from start?", ["5 m", "10 m", "15 m", "0"], 0, "5 m east of start."),
    q("r38", "reasoning", 2023, "Odd one out: 121, 144, 169, 196, 225, 256", ["144", "196", "225", "None"], 3, "All perfect squares."),
    q("r39", "reasoning", 2022, "If 15th August 2024 was Thursday, what day was 15th August 2025?", ["Friday", "Saturday", "Thursday", "Sunday"], 0, "+1 day (non-leap)."),
    q("r40", "reasoning", 2021, "Arrange in dictionary order: Apple, Apricot, Apply, Apex", ["Apex, Apple, Apply, Apricot", "Apple, Apex, Apply, Apricot", "Apex, Apply, Apple, Apricot", "Apricot, Apex, Apple, Apply"], 0, "Apex first."),
    q("r41", "reasoning", 2025, "If 'P + Q' means P is brother of Q; 'P − Q' means P is sister of Q. A + B − C means?", ["A is brother of C", "A is uncle of C", "C is sister of A", "Cannot say"], 0, "A brother of B, B sister of C → A brother of C."),
    q("r42", "reasoning", 2024, "Find next: Z, X, V, T, ?", ["R", "S", "Q", "P"], 0, "−2 each."),
    q("r43", "reasoning", 2023, "In a class of 50, rank of X from top is 12. Rank from bottom?", ["38", "39", "40", "37"], 1, "50−12+1=39."),
    q("r44", "reasoning", 2022, "Which is different: Cow, Goat, Horse, Tiger", ["Tiger", "Cow", "Goat", "Horse"], 0, "Carnivore / wild."),
    q("r45", "reasoning", 2021, "If 2*3=13, 3*4=25, 4*5=41, then 5*6=?", ["61", "49", "55", "37"], 0, "a*b = a²+b²−a−b+1 or similar pattern → 61."),
    q("r46", "reasoning", 2025, "Complete the analogy: Doctor : Hospital :: Teacher : ?", ["School", "Student", "Book", "Class"], 0, "Workplace."),
    q("r47", "reasoning", 2024, "How many triangles in a figure of star of David (two overlapping triangles)?", ["6", "8", "5", "4"], 1, "Typically 8 small+large."),
    q("r48", "reasoning", 2023, "If today is Monday, what day will it be after 61 days?", ["Thursday", "Wednesday", "Friday", "Saturday"], 0, "61 mod 7 = 5 → Monday+5=Thursday."),
    q("r49", "reasoning", 2022, "Statement: Only a few books are novels. All novels are stories. Conclusion: Some stories are books.", ["Follows", "Does not", "Either", "Neither"], 0, "Follows."),
    q("r50", "reasoning", 2021, "Mirror image of 'TIME' if mirror is vertical?", ["EMIT", "EMTI", "TIEM", "METI"], 0, "Reversed left-right."),
    q("r51", "reasoning", 2025, "Series: 1, 4, 9, 16, 25, 36, ?", ["49", "48", "64", "45"], 0, "Squares."),
    q("r52", "reasoning", 2024, "A is mother of B. B is sister of C. C is father of D. How is A related to D?", ["Grandmother", "Mother", "Aunt", "Sister"], 0, "A is grandmother."),
    q("r53", "reasoning", 2023, "If 'RED' is coded as 27, 'BLUE' as 40, then 'GREEN' is?", ["49", "50", "55", "48"], 0, "Sum of positions × something; R+E+D=27 etc."),
    q("r54", "reasoning", 2022, "Which number replaces the question mark: 4 9 2 / 3 5 7 / 8 1 ?", ["6", "0", "5", "9"], 0, "Magic square style sum 15."),
    q("r55", "reasoning", 2021, "If all odd-numbered letters are replaced by next letter and even by previous, what is 'LOGIC'?", ["MPHJB", "KNHJD", "MPHHD", "KPHJB"], 0, "L→M, O→N, G→H, I→H, C→B → careful mapping."),

    // GA (~50)
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
    q("g26", "ga", 2025, "Who is known as the Iron Man of India?", ["Nehru", "Sardar Patel", "Bose", "Ambedkar"], 1, "Sardar Vallabhbhai Patel."),
    q("g27", "ga", 2024, "The currency of the United Kingdom is?", ["Euro", "Pound Sterling", "Dollar", "Franc"], 1, "Pound Sterling."),
    q("g28", "ga", 2023, "Which planet is known as the Morning Star?", ["Mars", "Venus", "Mercury", "Jupiter"], 1, "Venus."),
    q("g29", "ga", 2022, "The Headquarters of the World Bank is in?", ["New York", "Washington D.C.", "Geneva", "Paris"], 1, "Washington D.C."),
    q("g30", "ga", 2021, "Article 370 of the Indian Constitution was related to?", ["Jammu & Kashmir", "Emergency", "Fundamental Rights", "Finance Commission"], 0, "J&K special status."),
    q("g31", "ga", 2025, "The largest river island in the world is?", ["Majuli", "Srirangam", "Divar", "Umananda"], 0, "Majuli (Assam)."),
    q("g32", "ga", 2024, "Who invented the telephone?", ["Edison", "Bell", "Marconi", "Faraday"], 1, "Alexander Graham Bell."),
    q("g33", "ga", 2023, "The chemical formula of ozone is?", ["O2", "O3", "CO2", "NO2"], 1, "O3."),
    q("g34", "ga", 2022, "The first battle of Panipat was fought in?", ["1526", "1556", "1761", "1757"], 0, "1526."),
    q("g35", "ga", 2021, "Which gas is used in fire extinguishers?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], 1, "CO2."),
    q("g36", "ga", 2025, "The national animal of India is?", ["Lion", "Tiger", "Elephant", "Peacock"], 1, "Tiger."),
    q("g37", "ga", 2024, "Who wrote the national anthem of India?", ["Bankim Chandra", "Rabindranath Tagore", "Iqbal", "Sarojini Naidu"], 1, "Tagore."),
    q("g38", "ga", 2023, "The study of earthquakes is called?", ["Seismology", "Geology", "Meteorology", "Ecology"], 0, "Seismology."),
    q("g39", "ga", 2022, "Which is the longest river in India?", ["Yamuna", "Ganga", "Godavari", "Brahmaputra"], 1, "Ganga."),
    q("g40", "ga", 2021, "The capital of Canada is?", ["Toronto", "Ottawa", "Vancouver", "Montreal"], 1, "Ottawa."),
    q("g41", "ga", 2025, "Who is known as the Missile Man of India?", ["Vikram Sarabhai", "A.P.J. Abdul Kalam", "Homi Bhabha", "C.V. Raman"], 1, "A.P.J. Abdul Kalam."),
    q("g42", "ga", 2024, "The number of players in a cricket team is?", ["9", "10", "11", "12"], 2, "11."),
    q("g43", "ga", 2023, "Which vitamin is also known as ascorbic acid?", ["A", "B", "C", "D"], 2, "Vitamin C."),
    q("g44", "ga", 2022, "The first Indian to win a Nobel Prize was?", ["C.V. Raman", "Rabindranath Tagore", "Amartya Sen", "Mother Teresa"], 1, "Tagore (Literature)."),
    q("g45", "ga", 2021, "Which is the smallest bone in the human body?", ["Stapes", "Femur", "Tibia", "Radius"], 0, "Stapes (ear)."),
    q("g46", "ga", 2025, "The currency of Bangladesh is?", ["Rupee", "Taka", "Kyat", "Rupiah"], 1, "Taka."),
    q("g47", "ga", 2024, "Who discovered penicillin?", ["Fleming", "Pasteur", "Koch", "Jenner"], 0, "Alexander Fleming."),
    q("g48", "ga", 2023, "The Tropic of Capricorn passes through which country?", ["India", "Australia", "Canada", "Russia"], 1, "Australia."),
    q("g49", "ga", 2022, "Which organ purifies blood in the human body?", ["Heart", "Kidney", "Liver", "Lungs"], 1, "Kidney."),
    q("g50", "ga", 2021, "The full form of ISRO is?", ["Indian Space Research Organisation", "International Space Research Org", "Indian Scientific Research Org", "Indian Satellite Research Org"], 0, "ISRO."),

    // Quant (~50)
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
    q("q26", "quant", 2025, "If 40% of a number is 240, the number is?", ["600", "500", "480", "720"], 0, "600."),
    q("q27", "quant", 2024, "A sum becomes double in 8 years at SI. Rate of interest?", ["12.5%", "10%", "15%", "8%"], 0, "100/8 = 12.5%."),
    q("q28", "quant", 2023, "The average of 6 numbers is 30. If one number is excluded average becomes 28. Excluded number?", ["40", "35", "42", "38"], 0, "6×30−5×28=40."),
    q("q29", "quant", 2022, "A shopkeeper marks goods 40% above cost and allows 10% discount. Profit %?", ["26%", "30%", "24%", "28%"], 0, "1.4×0.9=1.26 → 26%."),
    q("q30", "quant", 2021, "Two trains 120 m and 180 m long running at 40 and 50 km/h opposite. Time to cross?", ["12 s", "15 s", "10 s", "18 s"], 0, "Relative 90 km/h=25 m/s; 300/25=12."),
    q("q31", "quant", 2025, "LCM of 15, 20, 25?", ["300", "150", "600", "100"], 0, "300."),
    q("q32", "quant", 2024, "√(0.0256)=?", ["0.16", "0.016", "1.6", "0.0016"], 0, "0.16."),
    q("q33", "quant", 2023, "If x/5 = 15, then x=?", ["75", "3", "20", "80"], 0, "75."),
    q("q34", "quant", 2022, "Area of a rectangle 12 m × 8 m?", ["96 m²", "40 m²", "20 m²", "100 m²"], 0, "96."),
    q("q35", "quant", 2021, "Ratio 3:5, sum of parts 80. Larger part?", ["50", "30", "40", "48"], 0, "50."),
    q("q36", "quant", 2025, "A can do a work in 12 days, B in 18 days. Together in?", ["7.2 days", "6 days", "8 days", "9 days"], 0, "1/(1/12+1/18)=7.2."),
    q("q37", "quant", 2024, "CI on ₹2000 at 10% for 2 years?", ["420", "400", "440", "410"], 0, "420."),
    q("q38", "quant", 2023, "30% of 250 + 20% of 150 =?", ["105", "100", "110", "95"], 0, "75+30=105."),
    q("q39", "quant", 2022, "Mode of 2,3,3,4,5,3,6?", ["3", "4", "2", "5"], 0, "3 appears most."),
    q("q40", "quant", 2021, "Perimeter of square side 9 cm?", ["36 cm", "81 cm", "18 cm", "27 cm"], 0, "36."),
    q("q41", "quant", 2025, "A boat speed 15 km/h in still water, current 3 km/h. Downstream speed?", ["18", "12", "15", "21"], 0, "18."),
    q("q42", "quant", 2024, "HCF of 24, 36, 60?", ["12", "6", "24", "4"], 0, "12."),
    q("q43", "quant", 2023, "A number when divided by 7 leaves remainder 3. What is remainder when square is divided by 7?", ["2", "3", "4", "1"], 0, "3²=9 ≡2 mod 7."),
    q("q44", "quant", 2022, "3^x = 81, x=?", ["4", "3", "5", "2"], 0, "4."),
    q("q45", "quant", 2021, "Average of first 5 odd numbers?", ["5", "3", "7", "9"], 0, "1+3+5+7+9=25/5=5."),
    q("q46", "quant", 2025, "MP ₹800, discount 25%. SP?", ["600", "650", "700", "750"], 0, "600."),
    q("q47", "quant", 2024, "Interior angles of a regular hexagon sum?", ["720°", "540°", "360°", "900°"], 0, "(6−2)×180=720."),
    q("q48", "quant", 2023, "If a=5, b=12, a²+b²=?", ["169", "144", "25", "60"], 0, "25+144=169."),
    q("q49", "quant", 2022, "A man buys 20 articles for ₹100 and sells 15 for ₹100. Profit%?", ["33.33%", "25%", "20%", "50%"], 0, "CP 5, SP ≈6.67 → 33.33%."),
    q("q50", "quant", 2021, "Distance covered at 60 km/h in 2.5 hours?", ["150 km", "120 km", "100 km", "180 km"], 0, "150."),

    // English (~50)
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
    q("e26", "english", 2025, "Synonym of Abundant?", ["Scarce", "Plentiful", "Rare", "Little"], 1, "Plentiful."),
    q("e27", "english", 2024, "Find the error: She is more taller than her sister.", ["She is", "more taller", "than", "No error"], 1, "taller (no more)."),
    q("e28", "english", 2023, "He has been working here ___ five years.", ["since", "for", "from", "at"], 1, "for."),
    q("e29", "english", 2022, "Antonym of Courage?", ["Bravery", "Cowardice", "Strength", "Fearless"], 1, "Cowardice."),
    q("e30", "english", 2021, "Correct spelling?", ["Seperate", "Separate", "Seperete", "Saparate"], 1, "Separate."),
    q("e31", "english", 2025, "A person who loves mankind is?", ["Misanthrope", "Philanthropist", "Optimist", "Egoist"], 1, "Philanthropist."),
    q("e32", "english", 2024, "Passive: Someone has stolen my watch.", ["has been stolen", "was stolen", "is stolen", "had stolen"], 0, "My watch has been stolen."),
    q("e33", "english", 2023, "Idiom: Hit the nail on the head means?", ["Hurt someone", "Say exactly the right thing", "Build something", "Miss the point"], 1, "Exactly right."),
    q("e34", "english", 2022, "Article: ___ university", ["a", "an", "the", "none"], 0, "a (/ju/)."),
    q("e35", "english", 2021, "Plural of Criterion?", ["Criterions", "Criteria", "Criterion", "Criterias"], 1, "Criteria."),
    q("e36", "english", 2025, "Ubiquitous means?", ["Rare", "Present everywhere", "Unique", "Ancient"], 1, "Everywhere."),
    q("e37", "english", 2024, "One of the boys ___ absent today.", ["are", "is", "were", "have"], 1, "is."),
    q("e38", "english", 2023, "Synonym of Meticulous?", ["Careless", "Careful", "Hasty", "Lazy"], 1, "Careful / precise."),
    q("e39", "english", 2022, "She said, 'I will come tomorrow.'", ["she would come the next day", "I will come", "she will come", "she comes"], 0, "would come the next day."),
    q("e40", "english", 2021, "Interested ___ learning new languages.", ["on", "in", "at", "for"], 1, "in."),
    q("e41", "english", 2025, "Antonym of Optimistic?", ["Hopeful", "Pessimistic", "Confident", "Cheerful"], 1, "Pessimistic."),
    q("e42", "english", 2024, "Idiom: Piece of cake means?", ["Difficult", "Very easy", "Delicious", "Expensive"], 1, "Very easy."),
    q("e43", "english", 2023, "Correct spelling?", ["Occassion", "Occasion", "Ocasion", "Occation"], 1, "Occasion."),
    q("e44", "english", 2022, "Rule by a king or queen?", ["Democracy", "Monarchy", "Oligarchy", "Republic"], 1, "Monarchy."),
    q("e45", "english", 2021, "Mathematics ___ my favourite subject.", ["are", "is", "were", "have"], 1, "is."),
    q("e46", "english", 2025, "Synonym of Concise?", ["Lengthy", "Brief", "Detailed", "Vague"], 1, "Brief."),
    q("e47", "english", 2024, "Error: The committee have decided to postpone the meeting.", ["The committee", "have", "decided", "No error"], 1, "has (collective)."),
    q("e48", "english", 2023, "Passive of 'Please close the door.'", ["Let the door be closed", "The door is closed", "Close the door", "Door closed"], 0, "Let the door be closed."),
    q("e49", "english", 2022, "Ambiguous means?", ["Clear", "Having more than one meaning", "Certain", "Simple"], 1, "Multiple meanings."),
    q("e50", "english", 2021, "Neither the teacher nor the students ___ present.", ["was", "were", "is", "has"], 1, "were (nearest subject)."),
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
    q("v9", "varc", 2025, "A paragraph that presents both sides without taking a stand is?", ["Biased", "Neutral / balanced", "Sarcastic", "Didactic"], 1, "Neutral."),
    q("v10", "varc", 2024, "In RC, 'the author implies' means?", ["States directly", "Suggests without stating", "Quotes someone", "Contradicts"], 1, "Suggests."),
    q("v11", "varc", 2023, "Best way to handle para-summary?", ["Pick longest option", "Eliminate extremes & out-of-scope", "Choose first sentence", "Count words"], 1, "Eliminate."),
    q("v12", "varc", 2022, "Tone words like 'perhaps', 'may' indicate?", ["Certainty", "Tentativeness", "Anger", "Joy"], 1, "Tentative."),
    q("v13", "varc", 2021, "Main idea of a passage is usually found?", ["Only in last line", "In topic sentence or overall thrust", "In examples", "In data only"], 1, "Overall thrust."),
    q("v14", "varc", 2025, "Which is least likely in CAT VARC?", ["Pure grammar error spotting", "Inference", "Summary", "Odd sentence"], 0, "CAT avoids pure grammar."),
    q("v15", "varc", 2024, "If two options both seem correct in RC, prefer?", ["More extreme", "More precise & text-supported", "Longer one", "Outside knowledge"], 1, "Text-supported."),
    q("d1", "dilr", 2025, "A>B ranks, C worst of 4. Can D be rank 1?", ["Yes", "No", "Only if A is 4", "Impossible"], 0, "Yes."),
    q("d2", "dilr", 2024, "Bar graph growth means look at?", ["Heights only", "Change across periods", "Colours", "Title"], 1, "Change."),
    q("d3", "dilr", 2023, "Immediate neighbour means?", ["Adjacent", "Two away", "Same row only", "Facing"], 0, "Adjacent."),
    q("d4", "dilr", 2022, "Three-circle Venn shows?", ["At most one set", "Overlapping categories", "Only numbers", "Time"], 1, "Overlap."),
    q("d5", "dilr", 2021, "DS: I alone enough, II not → option?", ["A", "B", "C", "D"], 0, "A."),
    q("d6", "dilr", 2025, "90° sector of pie = ?", ["25%", "20%", "30%", "15%"], 0, "25%."),
    q("d7", "dilr", 2024, "Tournaments sets involve?", ["Points tables", "Grammar", "Chemistry", "Poetry"], 0, "Points/knockout."),
    q("d8", "dilr", 2023, "Incomplete table approach?", ["Random fill", "Use constraints", "Ignore set", "Average blindly"], 1, "Constraints."),
    q("d9", "dilr", 2025, "In a circular arrangement facing centre, left means?", ["Clockwise", "Anti-clockwise", "Opposite", "Random"], 1, "Usually anti-clockwise for left."),
    q("d10", "dilr", 2024, "If A is 2 ranks above B in a queue of 20, and B is 7th, A is?", ["5th", "9th", "6th", "4th"], 0, "5th."),
    q("d11", "dilr", 2023, "Data sufficiency: both statements needed →?", ["A", "B", "C", "D/E depending key"], 2, "Usually C."),
    q("d12", "dilr", 2022, "When a set has 'at least one' constraint, check?", ["All zero cases", "Minimum one in that set", "Maximum only", "Ignore"], 1, "Minimum one."),
    q("d13", "dilr", 2021, "Line graph slope positive means?", ["Decrease", "Increase", "Constant", "Zero"], 1, "Increase."),
    q("d14", "dilr", 2025, "In ranking, if X is not the tallest and not the shortest among 5, possible ranks?", ["2,3,4", "1,2", "Only 3", "1–5"], 0, "2,3,4."),
    q("d15", "dilr", 2024, "Caselet with 3 variables usually needs?", ["One equation", "Systematic cases / table", "Guess", "Skip"], 1, "Cases / table."),
    q("cq1", "quant", 2025, "x+1/x=3 ⇒ x²+1/x²=?", ["7", "9", "8", "6"], 0, "7."),
    q("cq2", "quant", 2024, "Markup 40%, discount 10%. Net profit%?", ["26", "30", "24", "28"], 0, "26%."),
    q("cq3", "quant", 2023, "A twice B; together 12 days. A alone?", ["18", "16", "20", "24"], 0, "18."),
    q("cq4", "quant", 2022, "log10 2≈0.301 ⇒ log10 5≈?", ["0.699", "0.5", "0.301", "0.25"], 0, "0.699."),
    q("cq5", "quant", 2021, "Trains 100m+120m, 40 & 50 km/h opposite. Time≈?", ["9.6s", "12s", "15s", "8s"], 0, "~8.8–9.6s."),
    q("cq6", "quant", 2025, "GP: a=3,r=2, 5th term?", ["48", "24", "96", "12"], 0, "48."),
    q("cq7", "quant", 2024, "Fair coin P(Head)?", ["0", "0.5", "1", "0.25"], 1, "0.5."),
    q("cq8", "quant", 2023, "Roots of x²−5x+6=0?", ["2,3", "1,6", "−2,−3", "0,5"], 0, "2 and 3."),
    q("cq9", "quant", 2025, "If SI for 2 years at 10% is ₹400, principal is?", ["2000", "1000", "4000", "1500"], 0, "2000."),
    q("cq10", "quant", 2024, "Mixture 3:2 milk:water, 20 L milk. Total mixture?", ["33.3 L", "50 L", "40 L", "30 L"], 0, "Milk 3/5 → 20=3/5 T → T≈33.3."),
    q("cq11", "quant", 2023, "Speed 60 km/h, distance 150 km. Time?", ["2.5 h", "3 h", "2 h", "1.5 h"], 0, "2.5."),
    q("cq12", "quant", 2022, "Average of 10 numbers is 25. Sum is?", ["250", "25", "100", "50"], 0, "250."),
    q("cq13", "quant", 2021, "If 20% of x = 40, x=?", ["200", "100", "80", "50"], 0, "200."),
    q("cq14", "quant", 2025, "(a+b)² = a²+b²+?", ["2ab", "ab", "a+b", "2a+2b"], 0, "2ab."),
    q("cq15", "quant", 2024, "Probability of drawing a king from 52 cards?", ["1/13", "1/4", "4/13", "1/52"], 0, "4/52=1/13."),
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
    q("p11", "physics", 2025, "Unit of electric current?", ["Volt", "Ampere", "Ohm", "Coulomb"], 1, "Ampere."),
    q("p12", "physics", 2024, "Acceleration due to gravity is maximum at?", ["Equator", "Poles", "Centre of Earth", "Same everywhere"], 1, "Poles."),
    q("p13", "physics", 2023, "Power of a lens is measured in?", ["Watt", "Dioptre", "Lux", "Candela"], 1, "Dioptre."),
    q("p14", "physics", 2022, "Which colour has longest wavelength?", ["Violet", "Blue", "Green", "Red"], 3, "Red."),
    q("p15", "physics", 2021, "First law of thermodynamics is conservation of?", ["Momentum", "Energy", "Mass", "Charge"], 1, "Energy."),
    q("p16", "physics", 2025, "Escape velocity from Earth is approximately?", ["11.2 km/s", "8 km/s", "3×10⁸ m/s", "9.8 m/s"], 0, "11.2 km/s."),
    q("p17", "physics", 2024, "Capacitance is measured in?", ["Farad", "Henry", "Tesla", "Weber"], 0, "Farad."),
    q("p18", "physics", 2023, "Newton's third law is?", ["Inertia", "F=ma", "Action-reaction", "Gravity"], 2, "Action-reaction."),
    q("p19", "physics", 2022, "Sound cannot travel through?", ["Air", "Water", "Steel", "Vacuum"], 3, "Vacuum."),
    q("p20", "physics", 2021, "Refractive index of air is approximately?", ["1", "1.5", "2.4", "0"], 0, "≈1."),
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
    q("c11", "chemistry", 2025, "Atomic number of Oxygen?", ["8", "16", "6", "12"], 0, "8."),
    q("c12", "chemistry", 2024, "Greenhouse gas among?", ["O2", "N2", "CO2", "Ar"], 2, "CO2."),
    q("c13", "chemistry", 2023, "pH < 7 indicates?", ["Acidic", "Basic", "Neutral", "Saline"], 0, "Acidic."),
    q("c14", "chemistry", 2022, "Common salt chemical formula?", ["NaCl", "KCl", "NaOH", "CaCl2"], 0, "NaCl."),
    q("c15", "chemistry", 2021, "Catalyst in Haber process?", ["Iron", "Platinum", "Nickel", "Copper"], 0, "Iron."),
    q("c16", "chemistry", 2025, "Electrons in a sodium atom?", ["11", "12", "10", "23"], 0, "11."),
    q("c17", "chemistry", 2024, "Which is not an allotrope of carbon?", ["Diamond", "Graphite", "Ozone", "Fullerene"], 2, "Ozone."),
    q("c18", "chemistry", 2023, "Molar mass of H2O?", ["16", "18", "20", "17"], 1, "18."),
    q("c19", "chemistry", 2022, "Strong acid among?", ["CH3COOH", "HCl", "H2CO3", "H2S"], 1, "HCl."),
    q("c20", "chemistry", 2021, "Functional group of alcohol?", ["−CHO", "−OH", "−COOH", "−NH2"], 1, "−OH."),
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
    q("m11", "maths", 2025, "If f(x)=x³, f'(2)=?", ["12", "8", "6", "4"], 0, "3x² → 12."),
    q("m12", "maths", 2024, "∫0¹ x dx =?", ["1/2", "1", "0", "2"], 0, "1/2."),
    q("m13", "maths", 2023, "Matrix [[1,0],[0,1]] is?", ["Zero", "Identity", "Singular", "Null"], 1, "Identity."),
    q("m14", "maths", 2022, "tan 45° =?", ["0", "1", "√3", "∞"], 1, "1."),
    q("m15", "maths", 2021, "lim x→∞ 1/x =?", ["0", "1", "∞", "−1"], 0, "0."),
    q("m16", "maths", 2025, "Roots of x²−5x+6=0?", ["2,3", "1,6", "−2,−3", "5,1"], 0, "2,3."),
    q("m17", "maths", 2024, "Distance between (1,2) and (4,6)?", ["5", "7", "3", "4"], 0, "5."),
    q("m18", "maths", 2023, "⁶C₂=?", ["15", "12", "10", "20"], 0, "15."),
    q("m19", "maths", 2022, "log₂ 8 =?", ["2", "3", "4", "8"], 1, "3."),
    q("m20", "maths", 2021, "Number of subsets of a set with 3 elements?", ["8", "6", "9", "3"], 0, "2³=8."),
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
    q("np11", "physics", 2025, "SI unit of pressure?", ["Pascal", "Newton", "Joule", "Watt"], 0, "Pascal."),
    q("np12", "physics", 2024, "Which has highest frequency among visible light?", ["Red", "Yellow", "Violet", "Green"], 2, "Violet."),
    q("np13", "physics", 2023, "Work done is zero when force is?", ["Parallel to displacement", "Perpendicular to displacement", "In direction of motion", "Maximum"], 1, "Perpendicular."),
    q("np14", "physics", 2022, "Dimensional formula of force?", ["MLT⁻²", "MLT⁻¹", "ML²T⁻²", "MT⁻²"], 0, "MLT⁻²."),
    q("np15", "physics", 2021, "Focal length of plane mirror is?", ["Zero", "Infinity", "One", "Negative"], 1, "Infinity."),
    q("np16", "physics", 2025, "Speed of light in vacuum ≈?", ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁵ m/s"], 0, "3×10⁸."),
    q("np17", "physics", 2024, "Unit of magnetic field?", ["Tesla", "Weber", "Henry", "Farad"], 0, "Tesla."),
    q("np18", "physics", 2023, "First law of motion is also called?", ["Law of inertia", "Law of acceleration", "Law of action", "Law of gravity"], 0, "Inertia."),
    q("np19", "physics", 2022, "Which is a vector quantity?", ["Speed", "Distance", "Displacement", "Mass"], 2, "Displacement."),
    q("np20", "physics", 2021, "Frequency of AC in India?", ["50 Hz", "60 Hz", "100 Hz", "40 Hz"], 0, "50 Hz."),
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
    q("nc11", "chemistry", 2025, "Number of protons in Carbon?", ["6", "12", "8", "14"], 0, "6."),
    q("nc12", "chemistry", 2024, "Which is a noble gas?", ["Oxygen", "Nitrogen", "Neon", "Chlorine"], 2, "Neon."),
    q("nc13", "chemistry", 2023, "pH of pure water is?", ["0", "7", "14", "1"], 1, "7."),
    q("nc14", "chemistry", 2022, "Formula of sulphuric acid?", ["H2SO4", "HCl", "HNO3", "H2CO3"], 0, "H2SO4."),
    q("nc15", "chemistry", 2021, "Oxidation number of H in H2 is?", ["0", "+1", "−1", "+2"], 0, "0 (element)."),
    q("nc16", "chemistry", 2025, "Which is an alkali metal?", ["Magnesium", "Sodium", "Aluminium", "Iron"], 1, "Sodium."),
    q("nc17", "chemistry", 2024, "Gas evolved when Zn reacts with HCl?", ["O2", "H2", "CO2", "N2"], 1, "H2."),
    q("nc18", "chemistry", 2023, "Avogadro's number is approximately?", ["6.022×10²³", "6.022×10²²", "3.14×10⁸", "1.6×10⁻¹⁹"], 0, "6.022×10²³."),
    q("nc19", "chemistry", 2022, "Most reactive halogen?", ["F", "Cl", "Br", "I"], 0, "Fluorine."),
    q("nc20", "chemistry", 2021, "Bond in H2 molecule is?", ["Ionic", "Covalent", "Metallic", "Hydrogen"], 1, "Covalent."),
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
    q("nb16", "biology", 2025, "Site of protein synthesis?", ["Mitochondria", "Ribosome", "Nucleus", "Lysosome"], 1, "Ribosome."),
    q("nb17", "biology", 2024, "Blood group AB is?", ["Universal donor", "Universal recipient", "Neither", "Rare only"], 1, "Universal recipient."),
    q("nb18", "biology", 2023, "Functional unit of kidney?", ["Neuron", "Nephron", "Alveolus", "Villus"], 1, "Nephron."),
    q("nb19", "biology", 2022, "Vitamin D deficiency causes?", ["Scurvy", "Rickets", "Beriberi", "Night blindness"], 1, "Rickets."),
    q("nb20", "biology", 2021, "Process of cell division for gametes?", ["Mitosis", "Meiosis", "Binary fission", "Budding"], 1, "Meiosis."),
    q("nb21", "biology", 2025, "Green pigment in plants?", ["Haemoglobin", "Chlorophyll", "Melanin", "Carotene"], 1, "Chlorophyll."),
    q("nb22", "biology", 2024, "Largest organ of human body?", ["Liver", "Skin", "Brain", "Heart"], 1, "Skin."),
    q("nb23", "biology", 2023, "Hormone that regulates blood sugar?", ["Thyroxine", "Insulin", "Adrenaline", "Growth hormone"], 1, "Insulin."),
    q("nb24", "biology", 2022, "Double membrane bound organelle?", ["Ribosome", "Mitochondria", "Centrosome", "Lysosome"], 1, "Mitochondria."),
    q("nb25", "biology", 2021, "Study of fossils is called?", ["Ecology", "Palaeontology", "Taxonomy", "Cytology"], 1, "Palaeontology."),
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
    q("u21", "gs", 2025, "Which Article deals with the President of India?", ["Article 52", "Article 74", "Article 123", "Article 356"], 0, "Article 52."),
    q("u22", "gs", 2024, "The concept of Directive Principles was borrowed from?", ["USA", "Ireland", "UK", "Canada"], 1, "Ireland."),
    q("u23", "gs", 2023, "Who was the first Governor-General of independent India?", ["Mountbatten", "C. Rajagopalachari", "Nehru", "Patel"], 0, "Mountbatten (then Rajaji)."),
    q("u24", "gs", 2022, "The 73rd Amendment is related to?", ["Panchayati Raj", "Municipalities", "Fundamental Rights", "Emergency"], 0, "Panchayati Raj."),
    q("u25", "gs", 2021, "Which Schedule contains the Anti-Defection provisions?", ["Eighth", "Ninth", "Tenth", "Eleventh"], 2, "Tenth."),
    q("u26", "gs", 2025, "The term 'Secular' was added to the Preamble by?", ["42nd Amendment", "44th", "52nd", "61st"], 0, "42nd."),
    q("u27", "gs", 2024, "Who appoints the Chief Election Commissioner?", ["PM", "President", "Parliament", "Supreme Court"], 1, "President."),
    q("u28", "gs", 2023, "The River Ganga is also known as in Bangladesh?", ["Padma", "Jamuna", "Meghna", "Brahmaputra"], 0, "Padma."),
    q("u29", "gs", 2022, "Kyoto Protocol is related to?", ["Biodiversity", "Climate change / GHG", "Ozone", "Wetlands"], 1, "GHG emissions."),
    q("u30", "gs", 2021, "Which is not a Fundamental Duty?", ["Respect national flag", "Pay taxes", "Protect environment", "Develop scientific temper"], 1, "Paying taxes is not listed as FD."),
    q("u31", "gs", 2025, "The minimum age for becoming a member of Lok Sabha is?", ["21", "25", "30", "35"], 1, "25."),
    q("u32", "gs", 2024, "Which Commission recommended the creation of the Planning Commission?", ["Radhakrishnan", "None specifically; set up by Cabinet", "Sarkaria", "Mandal"], 1, "Cabinet resolution 1950."),
    q("u33", "gs", 2023, "The Battle of Buxar was fought in?", ["1757", "1764", "1857", "1526"], 1, "1764."),
    q("u34", "gs", 2022, "Which gas is primarily responsible for global warming?", ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], 2, "CO2."),
    q("u35", "gs", 2021, "The Constitution of India was adopted on?", ["15 Aug 1947", "26 Jan 1950", "26 Nov 1949", "30 Jan 1948"], 2, "26 Nov 1949."),
    q("u36", "gs", 2025, "Which Article provides for the Finance Commission?", ["280", "360", "356", "370"], 0, "280."),
    q("u37", "gs", 2024, "The Tropic of Cancer does not pass through?", ["Rajasthan", "Gujarat", "West Bengal", "Kerala"], 3, "Kerala."),
    q("u38", "gs", 2023, "Who founded the Indian National Congress?", ["Gandhi", "A.O. Hume", "Nehru", "Tilak"], 1, "A.O. Hume."),
    q("u39", "gs", 2022, "The term 'Budget' is mentioned in which Article?", ["112", "110", "280", "None directly as 'Budget'"], 0, "Annual Financial Statement Art 112."),
    q("u40", "gs", 2021, "Which is a biodiversity hotspot in India?", ["Western Ghats", "Thar Desert", "Deccan Plateau", "Indo-Gangetic plain only"], 0, "Western Ghats."),
  ],

  gate: [
    q("ga1", "ga", 2025, "Similar to Candid?", ["Secretive", "Frank", "Rude", "Silent"], 1, "Candid means open and honest. Frank is the closest synonym; secretive is the opposite."),
    q("ga2", "ga", 2024, "5 workers 12 days; 6 workers take?", ["10", "8", "9", "14"], 0, "Work is constant: 5 workers x 12 days = 60 worker-days. With 6 workers: 60/6 = 10 days."),
    q("ga3", "ga", 2023, "2,6,12,20,30,?", ["42", "40", "36", "44"], 0, "Differences increase by 2 each time: +4, +6, +8, +10, +12 so 30+12 = 42."),
    q("ga4", "ga", 2022, "Avg of 5 nums=20; replace 30 by 10. New avg?", ["16", "18", "15", "17"], 0, "Sum was 5x20 = 100. Replace 30 by 10: new sum = 80. New average = 80/5 = 16."),
    q("ga5", "ga", 2021, "P(ace) from 52 cards?", ["1/13", "1/4", "4/13", "1/52"], 0, "There are 4 aces in 52 cards, so probability = 4/52 = 1/13."),
    q("ga6", "ga", 2025, "Opposite of Scarce?", ["Rare", "Abundant", "Little", "Sparse"], 1, "Scarce means rare or in short supply. The opposite is abundant (plentiful)."),
    q("ga7", "ga", 2024, "25% of 25% of 400?", ["25", "50", "100", "20"], 0, "25% of 400 = 100; 25% of 100 = 25."),
    q("ga8", "ga", 2023, "x:y=2:3, y:z=4:5 ⇒ x:z?", ["8:15", "2:5", "4:5", "8:9"], 0, "x:y = 2:3 and y:z = 4:5. Make y common (12): x:y = 8:12, y:z = 12:15, so x:z = 8:15."),
    q("ga9", "ga", 2022, "150 m train crosses pole in 10 s. Speed?", ["54 km/h", "15", "36", "72"], 0, "Speed = distance/time = 150 m / 10 s = 15 m/s = 15 x 18/5 = 54 km/h."),
    q("ga10", "ga", 2021, "log2 8=?", ["2", "3", "4", "8"], 1, "2^3 = 8, so log base 2 of 8 equals 3."),
    q("ga11", "ga", 2025, "Synonym of Diligent?", ["Lazy", "Hardworking", "Careless", "Slow"], 1, "Diligent means hardworking and careful. Lazy and careless are antonyms."),
    q("ga12", "ga", 2024, "If 15% of a number is 45, the number is?", ["300", "250", "350", "200"], 0, "15% of x = 45 implies x = 45 x 100/15 = 300."),
    q("ga13", "ga", 2023, "Series: 5, 10, 20, 40, ?", ["60", "80", "70", "100"], 1, "Each term doubles: 5, 10, 20, 40, 80."),
    q("ga14", "ga", 2022, "Average of 4, 8, 12, 16?", ["10", "8", "12", "14"], 0, "Sum = 4+8+12+16 = 40; average = 40/4 = 10."),
    q("ga15", "ga", 2021, "Probability of getting head on a fair coin?", ["0", "0.5", "1", "0.25"], 1, "A fair coin has two equally likely outcomes; P(Head) = 1/2 = 0.5."),
    q("ga16", "ga", 2025, "Antonym of Transparent?", ["Clear", "Opaque", "Bright", "Visible"], 1, "Transparent means see-through; opaque means not allowing light through."),
    q("ga17", "ga", 2024, "LCM of 4 and 6?", ["12", "24", "8", "10"], 0, "LCM of 4 and 6: multiples 4,8,12... and 6,12... so LCM = 12."),
    q("ga18", "ga", 2023, "If a:b = 3:4 and b:c = 2:5, a:c =?", ["3:10", "6:20", "3:5", "2:5"], 0, "a:b = 3:4, b:c = 2:5. With b common 4: a:b = 3:4, b:c = 4:10, so a:c = 3:10."),
    q("ga19", "ga", 2022, "Speed 72 km/h in m/s?", ["20", "18", "25", "15"], 0, "72 km/h = 72 x (5/18) = 20 m/s."),
    q("ga20", "ga", 2021, "log10 100 =?", ["1", "2", "10", "100"], 1, "10^2 = 100, so log base 10 of 100 equals 2."),
    q("co1", "core", 2025, "Binary search complexity?", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 1, "Binary search halves the search space each step on a sorted array, giving O(log n) time."),
    q("co2", "core", 2024, "LIFO structure?", ["Queue", "Stack", "Tree", "Graph"], 1, "Stack follows Last-In-First-Out (LIFO): the last pushed item is popped first."),
    q("co3", "core", 2023, "Deadlock Coffman conditions?", ["2", "3", "4", "5"], 2, "Coffman four conditions for deadlock: mutual exclusion, hold-and-wait, no preemption, circular wait."),
    q("co4", "core", 2022, "HTTP 404 means?", ["OK", "Not Found", "Server error", "Redirect"], 1, "HTTP 404 means the requested resource was not found on the server."),
    q("co5", "core", 2021, "Primary key must be?", ["Nullable", "Unique & not null", "Numeric only", "Always composite"], 1, "A primary key uniquely identifies each row and cannot be NULL."),
    q("co6", "core", 2025, "TCP is?", ["Connectionless", "Connection-oriented", "Unreliable only", "App layer only"], 1, "TCP is connection-oriented: it establishes a session and provides reliable delivery."),
    q("co7", "core", 2024, "Max edges simple undirected n vertices?", ["n", "n(n-1)/2", "n²", "2n"], 1, "A simple undirected graph on n vertices has at most n(n-1)/2 edges."),
    q("co8", "core", 2023, "Replace least recently used page?", ["FIFO", "LRU", "Optimal only", "Random"], 1, "LRU (Least Recently Used) replaces the page that has not been used for the longest time."),
    q("co9", "core", 2022, "ACID 'I' means?", ["Index", "Isolation", "Integrity only", "Instance"], 1, "In ACID, Isolation means concurrent transactions do not interfere with each other."),
    q("co10", "core", 2021, "Grammar-checking compiler phase?", ["Lexical", "Syntax analysis", "Code gen", "Linking"], 1, "Syntax analysis (parsing) checks grammar and builds the parse tree."),
    q("co11", "core", 2025, "Nested i=1..n, j=1..i complexity?", ["O(n)", "O(n²)", "O(n log n)", "O(1)"], 1, "Nested loops i=1..n, j=1..i run about n(n+1)/2 times, which is O(n^2)."),
    q("co12", "core", 2024, "Not a programming paradigm name?", ["OOP", "Functional", "Relational algebra only", "Procedural"], 2, "Relational algebra is a query model, not a general programming paradigm like OOP or functional."),
    q("co13", "core", 2023, "192.168.0.1 is typically?", ["Public", "Private", "Multicast", "Loopback"], 1, "192.168.0.0/16 is a private IPv4 range (RFC 1918), not publicly routable."),
    q("co14", "core", 2022, "Semaphore used for?", ["Deadlock only", "Synchronisation", "Compilation", "GUI"], 1, "Semaphores are synchronization primitives used to control access to shared resources."),
    q("co15", "core", 2021, "Removes transitive dependency?", ["1NF", "2NF", "3NF", "BCNF only"], 2, "3NF removes transitive dependencies of non-key attributes on the primary key."),
    q("co16", "core", 2025, "Time complexity of merge sort?", ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], 1, "Merge sort divides and merges in O(log n) levels, each O(n) work, total O(n log n)."),
    q("co17", "core", 2024, "Which data structure uses FIFO?", ["Stack", "Queue", "Tree", "Heap"], 1, "Queue is FIFO: the first enqueued element is dequeued first."),
    q("co18", "core", 2023, "In OS, thrashing is related to?", ["CPU scheduling", "Excessive paging", "Deadlock", "File system"], 1, "Thrashing is excessive paging when the working set does not fit in memory."),
    q("co19", "core", 2022, "HTTP status 200 means?", ["OK", "Not Found", "Redirect", "Server Error"], 0, "HTTP 200 means the request succeeded (OK)."),
    q("co20", "core", 2021, "Foreign key is used for?", ["Uniqueness", "Referential integrity", "Indexing only", "Sorting"], 1, "A foreign key enforces referential integrity between related tables."),
    q("co21", "core", 2025, "Dijkstra algorithm finds?", ["Minimum spanning tree", "Shortest path", "Maximum flow", "Topological order"], 1, "Dijkstra finds single-source shortest paths in graphs with non-negative edge weights."),
    q("co22", "core", 2024, "Which is not a layer in OSI model?", ["Physical", "Network", "Session", "Encryption"], 3, "OSI has seven layers; Encryption is a service, not an OSI layer name."),
    q("co23", "core", 2023, "In DBMS, 2NF removes?", ["Partial dependency", "Transitive dependency", "Multivalued", "All"], 0, "2NF eliminates partial dependency of non-key attributes on part of a composite key."),
    q("co24", "core", 2022, "Process that has finished but entry remains is?", ["Zombie", "Orphan", "Daemon", "Thread"], 0, "A zombie process has finished but still has an entry in the process table until the parent reaps it."),
    q("co25", "core", 2021, "Compiler converts?", ["High-level to machine", "Machine to high-level", "Only assembly", "Only object code"], 0, "A compiler translates high-level source code into machine code or intermediate form."),
    q("co26", "core", 2025, "BFS uses which data structure?", ["Stack", "Queue", "Heap", "Hash only"], 1, "BFS explores level by level and is implemented with a queue."),
    q("co27", "core", 2024, "Worst case of quicksort?", ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], 1, "Quicksort worst case is O(n^2) when pivots are always the smallest or largest element."),
    q("co28", "core", 2023, "Virtual memory is managed by?", ["Compiler", "OS", "Assembler", "Linker only"], 1, "The operating system manages virtual memory (paging and segmentation)."),
    q("co29", "core", 2022, "IPv4 address size?", ["32 bit", "64 bit", "128 bit", "16 bit"], 0, "IPv4 addresses are 32 bits long (for example 192.168.1.1)."),
    q("co30", "core", 2021, "SQL JOIN combines?", ["Rows from tables", "Only columns", "Indexes only", "Triggers"], 0, "JOIN combines rows from two or more tables based on a related column."),
    q("co31", "core", 2025, "Hash table average search?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], 0, "With a good hash function and load factor, average search in a hash table is O(1)."),
    q("co32", "core", 2024, "Pipelining improves?", ["Latency only", "Throughput", "Disk size", "Cache miss only"], 1, "Pipelining overlaps instruction stages to increase throughput (instructions per time)."),
    q("co33", "core", 2023, "RAID mainly provides?", ["Faster CPU", "Redundancy / performance for storage", "More RAM", "Compiler speed"], 1, "RAID combines disks for redundancy and/or higher performance."),
    q("co34", "core", 2022, "Mutex is used for?", ["Networking", "Mutual exclusion", "Parsing", "Sorting"], 1, "A mutex ensures mutual exclusion so only one thread holds a critical section at a time."),
    q("co35", "core", 2021, "Normalization reduces?", ["Redundancy", "Speed always", "Indexes", "Transactions"], 0, "Database normalization reduces data redundancy and update anomalies."),
    q("co36", "core", 2025, "DFS is typically implemented with?", ["Queue", "Stack / recursion", "Array only", "Heap only"], 1, "DFS goes deep first and is implemented with an explicit stack or recursion."),
    q("co37", "core", 2024, "Page fault occurs when?", ["Page in memory", "Page not in memory", "CPU idle", "Disk full only"], 1, "A page fault occurs when the CPU references a page that is not currently in RAM."),
    q("co38", "core", 2023, "TCP port for HTTP typically?", ["21", "22", "80", "25"], 2, "Default HTTP port is 80; HTTPS uses 443."),
    q("co39", "core", 2022, "Big-O of inserting at head of linked list?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], 0, "Inserting at the head of a singly linked list updates a few pointers, which is O(1)."),
    q("co40", "core", 2021, "ACID 'A' stands for?", ["Atomicity", "Availability", "Array", "Access"], 0, "Atomicity means a transaction runs fully or not at all (all-or-nothing)."),
    q("co41", "core", 2025, "Kruskal algorithm builds?", ["Shortest path", "MST", "Max flow", "Topological order"], 1, "Kruskal algorithm builds a minimum spanning tree by adding lightest edges without cycles."),
    q("co42", "core", 2024, "Context switch is done by?", ["User program", "OS scheduler", "Compiler", "Assembler"], 1, "The OS scheduler saves and restores context when switching processes or threads."),
    q("co43", "core", 2023, "CDN primarily helps with?", ["Local disk", "Content delivery latency", "CPU scheduling", "DB normalization"], 1, "A CDN caches content near users to reduce latency and origin load."),
    q("co44", "core", 2022, "Inorder of BST gives?", ["Random", "Sorted order", "Reverse only", "Level order"], 1, "Inorder traversal of a binary search tree visits keys in sorted order."),
    q("co45", "core", 2021, "Thrashing is caused by?", ["Too much CPU", "Excessive paging", "Fast disk", "No processes"], 1, "Thrashing happens when memory is overcommitted and the system spends most time paging."),
    q("co46", "core", 2025, "UDP is?", ["Connection-oriented", "Connectionless", "Always reliable", "App layer only"], 1, "UDP is connectionless and does not guarantee delivery or order."),
    q("co47", "core", 2024, "Space complexity of merge sort?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], 1, "Merge sort needs an auxiliary array of size O(n) for merging."),
    q("co48", "core", 2023, "Foreign key references?", ["Primary key of another table", "Any column", "Index only", "View only"], 0, "A foreign key typically references a primary key (or unique key) in another table."),
    q("co49", "core", 2022, "Round-robin is a?", ["Scheduling algorithm", "Sorting method", "Network protocol", "DB index"], 0, "Round-robin gives each ready process a fixed time quantum in cyclic order."),
    q("co50", "core", 2021, "NP-complete problems are?", ["Solved in P always", "Hard; in NP and NP-hard", "Only undecidable", "Always O(1)"], 1, "NP-complete problems are in NP and NP-hard; no known polynomial algorithm solves all of them."),
    q("co51", "core", 2025, "Cache hit means?", ["Data found in cache", "Data on disk only", "Page fault", "Miss always"], 0, "A cache hit means the requested data was found in the cache."),
    q("co52", "core", 2024, "Bellman-Ford handles?", ["Only positive weights", "Negative weights (no neg cycle)", "Only undirected", "Only BFS"], 1, "Bellman-Ford computes shortest paths and can handle negative edge weights (but not negative cycles)."),
    q("co53", "core", 2023, "SSL/TLS works mainly at?", ["Physical", "Transport / session security", "Data link only", "Application ignoring transport"], 1, "SSL/TLS provides encryption and authentication for data in transit (transport security)."),
    q("co54", "core", 2022, "Heap is used for?", ["Priority queue", "FIFO only", "Graph BFS only", "String match only"], 0, "A binary heap efficiently supports priority-queue operations (insert, extract-min/max)."),
    q("co55", "core", 2021, "2's complement of 5 in 4-bit?", ["1011", "0101", "1101", "0011"], 0, "In 4-bit form, 5 is 0101; invert gives 1010; add 1 gives 1011 (two's complement of 5)."),
    q("co56", "core", 2025, "Lexical analysis produces?", ["Parse tree", "Tokens", "Machine code", "Object files"], 1, "Lexical analysis splits source code into tokens (identifiers, keywords, operators, etc.)."),
    q("co57", "core", 2024, "CSMA/CD is associated with?", ["Wi-Fi only", "Ethernet collision handling", "IP routing", "DNS"], 1, "CSMA/CD was used on classic shared Ethernet to detect and recover from collisions."),
    q("co58", "core", 2023, "B+ tree is common in?", ["CPU registers", "Database indexes", "GPU cores", "Assemblers only"], 1, "B+ trees are widely used for database indexes because of balanced height and efficient range scans."),
    q("co59", "core", 2022, "Starvation can occur in?", ["FCFS never", "Priority scheduling", "Only RR", "Only SJF optimal"], 1, "In priority scheduling, a low-priority process may starve if higher-priority work keeps arriving."),
    q("co60", "core", 2021, "IPv6 address size?", ["32 bit", "64 bit", "128 bit", "256 bit"], 2, "IPv6 addresses are 128 bits long."),
    q("ga21", "ga", 2025, "If 12 workers build a wall in 10 days, 15 workers take?", ["8", "6", "12", "9"], 0, "12 x 10 = 120 worker-days; 120/15 = 8 days."),
    q("ga22", "ga", 2024, "Synonym of Lucid?", ["Clear", "Dark", "Vague", "Loud"], 0, "Lucid means clear and easy to understand."),
    q("ga23", "ga", 2023, "Series 3, 9, 27, 81, ?", ["243", "162", "108", "324"], 0, "Geometric sequence with ratio 3: 3, 9, 27, 81, 243."),
    q("ga24", "ga", 2022, "P(drawing heart from 52)?", ["1/4", "1/13", "1/2", "4/13"], 0, "13 hearts in 52 cards gives 13/52 = 1/4."),
    q("ga25", "ga", 2021, "log5 125 =?", ["2", "3", "4", "5"], 1, "5^3 = 125, so log base 5 of 125 equals 3."),
    q("ga26", "ga", 2025, "Antonym of Expand?", ["Contract", "Enlarge", "Grow", "Inflate"], 0, "Expand means grow larger; contract means shrink."),
    q("ga27", "ga", 2024, "20% of 350?", ["70", "60", "80", "50"], 0, "20% of 350 = 0.2 x 350 = 70."),
    q("ga28", "ga", 2023, "a:b=1:2, b:c=3:4 ⇒ a:c?", ["3:8", "1:4", "3:4", "2:3"], 0, "a:b = 1:2, b:c = 3:4. With b common 6: a:b = 3:6, b:c = 6:8, so a:c = 3:8."),
    q("ga29", "ga", 2022, "90 km/h in m/s?", ["25", "30", "20", "15"], 0, "90 km/h = 90 x 5/18 = 25 m/s."),
    q("ga30", "ga", 2021, "Mean of 2,4,6,8,10?", ["6", "5", "7", "8"], 0, "Sum = 30; mean = 30/5 = 6."),
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
    q("ie16", "english", 2025, "Synonym of Abundant?", ["Scarce", "Plentiful", "Rare", "Little"], 1, "Plentiful."),
    q("ie17", "english", 2024, "Error: He don't know.", ["He", "don't", "know", "No error"], 1, "doesn't."),
    q("ie18", "english", 2023, "She has lived here ___ 2020.", ["for", "since", "from", "at"], 1, "since."),
    q("ie19", "english", 2022, "Antonym of Ancient?", ["Old", "Modern", "Historic", "Past"], 1, "Modern."),
    q("ie20", "english", 2021, "Correct spelling of Receive?", ["Recieve", "Receive", "Receeve", "Receve"], 1, "Receive."),
    q("ie21", "english", 2025, "Lover of books?", ["Bibliophile", "Philosopher", "Audiophile", "Cartographer"], 0, "Bibliophile."),
    q("ie22", "english", 2024, "Passive: They are building a bridge.", ["is built", "is being built", "was built", "has built"], 1, "is being built."),
    q("ie23", "english", 2023, "Break the ice means?", ["Shatter", "Start conversation", "Cool", "End fight"], 1, "Start talking."),
    q("ie24", "english", 2022, "Article: ___ honest man", ["a", "an", "the", "none"], 1, "an."),
    q("ie25", "english", 2021, "Plural of Analysis?", ["Analysises", "Analyses", "Analysis", "Analysii"], 1, "Analyses."),
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
    q("iq16", "quant", 2025, "25% of 480?", ["120", "100", "140", "160"], 0, "120."),
    q("iq17", "quant", 2024, "SI on 5000 at 10% for 2 years?", ["1000", "500", "1500", "800"], 0, "1000."),
    q("iq18", "quant", 2023, "Average of 5,10,15,20,25?", ["15", "16", "14", "17"], 0, "15."),
    q("iq19", "quant", 2022, "CP 200, profit 20%, SP?", ["240", "220", "250", "260"], 0, "240."),
    q("iq20", "quant", 2021, "Train 120 m at 54 km/h crosses pole in?", ["8s", "6s", "10s", "12s"], 0, "8 s."),
    q("iq21", "quant", 2025, "LCM of 12 and 18?", ["36", "54", "72", "24"], 0, "36."),
    q("iq22", "quant", 2024, "√144 + √81?", ["21", "23", "25", "19"], 0, "21."),
    q("iq23", "quant", 2023, "3x+5=20, x=?", ["5", "4", "6", "3"], 0, "5."),
    q("iq24", "quant", 2022, "Area of circle r=7 (π=22/7)?", ["154", "144", "164", "148"], 0, "154."),
    q("iq25", "quant", 2021, "2:3 equals?", ["6:9", "4:5", "8:10", "5:7"], 0, "6:9."),
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
    q("ir16", "reasoning", 2025, "If PAPER is coded as OZODQ, how is PENCIL coded?", ["ODMBHK", "ODMBHJ", "ODNAHK", "OEMBHK"], 0, "Each letter −1."),
    q("ir17", "reasoning", 2024, "Series: 2, 6, 12, 20, 30, ?", ["40", "42", "44", "36"], 1, "Differences +4,+6,+8,+10,+12."),
    q("ir18", "reasoning", 2023, "A is taller than B but shorter than C. D is between A and B. Shortest?", ["A", "B", "C", "D"], 1, "C > A > D > B."),
    q("ir19", "reasoning", 2022, "Odd one: 3, 5, 11, 14, 17, 21", ["14", "17", "21", "11"], 0, "14 is even."),
    q("ir20", "reasoning", 2021, "If 1 Jan 2023 was Sunday, 1 Jan 2024 was?", ["Sunday", "Monday", "Tuesday", "Saturday"], 1, "Non-leap year → +1 day."),
    q("ir21", "reasoning", 2025, "All pens are books. Some books are desks. Conclusion: Some desks are books.", ["Only this follows", "Does not follow", "Both needed", "Either"], 0, "Follows."),
    q("ir22", "reasoning", 2024, "In a row of 40, R is 12th from left. Position from right?", ["28", "29", "30", "27"], 1, "40−12+1=29."),
    q("ir23", "reasoning", 2023, "At 3:00, angle between clock hands?", ["90°", "60°", "75°", "105°"], 0, "90°."),
    q("ir24", "reasoning", 2022, "AZ, BY, CX, ?", ["DW", "DU", "EV", "DX"], 0, "A↔Z pattern → DW."),
    q("ir25", "reasoning", 2021, "5, 11, 24, 51, 106, ?", ["217", "215", "221", "225"], 0, "×2+1 pattern."),
  ],
};

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a full-length paper. Prefer questions tagged with selected year, then fill from other years. */
function buildPaper(examId, year = "all") {
  const pattern = EXAM_PATTERNS[examId] || EXAM_PATTERNS["ssc-cgl"];
  const bank = BANK[examId] || BANK["ssc-cgl"];
  const questions = [];
  const yearNum = year === "all" ? null : Number(year);

  pattern.sections.forEach((sec) => {
    const sectionPool = bank.filter((x) => x.section === sec.id);
    let preferred = yearNum
      ? sectionPool.filter((x) => x.year === yearNum)
      : sectionPool;
    let rest = yearNum
      ? sectionPool.filter((x) => x.year !== yearNum)
      : [];

    preferred = shuffleArr(preferred);
    rest = shuffleArr(rest);
    // Prefer year-tagged, then others; recycle if still short
    const ordered = [...preferred, ...rest];
    if (ordered.length === 0 && sectionPool.length) ordered.push(...shuffleArr(sectionPool));

    for (let i = 0; i < sec.qCount; i++) {
      const item = ordered[i % Math.max(ordered.length, 1)] || sectionPool[0];
      if (!item) continue;
      questions.push({
        ...item,
        uid: `${sec.id}-${i}-${item.id}-${Math.random().toString(36).slice(2, 7)}`,
        sectionId: sec.id,
        sectionName: sec.name,
        marksEach: sec.marksEach,
        qNum: questions.length + 1,
      });
    }
  });

  return {
    pattern: {
      ...pattern,
      label: yearNum
        ? `${pattern.label} · ${yearNum}-style`
        : pattern.label,
    },
    questions,
    year: yearNum || "all",
  };
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

/* ---- SVG Charts for Results ---- */
function ScoreGauge({ score, maxScore, size = 140 }) {
  const pct = maxScore > 0 ? Math.max(0, Math.min(1, score / maxScore)) : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = pct >= 0.7 ? C.green : pct >= 0.4 ? C.yellow : C.red;

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" style={{ display: "block", margin: "0 auto" }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke={C.line} strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="70" y="66" textAnchor="middle" fontFamily={monoFont} fontSize="22" fontWeight="700" fill={C.ink}>
        {Math.round(score * 10) / 10}
      </text>
      <text x="70" y="86" textAnchor="middle" fontFamily={bodyFont} fontSize="11" fill={C.inkSoft}>
        / {maxScore}
      </text>
    </svg>
  );
}

function SectionBars({ bySection }) {
  const sections = Object.values(bySection);
  if (!sections.length) return null;
  const maxVal = Math.max(...sections.map((s) => s.max), 1);
  const barH = 22;
  const gap = 10;
  const labelW = 110;
  const chartW = 280;
  const h = sections.length * (barH + gap) + 10;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${labelW + chartW + 60} ${h}`} style={{ maxWidth: 460 }}>
      {sections.map((s, i) => {
        const y = i * (barH + gap) + 4;
        const w = Math.max(0, (Math.max(0, s.score) / maxVal) * chartW);
        const pct = s.max ? Math.round((Math.max(0, s.score) / s.max) * 100) : 0;
        const barColor = pct >= 70 ? C.green : pct >= 40 ? C.yellow : C.red;
        return (
          <g key={s.name}>
            <text x="0" y={y + barH / 2 + 4} fontFamily={bodyFont} fontSize="11" fill={C.ink} fontWeight="600">
              {s.name.length > 16 ? s.name.slice(0, 15) + "…" : s.name}
            </text>
            <rect x={labelW} y={y} width={chartW} height={barH} rx="4" fill={C.bg} />
            <rect x={labelW} y={y} width={w} height={barH} rx="4" fill={barColor} style={{ transition: "width 0.5s ease" }} />
            <text x={labelW + chartW + 8} y={y + barH / 2 + 4} fontFamily={monoFont} fontSize="11" fill={C.inkSoft}>
              {Math.round(s.score * 10) / 10}/{s.max}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AccuracyPie({ correct, wrong, unattempted }) {
  const total = correct + wrong + unattempted || 1;
  const cPct = correct / total;
  const wPct = wrong / total;
  const uPct = unattempted / total;
  const r = 48;
  const cx = 70;
  const cy = 70;

  function arc(startPct, endPct) {
    const start = startPct * 2 * Math.PI - Math.PI / 2;
    const end = endPct * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  let a = 0;
  const slices = [
    { pct: cPct, color: C.green, label: "Correct" },
    { pct: wPct, color: C.red, label: "Wrong" },
    { pct: uPct, color: C.inkSoft, label: "Skipped" },
  ].filter((s) => s.pct > 0.001);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {slices.map((s, i) => {
          const start = a;
          a += s.pct;
          return <path key={i} d={arc(start, a)} fill={s.color} stroke="#fff" strokeWidth="1.5" />;
        })}
        <circle cx={cx} cy={cy} r="22" fill="#fff" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontFamily={monoFont} fontSize="13" fontWeight="700" fill={C.ink}>
          {Math.round(cPct * 100)}%
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "Correct", val: correct, color: C.green },
          { label: "Wrong", val: wrong, color: C.red },
          { label: "Skipped", val: unattempted, color: C.inkSoft },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: bodyFont, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
            <span style={{ color: C.inkSoft }}>{item.label}</span>
            <strong style={{ color: C.ink, fontFamily: monoFont }}>{item.val}</strong>
          </div>
        ))}
      </div>
    </div>
  );
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
        <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
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
        {/* Graphs row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginBottom: 24,
            padding: 14,
            background: C.bg,
            borderRadius: 12,
          }}
        >
          <div>
            <div style={{ fontFamily: displayFont, fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8, textAlign: "center" }}>
              Overall score
            </div>
            <ScoreGauge score={analysis.score} maxScore={analysis.maxScore} />
          </div>
          <div>
            <div style={{ fontFamily: displayFont, fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
              Accuracy split
            </div>
            <AccuracyPie correct={analysis.correct} wrong={analysis.wrong} unattempted={analysis.unattempted} />
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, marginBottom: 10, color: C.ink }}>
            Section-wise performance
          </div>
          <SectionBars bySection={analysis.bySection} />
        </div>

        <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, marginBottom: 10, color: C.ink }}>
          Section summary
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
                  <div
                    style={{
                      marginTop: 10,
                      padding: "10px 12px",
                      background: C.softBlue,
                      borderRadius: 8,
                      borderLeft: `3px solid ${C.blue}`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: monoFont,
                        fontSize: 10,
                        color: C.blue,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        marginBottom: 4,
                      }}
                    >
                      Explanation
                    </div>
                    <div style={{ fontFamily: bodyFont, fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>
                      {qu.explanation}
                    </div>
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
          Practice items follow typical last-5-year patterns and topics. Not verbatim copyrighted past papers.
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
  const timePct = totalSec > 0 ? Math.max(0, Math.min(100, (left / totalSec) * 100)) : 0;
  const timerColor = left < 60 ? "#f0a0a0" : left < 300 ? "#f5d76e" : "#8fdfb0";
  const barColor = left < 60 ? C.red : left < 300 ? C.yellow : C.green;

  const qu = questions[idx];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] != null).length;
  if (!qu) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      {/* TIMER BAR + countdown progress */}
      <div
        style={{
          padding: "12px 16px 0",
          background: C.ink,
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            paddingBottom: 10,
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
                  fontSize: 24,
                  fontWeight: 700,
                  color: timerColor,
                  letterSpacing: 0.5,
                }}
              >
                <Clock size={16} style={{ display: "inline", marginRight: 6, verticalAlign: -3 }} />
                {display}
              </div>
              <div style={{ fontSize: 11, opacity: 0.65 }}>
                {answeredCount}/{questions.length} answered · {Math.round(timePct)}% time left
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
        {/* Countdown progress bar */}
        <div
          style={{
            height: 5,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${timePct}%`,
              background: barColor,
              transition: "width 1s linear, background 0.3s ease",
            }}
          />
        </div>
        {left < 60 && left > 0 && (
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 11,
              color: "#f0a0a0",
              padding: "6px 0 8px",
              textAlign: "center",
            }}
          >
            Less than 1 minute left — test will auto-submit at 0:00
          </div>
        )}
        {left >= 60 && <div style={{ height: 8 }} />}
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

function MockLobby({ exam, selectedYear, onYearChange, onStart }) {
  const pattern = EXAM_PATTERNS[exam.id] || EXAM_PATTERNS["ssc-cgl"];
  const totalQ = pattern.sections.reduce((a, s) => a + s.qCount, 0);
  const maxMarks = pattern.sections.reduce((a, s) => a + s.qCount * s.marksEach, 0);
  const bank = BANK[exam.id] || BANK["ssc-cgl"];
  const yearNum = selectedYear === "all" ? null : Number(selectedYear);
  const poolSize = pattern.sections.reduce((acc, sec) => {
    const n = bank.filter((x) => x.section === sec.id).length;
    return acc + n;
  }, 0);
  const yearPoolSize = yearNum
    ? bank.filter((x) => x.year === yearNum).length
    : poolSize;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <ListChecks size={20} color={C.ink} />
        <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 18, color: C.ink }}>
          Full-length mock · year-wise
        </h2>
      </div>
      <p style={{ margin: "0 0 14px", fontFamily: bodyFont, fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
        Real full-length pattern for {exam.shortName}. Pick a year to prefer that year’s style questions;
        shortfall is filled from other years. Original practice items (not verbatim past papers).
      </p>

      {/* Year selector */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 10,
            color: C.inkSoft,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Select year (style)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {YEAR_OPTIONS.map((y) => {
            const active = selectedYear === y;
            return (
              <button
                key={String(y)}
                type="button"
                onClick={() => onYearChange(y)}
                style={{
                  fontFamily: bodyFont,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : C.ink,
                  background: active ? C.ink : C.bg,
                  border: `1px solid ${active ? C.ink : C.line}`,
                  borderRadius: 20,
                  padding: "7px 14px",
                  cursor: "pointer",
                }}
              >
                {y === "all" ? "All years" : y}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontFamily: bodyFont, fontSize: 12, color: C.inkSoft }}>
          {yearNum
            ? `Preferring ${yearNum}-tagged items (~${yearPoolSize} in bank for this exam).`
            : `Mixed from all years (~${poolSize} items in bank).`}
        </div>
      </div>

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

      {pattern.sections.map((s) => {
        const pool = bank.filter((x) => x.section === s.id).length;
        const yPool = yearNum
          ? bank.filter((x) => x.section === s.id && x.year === yearNum).length
          : pool;
        return (
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
              {yearNum ? ` · ${yearNum}: ${yPool}` : ` · pool ${pool}`}
            </span>
          </div>
        );
      })}

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
        <Play size={18} /> Start {selectedYear === "all" ? "full mock" : `${selectedYear}-style full mock`}
      </button>
      <p style={{ marginTop: 10, fontSize: 11.5, color: C.inkSoft, lineHeight: 1.45 }}>
        Full-length counts match typical official structure. Banks are original practice items in year-style
        patterns — not copyrighted past papers. When a year’s pool is small, questions are filled from other years.
      </p>
    </div>
  );
}

export default function PracticeTestSection({ exam }) {
  const [phase, setPhase] = useState("lobby");
  const [paper, setPaper] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");

  const start = () => {
    setPaper(buildPaper(exam.id, selectedYear));
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
      {phase === "lobby" && (
        <MockLobby
          exam={exam}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onStart={start}
        />
      )}
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