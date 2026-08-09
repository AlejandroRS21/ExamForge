// ExamForge — Database Seed (direct pg pool for local dev)
import pg from "pg";
import bcrypt from "bcryptjs";

// Strip query params — pg has issues with ?schema=public from Prisma connection strings
const dbUrl = process.env.DATABASE_URL?.split("?")[0] ?? "postgresql://postgres:postgres@localhost:5432/opensloth";
const pool = new pg.Pool({ connectionString: dbUrl });

async function query(sql: string, params?: any[]) {
  return pool.query(sql, params);
}

/** Convert a JS array to Postgres text[] literal (e.g. ["a","b"] → {a,b}) */
function pgArray(arr: string[]): string {
  return "{" + arr.join(",") + "}";
}

async function main() {
  console.log("Seeding database with authentic Cambridge B2 First content...");

  // ── Admin user ──────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const existingAdmin = await query(`SELECT id FROM "User" WHERE email = $1`, ["admin@opensloth.com"]);
  if (existingAdmin.rows.length === 0) {
    const now = new Date();
    await query(
      `INSERT INTO "User" (id, name, email, "passwordHash", "emailVerified", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $6)`,
      ["Admin", "admin@opensloth.com", adminPassword, now, "ADMIN", now]
    );
    console.log(`  ✓ Admin user: admin@opensloth.com (password: Admin123!)`);
  } else {
    console.log(`  ✓ Admin user already exists`);
  }

  // ── Tester user (plain USER role, for manual QA of student-facing flows) ──
  const testerPassword = await bcrypt.hash("Tester123!", 10);
  const existingTester = await query(`SELECT id FROM "User" WHERE email = $1`, ["tester@opensloth.com"]);
  if (existingTester.rows.length === 0) {
    const now = new Date();
    await query(
      `INSERT INTO "User" (id, name, email, "passwordHash", "emailVerified", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $6)`,
      ["Tester", "tester@opensloth.com", testerPassword, now, "USER", now]
    );
    console.log(`  ✓ Tester user: tester@opensloth.com (password: Tester123!)`);
  } else {
    console.log(`  ✓ Tester user already exists`);
  }

  // ── Exam Parts (B2 First 7 parts) ──────────────────────────────────
  const parts = [
    { id: "ruoe-part-1", label: "Multiple Choice Cloze", paper: "R&UoE", n: 1, desc: "Vocabulary & phrasal verbs in context", time: 10, qc: 8 },
    { id: "ruoe-part-2", label: "Open Cloze", paper: "R&UoE", n: 2, desc: "Grammar & prepositions in passage", time: 10, qc: 8 },
    { id: "ruoe-part-3", label: "Word Formation", paper: "R&UoE", n: 3, desc: "Affixes & root word derivation", time: 10, qc: 8 },
    { id: "ruoe-part-4", label: "Key Word Transformation", paper: "R&UoE", n: 4, desc: "Sentence re-writing using key word", time: 12, qc: 6 },
    { id: "ruoe-part-5", label: "Gapped Text", paper: "R&UoE", n: 5, desc: "Paragraph & discourse cohesion", time: 15, qc: 6 },
    { id: "ruoe-part-6", label: "Multiple Matching", paper: "R&UoE", n: 6, desc: "Detail reading & paragraph matching", time: 13, qc: 10 },
    { id: "ruoe-part-7", label: "Short Texts Matching", paper: "R&UoE", n: 7, desc: "Scanning & opinion identification", time: 15, qc: 10 },
  ];

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const sortOrder = i + 1;
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

  // ── Authentic Cambridge B2 First Sample Questions ─────────────────────────────
  const sampleQuestions: {
    examPartId: string; type: string; prompt: any; options: any; correctAnswer: any;
    explanation: string; difficulty: string; skillsTested: string[];
  }[] = [
    // Part 1: Multiple Choice Cloze
    {
      examPartId: "ruoe-part-1", type: "MC",
      prompt: { text: "The archaeologist was amazed by the ___ of the ancient artifacts in the tomb.", hint: "Think about keeping something in its original condition." },
      options: ["preservation", "prevention", "preparation", "preference"],
      correctAnswer: "A",
      explanation: "'Preservation' refers to keeping something in its original state over time. 'Prevention' means stopping something from happening, which does not fit artifacts.",
      difficulty: "B", skillsTested: ["vocabulary", "collocations"],
    },
    {
      examPartId: "ruoe-part-1", type: "MC",
      prompt: { text: "Heavy rain forced the organizers to ___ off the outdoor concert until next weekend.", hint: "Phrasal verb meaning to cancel or postpone." },
      options: ["call", "take", "put", "turn"],
      correctAnswer: "A",
      explanation: "'Call off' is the mandatory phrasal verb meaning to cancel an event.",
      difficulty: "B", skillsTested: ["phrasal verbs", "idioms"],
    },

    // Part 2: Open Cloze
    {
      examPartId: "ruoe-part-2", type: "CLOZE",
      prompt: { text: "The research team has been working ___ the renewable energy project for over two years.", hint: "A preposition that collocates with 'working'." },
      options: null,
      correctAnswer: "on",
      explanation: "'Working on' is the correct verb + preposition collocation when referring to projects or tasks.",
      difficulty: "B", skillsTested: ["grammar", "prepositions"],
    },
    {
      examPartId: "ruoe-part-2", type: "CLOZE",
      prompt: { text: "Despite the bad weather, the climbers succeeded ___ reaching the mountain summit before dark.", hint: "Preposition used after 'succeeded'." },
      options: null,
      correctAnswer: "in",
      explanation: "The verb 'succeed' takes the preposition 'in' followed by a gerund ('in reaching').",
      difficulty: "B", skillsTested: ["dependent prepositions", "verb patterns"],
    },

    // Part 3: Word Formation
    {
      examPartId: "ruoe-part-3", type: "WF",
      prompt: { text: "The ___ of the new public transport policy was met with widespread public approval.", stemWord: "INTRODUCE", hint: "Form a noun from INTRODUCE." },
      options: null,
      correctAnswer: "introduction",
      explanation: "The noun form of the verb 'introduce' is 'introduction' (adding suffix -tion).",
      difficulty: "B", skillsTested: ["word formation", "suffixes"],
    },
    {
      examPartId: "ruoe-part-3", type: "WF",
      prompt: { text: "It is essential to check the safety guidelines to prevent ___ injuries in the lab.", stemWord: "NECESSARY", hint: "Add a prefix meaning 'not'." },
      options: null,
      correctAnswer: "unnecessary",
      explanation: "Adding the prefix 'un-' to 'necessary' creates the negative adjective 'unnecessary'.",
      difficulty: "B", skillsTested: ["prefixes", "antonyms"],
    },

    // Part 4: Key Word Transformation
    {
      examPartId: "ruoe-part-4", type: "KT",
      prompt: { text: "Rewrite the sentence keeping the same meaning.", leadIn: `"I'm sorry I arrived late for the meeting," she said.`, keyword: "APOLOGISED" },
      options: null,
      correctAnswer: "apologised for being",
      explanation: "'Apologise' requires the structure 'apologised for + [verb]-ing' (apologised for being late).",
      difficulty: "B", skillsTested: ["reported speech", "verb patterns"],
    },

    // Part 5: Gapped Text
    {
      examPartId: "ruoe-part-5", type: "GT",
      prompt: { text: "Reorder these sentences logically to form a coherent paragraph.", items: [
        { id: "b", text: "The hospital implemented a new electronic health record system." },
        { id: "d", text: "The transition took approximately six months of intensive staff training." },
        { id: "c", text: "Doctors could now access patient histories instantly." },
        { id: "a", text: "This led to significant improvements in overall treatment efficiency." },
      ], hint: "Chronological sequence: Implementation → Transition → Access → Result." },
      options: null,
      correctAnswer: ["b", "d", "c", "a"],
      explanation: "Logical cohesion: 'implemented system' (b) → 'transition took months' (d) → 'could access histories' (c) → 'this led to improvements' (a).",
      difficulty: "C", skillsTested: ["discourse cohesion", "reading structure"],
    },

    // Part 6 & 7: Multiple Matching
    {
      examPartId: "ruoe-part-6", type: "MM",
      prompt: { text: "Match each research paragraph to its corresponding category.", items: [
        { id: "p1", text: "Clinical trials indicate that daily brisk walking reduces cardiovascular risk by 30%." },
        { id: "p2", text: "Health authorities advise adults to aim for at least 150 minutes of exercise per week." },
      ], options: [{ id: "A", label: "Research Findings" }, { id: "B", label: "Official Guidelines" }] },
      options: null,
      correctAnswer: { p1: "A", p2: "B" },
      explanation: "Paragraph p1 details empirical trial data (A: Research Findings); Paragraph p2 gives advice from authorities (B: Official Guidelines).",
      difficulty: "B", skillsTested: ["reading comprehension", "paragraph matching"],
    },
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
      console.log(`  ✓ Authenticated B2 question created for ${q.examPartId}`);
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
