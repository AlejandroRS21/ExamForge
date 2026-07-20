// ExamForge — Database Seed (direct pg pool for local dev)
import pg from "pg";
import bcrypt from "bcryptjs";

// Strip query params — pg has issues with ?schema=public from Prisma connection strings
const dbUrl = process.env.DATABASE_URL?.split("?")[0] ?? "postgresql://postgres:postgres@localhost:5432/examforge";
const pool = new pg.Pool({ connectionString: dbUrl });

async function query(sql: string, params?: any[]) {
  return pool.query(sql, params);
}

/** Convert a JS array to Postgres text[] literal (e.g. ["a","b"] → {a,b}) */
function pgArray(arr: string[]): string {
  return "{" + arr.join(",") + "}";
}

async function main() {
  console.log("Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const existingAdmin = await query(`SELECT id FROM "User" WHERE email = $1`, ["admin@examforge.com"]);
  if (existingAdmin.rows.length === 0) {
    const now = new Date();
    await query(
      `INSERT INTO "User" (id, name, email, "passwordHash", "emailVerified", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $6)`,
      ["Admin", "admin@examforge.com", adminPassword, now, "ADMIN", now]
    );
    console.log(`  ✓ Admin user: admin@examforge.com (password: Admin123!)`);
  } else {
    console.log(`  ✓ Admin user already exists`);
  }

  // ── Tester user (plain USER role, for manual QA of student-facing flows) ──
  const testerPassword = await bcrypt.hash("Tester123!", 10);
  const existingTester = await query(`SELECT id FROM "User" WHERE email = $1`, ["tester@examforge.com"]);
  if (existingTester.rows.length === 0) {
    const now = new Date();
    await query(
      `INSERT INTO "User" (id, name, email, "passwordHash", "emailVerified", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $6)`,
      ["Tester", "tester@examforge.com", testerPassword, now, "USER", now]
    );
    console.log(`  ✓ Tester user: tester@examforge.com (password: Tester123!)`);
  } else {
    console.log(`  ✓ Tester user already exists`);
  }

  // ── Exam parts ──────────────────────────────────────────────────────
  const parts = [
    { id: "ruoe-part-1", label: "R&UoE Part 1", paper: "R&UoE", n: 1, time: 8, qc: 8, desc: "Multiple-choice cloze" },
    { id: "ruoe-part-2", label: "R&UoE Part 2", paper: "R&UoE", n: 2, time: 8, qc: 8, desc: "Open cloze" },
    { id: "ruoe-part-3", label: "R&UoE Part 3", paper: "R&UoE", n: 3, time: 8, qc: 8, desc: "Word formation" },
    { id: "ruoe-part-4", label: "R&UoE Part 4", paper: "R&UoE", n: 4, time: 10, qc: 6, desc: "Key word transformation" },
    { id: "ruoe-part-5", label: "R&UoE Part 5", paper: "R&UoE", n: 5, time: 12, qc: 6, desc: "Gapped text" },
    { id: "ruoe-part-6", label: "R&UoE Part 6", paper: "R&UoE", n: 6, time: 10, qc: 4, desc: "Multiple matching (gapped paragraphs)" },
    { id: "ruoe-part-7", label: "R&UoE Part 7", paper: "R&UoE", n: 7, time: 14, qc: 10, desc: "Multiple matching (short texts)" },
    { id: "writing-part-1", label: "Writing Part 1", paper: "Writing", n: 1, time: 40, qc: 1, desc: "Essay" },
    { id: "writing-part-2", label: "Writing Part 2", paper: "Writing", n: 2, time: 40, qc: 1, desc: "Article / Email / Report / Review" },
  ];

  let sortOrder = 0;
  for (const p of parts) {
    sortOrder++;
    const existing = await query(`SELECT id FROM "ExamPart" WHERE id = $1`, [p.id]);
    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO "ExamPart" (id, label, paper, "partNumber", description, "timeMinutes", "questionCount", "sortOrder")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [p.id, p.label, p.paper, p.n, p.desc, p.time, p.qc, sortOrder]
      );
      console.log(`  ✓ ${p.paper} Part ${p.n}: ${p.desc}`);
    }
  }

  // ── Sample questions ────────────────────────────────────────────────
  const sampleQuestions: {
    examPartId: string; type: string; prompt: any; options: any; correctAnswer: any;
    explanation: string; difficulty: string; skillsTested: string[];
  }[] = [
    // Part 1: Multiple-choice cloze
    ...Array.from({ length: 3 }, () => ({
      examPartId: "ruoe-part-1", type: "MC",
      prompt: { text: "The archaeologist was amazed by the _____ of the ancient artifacts.\n\nA) preservation  B) prevention  C) preparation  D) preference", hint: "Think about keeping something in its original condition." },
      options: ["preservation", "prevention", "preparation", "preference"],
      correctAnswer: "A", explanation: "Preservation means keeping something in its original state.",
      difficulty: "B", skillsTested: ["vocabulary", "collocations"],
    })),
    // Part 2: Open cloze
    ...Array.from({ length: 3 }, () => ({
      examPartId: "ruoe-part-2", type: "CLOZE",
      prompt: { text: "The research team has been working _____ the project for over two years now.", hint: "Think about a preposition that collocates with 'working'." },
      options: null,
      correctAnswer: ["on"], explanation: "'Working on' is the correct phrasal verb.",
      difficulty: "B", skillsTested: ["grammar", "prepositions"],
    })),
    // Part 3: Word formation
    ...Array.from({ length: 3 }, () => ({
      examPartId: "ruoe-part-3", type: "WF",
      prompt: { text: "The _____ of the new policy was met with widespread approval.", stemWord: "INTRODUCE", hint: "Add a suffix to form a noun." },
      options: null,
      correctAnswer: ["introduction"], explanation: "The noun form of 'introduce' is 'introduction'.",
      difficulty: "B", skillsTested: ["word formation", "vocabulary"],
    })),
    // Part 4: Key word transformation
    ...Array.from({ length: 2 }, () => ({
      examPartId: "ruoe-part-4", type: "KT",
      prompt: { text: `Rewrite using the word in bold.`, leadIn: `"I'm sorry I'm late," she said. → She _____ late.\n\nComplete the second sentence.`, keyword: "APOLOGISED" },
      options: null,
      correctAnswer: { keyword: "APOLOGISED", acceptable: ["apologised for being", "apologized for being"] },
      explanation: "Requires 'apologised for being' to maintain meaning.",
      difficulty: "B", skillsTested: ["grammar", "key word transformation"],
    })),
    // Part 5: Gapped text
    ...Array.from({ length: 2 }, () => ({
      examPartId: "ruoe-part-5", type: "GT",
      prompt: { text: "Put sentences in order.", items: [
        { id: "a", text: "This led to significant improvements." },
        { id: "b", text: "The hospital implemented a new electronic records system." },
        { id: "c", text: "Doctors could now access patient histories instantly." },
        { id: "d", text: "The transition took approximately six months." },
      ], hint: "Chronological order." },
      options: null,
      correctAnswer: ["b", "d", "c", "a"],
      explanation: "The logical sequence: implementation → transition → access → outcome.",
      difficulty: "C", skillsTested: ["cohesion", "reading comprehension"],
    })),
    // Part 6: Multiple matching
    ...Array.from({ length: 2 }, () => ({
      examPartId: "ruoe-part-6", type: "MM",
      prompt: { text: "Match each paragraph to the correct heading.", items: [
        { id: "p1", text: "Studies show regular exercise improves cognitive function in adults over 65." },
        { id: "p2", text: "Participants who exercised three times a week scored 20% higher." },
      ], options: [{ id: "A", label: "Research findings" }, { id: "B", label: "Health recommendations" }] },
      options: null,
      correctAnswer: ["A", "B"],
      explanation: "Paragraph 1 presents study claims (A); Paragraph 2 provides specific findings (B).",
      difficulty: "B", skillsTested: ["reading comprehension", "matching"],
    })),
    // Part 7: Short texts matching
    ...Array.from({ length: 3 }, () => ({
      examPartId: "ruoe-part-7", type: "MM",
      prompt: { text: "Which person says each statement?", items: [
        { id: "s1", text: '"I prefer studying in the morning."' },
        { id: "s2", text: '"Background music helps me concentrate."' },
        { id: "s3", text: '"Short breaks every hour improve my focus."' },
      ], options: [{ id: "A", label: "Maria, 24" }, { id: "B", label: "James, 31" }], hint: "Read each statement." },
      options: null,
      correctAnswer: ["A", "B", "B"],
      explanation: "Morning (A), background music (B), short breaks (B).",
      difficulty: "B", skillsTested: ["reading comprehension", "matching"],
    })),
  ];

  let qIndex = 0;
  for (const q of sampleQuestions) {
    qIndex++;
    const existing = await query(
      `SELECT id FROM "Question" WHERE "examPartId" = $1 AND type = $2 AND status = 'ACTIVE' LIMIT 1`,
      [q.examPartId, q.type]
    );
    if (existing.rows.length === 0) {
      const options = q.options ? JSON.stringify(q.options) : null;
      const correctAnswer = JSON.stringify(q.correctAnswer);
      const skills = pgArray(q.skillsTested);
      const prompt = JSON.stringify(q.prompt);
      const now = new Date();
      await query(
        `INSERT INTO "Question" (id, "examPartId", type, prompt, options, "correctAnswer", explanation, difficulty, status, "aiGenerated", "skillsTested", "version", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', true, $9, 1, $10, $10)`,
        [`sample-q-${qIndex}`, q.examPartId, q.type, prompt, options, correctAnswer, q.explanation, q.difficulty, skills, now]
      );
      console.log(`  ✓ Sample question for ${q.examPartId}`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
  const [{ rows: [{ count: partsCount }] }] = await Promise.all([
    query(`SELECT count(*)::int as count FROM "ExamPart"`),
  ]);
  const { rows: [{ count: qCount }] } = (await query(`SELECT count(*)::int as count FROM "Question"`));
  const { rows: [{ count: uCount }] } = (await query(`SELECT count(*)::int as count FROM "User"`));

  console.log(`\nSeed complete!`);
  console.log(`  Parts: ${partsCount}`);
  console.log(`  Questions: ${qCount}`);
  console.log(`  Users: ${uCount}`);
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => pool.end());
