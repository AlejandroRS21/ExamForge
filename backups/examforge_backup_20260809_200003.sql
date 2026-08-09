--
-- PostgreSQL database dump
--

\restrict zxo4cmmN2CdXN1XajpjIVI368Q5a0pfbwelon8Zqu0Y0B8O1PjRgV3yAyWjWKQB

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AchievementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AchievementType" AS ENUM (
    'FIRST_STEPS',
    'PERFECT_PART',
    'THE_80_CLUB',
    'DEDICATED',
    'STREAK_MASTER',
    'SPEED_DEMON'
);


ALTER TYPE public."AchievementType" OWNER TO postgres;

--
-- Name: AttemptStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttemptStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'TIMED_OUT'
);


ALTER TYPE public."AttemptStatus" OWNER TO postgres;

--
-- Name: AttemptType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttemptType" AS ENUM (
    'PRACTICE',
    'MOCK'
);


ALTER TYPE public."AttemptType" OWNER TO postgres;

--
-- Name: ContentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContentStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."ContentStatus" OWNER TO postgres;

--
-- Name: ContentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContentType" AS ENUM (
    'QUIZ',
    'AUDIO',
    'FLASHCARDS',
    'MINDMAP'
);


ALTER TYPE public."ContentType" OWNER TO postgres;

--
-- Name: GenerationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GenerationStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."GenerationStatus" OWNER TO postgres;

--
-- Name: GoalType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GoalType" AS ENUM (
    'ACCURACY',
    'STREAK'
);


ALTER TYPE public."GoalType" OWNER TO postgres;

--
-- Name: QuestionDifficulty; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuestionDifficulty" AS ENUM (
    'A',
    'B',
    'C'
);


ALTER TYPE public."QuestionDifficulty" OWNER TO postgres;

--
-- Name: QuestionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuestionStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'REJECTED'
);


ALTER TYPE public."QuestionStatus" OWNER TO postgres;

--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuestionType" AS ENUM (
    'MC',
    'CLOZE',
    'WF',
    'KT',
    'GT',
    'MM'
);


ALTER TYPE public."QuestionType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'EDITOR',
    'VIEWER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SourceType" AS ENUM (
    'URL',
    'TEXT',
    'YOUTUBE'
);


ALTER TYPE public."SourceType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Achievement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Achievement" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."AchievementType" NOT NULL,
    "unlockedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Achievement" OWNER TO postgres;

--
-- Name: Answer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Answer" (
    id text NOT NULL,
    "attemptId" text NOT NULL,
    "questionId" text NOT NULL,
    "givenAnswer" jsonb NOT NULL,
    "isCorrect" boolean,
    "timeSpentSeconds" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Answer" OWNER TO postgres;

--
-- Name: AudioExercise; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AudioExercise" (
    id text NOT NULL,
    "generatedContentId" text NOT NULL,
    title text NOT NULL,
    "audioData" bytea,
    "mimeType" text DEFAULT 'audio/mpeg'::text NOT NULL,
    transcript text,
    questions jsonb,
    duration integer,
    "attemptCount" integer DEFAULT 0 NOT NULL,
    status public."ContentStatus" DEFAULT 'DRAFT'::public."ContentStatus" NOT NULL,
    "examPartId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "downloadUrl" text
);


ALTER TABLE public."AudioExercise" OWNER TO postgres;

--
-- Name: ChallengeParticipation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChallengeParticipation" (
    id text NOT NULL,
    "challengeId" text NOT NULL,
    "userId" text NOT NULL,
    "attemptId" text,
    score integer DEFAULT 0 NOT NULL,
    rank integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChallengeParticipation" OWNER TO postgres;

--
-- Name: DailyStreak; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DailyStreak" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "currentStreak" integer DEFAULT 0 NOT NULL,
    "longestStreak" integer DEFAULT 0 NOT NULL,
    "lastActiveDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DailyStreak" OWNER TO postgres;

--
-- Name: ExamAttempt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExamAttempt" (
    id text NOT NULL,
    "userId" text,
    "anonymousSessionId" text,
    type public."AttemptType" NOT NULL,
    status public."AttemptStatus" DEFAULT 'IN_PROGRESS'::public."AttemptStatus" NOT NULL,
    "partId" text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "timeSpentSeconds" integer DEFAULT 0 NOT NULL,
    "questionCount" integer DEFAULT 0 NOT NULL,
    "correctCount" integer DEFAULT 0 NOT NULL,
    "totalScore" double precision,
    "cambridgeScaleScore" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExamAttempt" OWNER TO postgres;

--
-- Name: ExamPart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExamPart" (
    id text NOT NULL,
    label text NOT NULL,
    paper text NOT NULL,
    "partNumber" integer NOT NULL,
    description text,
    "timeMinutes" integer NOT NULL,
    "questionCount" integer NOT NULL,
    "sortOrder" integer NOT NULL
);


ALTER TABLE public."ExamPart" OWNER TO postgres;

--
-- Name: Flashcard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Flashcard" (
    id text NOT NULL,
    "deckId" text NOT NULL,
    front text NOT NULL,
    back text NOT NULL,
    hint text,
    "easeFactor" double precision DEFAULT 2.5 NOT NULL,
    "interval" integer DEFAULT 0 NOT NULL,
    repetitions integer DEFAULT 0 NOT NULL,
    "nextReviewAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Flashcard" OWNER TO postgres;

--
-- Name: FlashcardDeck; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FlashcardDeck" (
    id text NOT NULL,
    "generatedContentId" text NOT NULL,
    title text NOT NULL,
    description text,
    "examPartId" text,
    "createdById" text NOT NULL,
    "cardCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FlashcardDeck" OWNER TO postgres;

--
-- Name: GeneratedContent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GeneratedContent" (
    id text NOT NULL,
    "sourceType" public."SourceType" NOT NULL,
    "sourceData" text NOT NULL,
    "contentType" public."ContentType" NOT NULL,
    "rawResponse" jsonb,
    status public."GenerationStatus" DEFAULT 'PENDING'::public."GenerationStatus" NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedById" text,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text NOT NULL,
    "artifactId" text,
    elapsed integer,
    "notebookId" text
);


ALTER TABLE public."GeneratedContent" OWNER TO postgres;

--
-- Name: Goal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Goal" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."GoalType" NOT NULL,
    "targetValue" integer NOT NULL,
    "currentValue" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    achieved boolean DEFAULT false NOT NULL,
    "achievedAt" timestamp(3) without time zone
);


ALTER TABLE public."Goal" OWNER TO postgres;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- Name: Question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    "examPartId" text NOT NULL,
    type public."QuestionType" NOT NULL,
    prompt jsonb NOT NULL,
    options jsonb,
    "correctAnswer" jsonb NOT NULL,
    explanation text,
    difficulty public."QuestionDifficulty" DEFAULT 'B'::public."QuestionDifficulty" NOT NULL,
    "aiGenerated" boolean DEFAULT false NOT NULL,
    status public."QuestionStatus" DEFAULT 'DRAFT'::public."QuestionStatus" NOT NULL,
    "skillsTested" text[],
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Question" OWNER TO postgres;

--
-- Name: QuestionEdit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QuestionEdit" (
    id text NOT NULL,
    "questionId" text NOT NULL,
    "editorId" text NOT NULL,
    changes jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QuestionEdit" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: SkillProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SkillProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "partId" text NOT NULL,
    "attemptsCount" integer DEFAULT 0 NOT NULL,
    accuracy double precision DEFAULT 0 NOT NULL,
    "avgTimeSeconds" double precision DEFAULT 0 NOT NULL,
    "lastAttemptAt" timestamp(3) without time zone
);


ALTER TABLE public."SkillProfile" OWNER TO postgres;

--
-- Name: TimeTracker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TimeTracker" (
    id text NOT NULL,
    "attemptId" text NOT NULL,
    "remainingSeconds" integer NOT NULL,
    "lastHeartbeatAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."TimeTracker" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "passwordHash" text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: WritingPrompt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WritingPrompt" (
    id text NOT NULL,
    "examPartId" text NOT NULL,
    prompt text NOT NULL,
    "wordCountMin" integer NOT NULL,
    "wordCountMax" integer NOT NULL,
    rubric jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WritingPrompt" OWNER TO postgres;

--
-- Name: WritingSubmission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WritingSubmission" (
    id text NOT NULL,
    "attemptId" text NOT NULL,
    "writingPromptId" text NOT NULL,
    content text NOT NULL,
    "wordCount" integer DEFAULT 0 NOT NULL,
    scores jsonb,
    feedback jsonb,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WritingSubmission" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Achievement" (id, "userId", type, "unlockedAt") FROM stdin;
cms66iiby000069fn3nbld3kb	0712d5fc-a6d9-4d24-8667-ada7402934b2	FIRST_STEPS	2026-07-29 14:27:33.838
\.


--
-- Data for Name: Answer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Answer" (id, "attemptId", "questionId", "givenAnswer", "isCorrect", "timeSpentSeconds", "createdAt") FROM stdin;
cms50o98v003da3fn690qg73t	cms4wvsdt001da3fnwjsaujph	sample-q-1	"C"	f	0	2026-07-28 18:56:18.127
cms66ionp000269fnfqqfe5ys	cms66ilb0000169fnk4muwcbf	sample-q-1	"A"	t	0	2026-07-29 14:27:42.037
cms66itq6000569fn4yk7ryqk	cms66isrb000469fnu5myxjj7	sample-q-1	"A"	t	0	2026-07-29 14:27:48.606
\.


--
-- Data for Name: AudioExercise; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AudioExercise" (id, "generatedContentId", title, "audioData", "mimeType", transcript, questions, duration, "attemptCount", status, "examPartId", "createdAt", "downloadUrl") FROM stdin;
\.


--
-- Data for Name: ChallengeParticipation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChallengeParticipation" (id, "challengeId", "userId", "attemptId", score, rank, "createdAt") FROM stdin;
\.


--
-- Data for Name: DailyStreak; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DailyStreak" (id, "userId", "currentStreak", "longestStreak", "lastActiveDate") FROM stdin;
cmruyopn3000070fnwhmr7ua4	4e767bbf-77dc-4e94-9106-1da884b7399a	0	0	2026-07-21 18:02:58.383
cms4wvp3p001ca3fntre2zz4g	0712d5fc-a6d9-4d24-8667-ada7402934b2	1	1	2026-07-29 14:27:33.815
\.


--
-- Data for Name: ExamAttempt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExamAttempt" (id, "userId", "anonymousSessionId", type, status, "partId", "startedAt", "completedAt", "timeSpentSeconds", "questionCount", "correctCount", "totalScore", "cambridgeScaleScore", "createdAt") FROM stdin;
cmrp68f8g0000smfnm346cufu	\N	\N	PRACTICE	IN_PROGRESS	ruoe-part-1	2026-07-17 16:47:38.273	\N	0	8	0	\N	\N	2026-07-17 16:47:38.273
cmrp6g0wf00009mfnkrgc9img	\N	\N	PRACTICE	IN_PROGRESS	ruoe-part-5	2026-07-17 16:53:32.943	\N	0	6	0	\N	\N	2026-07-17 16:53:32.943
cmrp6g1eb00019mfnhs283ecg	\N	\N	PRACTICE	IN_PROGRESS	ruoe-part-4	2026-07-17 16:53:33.587	\N	0	6	0	\N	\N	2026-07-17 16:53:33.587
cmrp6g1z300029mfno5wr47ca	\N	\N	PRACTICE	IN_PROGRESS	ruoe-part-3	2026-07-17 16:53:34.336	\N	0	8	0	\N	\N	2026-07-17 16:53:34.336
cmrp6jch400039mfn46817x8v	\N	\N	PRACTICE	IN_PROGRESS	ruoe-part-2	2026-07-17 16:56:07.913	\N	0	8	0	\N	\N	2026-07-17 16:56:07.913
cmrp6je0u00049mfnjayjra2m	\N	\N	PRACTICE	IN_PROGRESS	ruoe-part-6	2026-07-17 16:56:09.918	\N	0	4	0	\N	\N	2026-07-17 16:56:09.918
cmrp6je9q00059mfnzwwc1wen	\N	\N	PRACTICE	IN_PROGRESS	writing-part-1	2026-07-17 16:56:10.239	\N	0	0	0	\N	\N	2026-07-17 16:56:10.239
cmrp7j8jn0000f5fns9ft3ho2	\N	\N	PRACTICE	IN_PROGRESS	ruoe-part-7	2026-07-17 17:24:02.435	\N	0	10	0	\N	\N	2026-07-17 17:24:02.435
cmrp7j95z0001f5fnjhn2qgzb	\N	\N	PRACTICE	IN_PROGRESS	writing-part-2	2026-07-17 17:24:03.24	\N	0	0	0	\N	\N	2026-07-17 17:24:03.24
cmruypor7000170fntjp1dsdh	4e767bbf-77dc-4e94-9106-1da884b7399a	\N	PRACTICE	IN_PROGRESS	ruoe-part-1	2026-07-21 18:03:43.892	\N	0	8	0	\N	\N	2026-07-21 18:03:43.892
cms4y97d2002ma3fn1kpsrhbm	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	MOCK	IN_PROGRESS	\N	2026-07-28 17:48:36.614	\N	0	50	0	\N	\N	2026-07-28 17:48:36.614
cms50orn5003ma3fnzgyg8w7z	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	MOCK	IN_PROGRESS	\N	2026-07-28 18:56:41.969	\N	0	50	0	\N	\N	2026-07-28 18:56:41.969
cms52h57c003wa3fnz0wg9l93	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	PRACTICE	IN_PROGRESS	ruoe-part-2	2026-07-28 19:46:45.528	\N	0	8	0	\N	\N	2026-07-28 19:46:45.528
cms4wvsdt001da3fnwjsaujph	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	PRACTICE	COMPLETED	ruoe-part-1	2026-07-28 17:10:11.057	2026-07-29 14:27:33.804	76642	8	0	\N	\N	2026-07-28 17:10:11.057
cms66ilb0000169fnk4muwcbf	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	PRACTICE	COMPLETED	ruoe-part-1	2026-07-29 14:27:37.692	2026-07-29 14:27:44.366	6	8	1	\N	\N	2026-07-29 14:27:37.692
cms66isrb000469fnu5myxjj7	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	PRACTICE	COMPLETED	ruoe-part-1	2026-07-29 14:27:47.351	2026-07-29 14:27:52.43	5	8	1	\N	\N	2026-07-29 14:27:47.351
cms66j4k9000669fnsvyaa6za	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	PRACTICE	IN_PROGRESS	writing-part-1	2026-07-29 14:28:02.649	\N	0	0	0	\N	\N	2026-07-29 14:28:02.649
cmskqzvte0000rdfnfo43mhj8	0712d5fc-a6d9-4d24-8667-ada7402934b2	\N	PRACTICE	IN_PROGRESS	ruoe-part-1	2026-08-08 19:09:43.251	\N	0	8	0	\N	\N	2026-08-08 19:09:43.251
\.


--
-- Data for Name: ExamPart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExamPart" (id, label, paper, "partNumber", description, "timeMinutes", "questionCount", "sortOrder") FROM stdin;
ruoe-part-1	R&UoE Part 1	R&UoE	1	Multiple-choice cloze	8	8	1
ruoe-part-2	R&UoE Part 2	R&UoE	2	Open cloze	8	8	2
ruoe-part-3	R&UoE Part 3	R&UoE	3	Word formation	8	8	3
ruoe-part-4	R&UoE Part 4	R&UoE	4	Key word transformation	10	6	4
ruoe-part-5	R&UoE Part 5	R&UoE	5	Gapped text	12	6	5
ruoe-part-6	R&UoE Part 6	R&UoE	6	Multiple matching (gapped paragraphs)	10	4	6
ruoe-part-7	R&UoE Part 7	R&UoE	7	Multiple matching (short texts)	14	10	7
writing-part-1	Writing Part 1	Writing	1	Essay	40	1	8
writing-part-2	Writing Part 2	Writing	2	Article / Email / Report / Review	40	1	9
\.


--
-- Data for Name: Flashcard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Flashcard" (id, "deckId", front, back, hint, "easeFactor", "interval", repetitions, "nextReviewAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: FlashcardDeck; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FlashcardDeck" (id, "generatedContentId", title, description, "examPartId", "createdById", "cardCount", "createdAt") FROM stdin;
\.


--
-- Data for Name: GeneratedContent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GeneratedContent" (id, "sourceType", "sourceData", "contentType", "rawResponse", status, "reviewedAt", "reviewedById", "errorMessage", "createdAt", "createdById", "artifactId", elapsed, "notebookId") FROM stdin;
\.


--
-- Data for Name: Goal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Goal" (id, "userId", type, "targetValue", "currentValue", "startDate", "endDate", achieved, "achievedAt") FROM stdin;
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, email, token, "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Question" (id, "examPartId", type, prompt, options, "correctAnswer", explanation, difficulty, "aiGenerated", status, "skillsTested", version, "createdAt", "updatedAt") FROM stdin;
sample-q-1	ruoe-part-1	MC	{"hint": "Think about keeping something in its original condition.", "text": "The archaeologist was amazed by the _____ of the ancient artifacts.\\n\\nA) preservation  B) prevention  C) preparation  D) preference"}	["preservation", "prevention", "preparation", "preference"]	"A"	Preservation means keeping something in its original state.	B	t	ACTIVE	{vocabulary,collocations}	1	2026-07-17 17:33:27.837	2026-07-17 17:33:27.837
sample-q-7	ruoe-part-3	WF	{"hint": "Add a suffix to form a noun.", "text": "The _____ of the new policy was met with widespread approval.", "stemWord": "INTRODUCE"}	\N	["introduction"]	The noun form of 'introduce' is 'introduction'.	B	t	ACTIVE	{"word formation",vocabulary}	1	2026-07-17 17:33:27.848	2026-07-17 17:33:27.848
sample-q-10	ruoe-part-4	KT	{"text": "Rewrite using the word in bold.", "leadIn": "\\"I'm sorry I'm late,\\" she said. → She _____ late.\\n\\nComplete the second sentence.", "keyword": "APOLOGISED"}	\N	{"keyword": "APOLOGISED", "acceptable": ["apologised for being", "apologized for being"]}	Requires 'apologised for being' to maintain meaning.	B	t	ACTIVE	{grammar,"key word transformation"}	1	2026-07-17 17:33:27.854	2026-07-17 17:33:27.854
sample-q-12	ruoe-part-5	GT	{"hint": "Chronological order.", "text": "Put sentences in order.", "items": [{"id": "a", "text": "This led to significant improvements."}, {"id": "b", "text": "The hospital implemented a new electronic records system."}, {"id": "c", "text": "Doctors could now access patient histories instantly."}, {"id": "d", "text": "The transition took approximately six months."}]}	\N	["b", "d", "c", "a"]	The logical sequence: implementation → transition → access → outcome.	C	t	ACTIVE	{cohesion,"reading comprehension"}	1	2026-07-17 17:33:27.859	2026-07-17 17:33:27.859
sample-q-14	ruoe-part-6	MM	{"text": "Match each paragraph to the correct heading.", "items": [{"id": "p1", "text": "Studies show regular exercise improves cognitive function in adults over 65."}, {"id": "p2", "text": "Participants who exercised three times a week scored 20% higher."}], "options": [{"id": "A", "label": "Research findings"}, {"id": "B", "label": "Health recommendations"}]}	\N	["A", "B"]	Paragraph 1 presents study claims (A); Paragraph 2 provides specific findings (B).	B	t	ACTIVE	{"reading comprehension",matching}	1	2026-07-17 17:33:27.864	2026-07-17 17:33:27.864
sample-q-16	ruoe-part-7	MM	{"hint": "Read each statement.", "text": "Which person says each statement?", "items": [{"id": "s1", "text": "\\"I prefer studying in the morning.\\""}, {"id": "s2", "text": "\\"Background music helps me concentrate.\\""}, {"id": "s3", "text": "\\"Short breaks every hour improve my focus.\\""}], "options": [{"id": "A", "label": "Maria, 24"}, {"id": "B", "label": "James, 31"}]}	\N	["A", "B", "B"]	Morning (A), background music (B), short breaks (B).	B	t	ACTIVE	{"reading comprehension",matching}	1	2026-07-17 17:33:27.869	2026-07-17 17:33:27.869
sample-q-4	ruoe-part-2	CLOZE	{"hint": "Think about a preposition that collocates with 'working'.", "text": "The research team has been working _____ the project for over two years now."}	\N	["on"]	'Working on' is the correct phrasal verb.	B	t	ACTIVE	{grammar,prepositions}	1	2026-07-17 17:33:27.842	2026-07-28 17:01:40.824
cms4wtnax0002a3fnv78qo3w4	ruoe-part-2	CLOZE	"Read the text and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (0) FOR thousands of years, but it did not always look (1) ___ it does today. The ancient Maya and Aztec civilisations were among the first (2) ___ discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet solid bars we know now. This drink was often mixed with spices and was considered so valuable that cacao beans were (4) ___ used as a form of money.\\n\\nIt was not (5) ___ the 16th century that chocolate was brought to Europe by Spanish explorers. (6) ___ first, it remained a drink enjoyed mainly by the wealthy, since sugar and cacao were both expensive. (7) ___ manufacturing methods improved over the following centuries, chocolate became cheaper to produce, (8) ___ meant it could finally be enjoyed by ordinary people too."	\N	["like", "to", "than", "even", "until", "At", "As", "which"]	Each gap tests grammatical words (prepositions, conjunctions, relative pronouns) needed to complete common structures: (1) 'look like' comparison; (2) 'first to discover' infinitive after ordinal; (3) 'rather than' contrast; (4) 'even used' emphasising surprise; (5) 'not until' time expression; (6) 'At first' fixed phrase; (7) 'As' meaning 'because/while'; (8) 'which' non-defining relative clause referring back to the whole previous clause.	B	t	ACTIVE	{grammar,"open cloze",prepositions,"linking words","relative pronouns"}	1	2026-07-28 17:08:31.161	2026-07-28 17:09:39.605
cms4wtnb90003a3fnm53uovwu	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed (0) for thousands of years, but it wasn't always the sweet treat we know today. It (1) ______ originated in Central America, where the Aztecs and Mayans used cacao beans (2) ______ make a bitter drink. This drink was often mixed (3) ______ spices and was believed to have medicinal properties.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added (4) ______ make it sweeter, and it quickly became popular among the wealthy. (5) ______ this time, chocolate remained a drink rather (6) ______ something you could eat.\\n\\nIt was not (7) ______ the nineteenth century that solid chocolate bars were first produced, thanks to new manufacturing techniques. Since (8) ______, chocolate has become one of the most popular foods in the world, loved by people of all ages."	\N	["originally", "to", "with", "to", "During", "than", "until", "then"]	Each gap tests grammatical structures common at B2 level: (1) 'originally' modifies the verb showing origin; (2) 'to' completes infinitive of purpose; (3) 'with' collocates with 'mixed'; (4) 'to' forms infinitive of purpose; (5) 'During' introduces a time period; (6) 'than' completes the comparative 'rather than'; (7) 'until' completes the structure 'not until'; (8) 'then' refers back to the time already mentioned ('since then').	B	t	ACTIVE	{grammar,prepositions,"linking words","sentence structure","reading comprehension"}	1	2026-07-28 17:08:31.173	2026-07-28 17:09:39.605
cms4wtncf0006a3fnhe805oka	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (0) for thousands of years, but it (1) ______ not always been the sweet treat we know today. The cacao tree originally grew (2) ______ Central and South America, where ancient civilisations used its beans (3) ______ make a bitter drink. This drink was often mixed with spices and (4) ______ believed to have medicinal properties.\\n\\nIt was not (5) ______ the 16th century that chocolate was brought to Europe by Spanish explorers. At first, (6) ______ was only the wealthy who could afford to drink it, since cacao beans were extremely expensive. Sugar was later added to make it sweeter, and (7) ______ the 19th century, the first solid chocolate bars were produced.\\n\\nToday, chocolate is enjoyed all (8) ______ the world in countless forms, from simple bars to elaborate desserts."	\N	["has", "in", "to", "was", "until", "it", "by", "over"]	1: 'has' completes present perfect 'has not always been'. 2: 'in' shows location. 3: 'to' follows 'used the beans to make'. 4: 'was' forms passive 'was believed'. 5: 'until' with 'not... until' structure. 6: 'it' is the impersonal subject in 'it was only the wealthy who'. 7: 'by' means 'by the time of'. 8: 'over' collocates with 'all over the world'.	B	t	REJECTED	{grammar,prepositions,"verb tenses",cohesion}	1	2026-07-28 17:08:31.215	2026-07-28 17:09:19.399
cms50ejwr002qa3fnwrqykqb3	ruoe-part-1	MC	{"gap": 1, "text": "Many people enjoy spending their weekends in the countryside to ______ away from the stress of modern city life."}	["A) get", "B) run", "C) make", "D) put"]	"A) get"	'Get away' is a standard phrasal verb meaning to escape or go on holiday to relax.	A	t	DRAFT	{Vocabulary,"Phrasal Verbs"}	1	2026-07-28 18:48:45.387	2026-07-28 18:48:45.387
cms50ejxg002ra3fn4bat0p04	ruoe-part-1	MC	"Read the text below and choose the correct word for the gap.\\n\\nWhen learning a foreign language, students should try to (1) ______ attention to pronunciation from the very beginning."	["A) pay", "B) give", "C) make", "D) put"]	"A) pay"	'Pay attention' is a fixed collocation. 'Give', 'make', and 'put' do not collocate with 'attention' in this context.	A	t	DRAFT	{Vocabulary,Collocations}	1	2026-07-28 18:48:45.412	2026-07-28 18:48:45.412
cms50ejy0002sa3fnua51264c	ruoe-part-1	MC	"Read the sentence below and choose the correct word to fill the gap.\\n\\nAfter thinking about it for days, Mark finally decided to _______ up tennis to get more exercise."	["A) take", "B) make", "C) set", "D) put"]	"A) take"	'Take up' is the correct phrasal verb meaning to start a new hobby or activity.	A	t	DRAFT	{"Phrasal verbs",Vocabulary}	1	2026-07-28 18:48:45.432	2026-07-28 18:48:45.432
cms50ejyc002ta3fnsksjc5r3	ruoe-part-1	MC	"Read the text below and decide which answer (A, B, C, or D) best fits each gap.\\n\\nWhen Lucy started her new job at the design agency, she was determined to (1) ______ a good impression on her colleagues during her first week."	["A) do", "B) make", "C) set", "D) put"]	"B) make"	'Make an impression' is a fixed verb-noun collocation in English. The verbs 'do', 'set', and 'put' do not collocate with 'impression' in this context.	A	t	DRAFT	{Collocations,Vocabulary}	1	2026-07-28 18:48:45.444	2026-07-28 18:48:45.444
cms50ejyn002ua3fnwu51maud	ruoe-part-1	MC	"Read the text below and choose the correct word for the gap.\\n\\nAfter months of planning, the team finally managed to ______ their goal of raising $10,000 for the local charity."	["A) achieve", "B) earn", "C) succeed", "D) arrive"]	"A) achieve"	'Achieve' collocates directly with 'goal'. 'Succeed' requires 'in achieving', 'earn' applies to money/respect, 'arrive' requires 'at'.	A	t	DRAFT	{Collocation,Vocabulary}	1	2026-07-28 18:48:45.455	2026-07-28 18:48:45.455
cms50ejyw002va3fnmjry2hvz	ruoe-part-1	MC	{"text": "When Lucy arrived at the hotel, she decided to (1) ______ her bags in the room before going out to explore the city.", "title": "A trip to the city", "gapNumber": 1}	["A) leave", "B) abandon", "C) depart", "D) forget"]	"A) leave"	'Leave' means to place something somewhere and leave it there temporarily. 'Abandon' implies leaving permanently, 'depart' is intransitive (cannot take an object directly like 'bags'), and 'forget' implies accidental failure to bring something.	A	t	DRAFT	{Vocabulary,"Verb Choice"}	1	2026-07-28 18:48:45.464	2026-07-28 18:48:45.464
cms50ejz7002wa3fng95yofoa	ruoe-part-1	MC	"Read the text below and choose the correct option for the gap.\\n\\nAfter months of preparation, Tom finally decided to _____ part in the annual city marathon."	["take", "make", "do", "have"]	"take"	'Take part in' is a fixed collocation meaning to participate.	A	t	DRAFT	{Vocabulary,Collocations}	1	2026-07-28 18:48:45.475	2026-07-28 18:48:45.475
cms50ejzg002xa3fnhr9mc2v6	ruoe-part-1	MC	"Many young people dream of opening their own shop, but few understand how much work it takes to (1) ______ a successful business."	["A) run", "B) lead", "C) carry", "D) govern"]	"A) run"	'Run' correctly collocates with 'a business' to mean managing or controlling an organization.	A	t	DRAFT	{Vocabulary,Collocations}	1	2026-07-28 18:48:45.484	2026-07-28 18:48:45.484
cms50ejzo002ya3fnn8xtpdcc	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMY FIRST JOB\\n\\nWhen I was eighteen, I got my first (1) ___ job in a small coffee shop near my house. I was really nervous on my first day, but the manager was very friendly and helped me feel (2) ___ home."	["A) paid", "B) earned", "C) worked", "D) salaried"]	"A) paid"	'Paid job' is the correct collocation meaning employment you receive money for. 'Earned' and 'worked' are verbs, not adjectives, and don't fit grammatically before 'job'. 'Salaried' collocates with 'position' or 'employee', not typically with 'job' in this context.	A	t	DRAFT	{vocabulary,collocation,"word choice in context"}	1	2026-07-28 18:48:45.492	2026-07-28 18:48:45.492
cms50ejzw002za3fnnbu3x0ip	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMY FIRST JOB\\n\\nWhen I was eighteen, I got my first (1) ___ job in a small coffee shop near my house. I was really nervous on my first day because I had never worked before."	["A. paid", "B. earned", "C. gained", "D. rewarded"]	"A. paid"	'Paid job' is the correct collocation meaning a job you receive money for. 'Earned', 'gained', and 'rewarded' don't collocate naturally with 'job' in this context.	A	t	DRAFT	{vocabulary,collocation,"reading comprehension"}	1	2026-07-28 18:48:45.5	2026-07-28 18:48:45.5
cms50ek040030a3fn5a5tykg1	ruoe-part-1	MC	"For questions, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMoving to a New City\\n\\nWhen Sarah moved to Manchester for her new job, she was worried about making friends. She decided to (1) ___ a local sports club to meet new people, and it turned out to be a great idea."	["A) join", "B) enter", "C) attend", "D) register"]	"A) join"	'Join' is the correct collocation with 'a club' meaning to become a member. 'Enter' is used for competitions or buildings, 'attend' is used for events/meetings, and 'register' requires a preposition like 'for'.	A	t	DRAFT	{"vocabulary collocations","word choice in context"}	1	2026-07-28 18:48:45.508	2026-07-28 18:48:45.508
cms50ek0g0031a3fnppn53tl1	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nLearning a New Skill\\n\\nMany people ______ the idea of learning a musical instrument as an adult, believing it is too late to start. However, research shows that adults can learn just as effectively as children, especially when they practise regularly.\\n\\n1"	["reject", "refuse", "deny", "decline"]	"reject"	'Reject an idea' is the correct collocation meaning to dismiss or not accept a belief. 'Refuse' and 'decline' are used with actions/offers (e.g. refuse to do something), not ideas. 'Deny' means to state something is not true, which doesn't fit the context of dismissing a belief.	A	t	DRAFT	{"lexical collocation","vocabulary in context","word choice/near-synonyms"}	1	2026-07-28 18:48:45.52	2026-07-28 18:48:45.52
cms4wtnbm0004a3fn5i43r7zk	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people for (1) ___ than two thousand years, although it looked very different from the chocolate we eat today. The ancient Maya and Aztec civilisations were among the first (2) ___ discover the cacao bean, which they used to make a bitter drink rather (3) ___ a sweet treat. This drink was often mixed with spices and was believed (4) ___ have special properties, so it was used in religious ceremonies.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it more palatable. It was not (5) ___ the nineteenth century that solid chocolate bars were first produced, thanks to new methods of processing cacao. (6) ___ that time, chocolate had only been available as a drink.\\n\\nToday, chocolate is enjoyed all over the world, and (7) ___ every country has its own particular way of preparing it. Despite (8) ___ popularity, however, few people realise just how long a journey chocolate has been on to reach our shelves."	\N	["more", "to", "than", "to", "until", "Before", "almost", "its"]	1: 'more than' = comparative quantity expression. 2: 'to discover' follows 'the first' + infinitive structure. 3: 'rather than' is a fixed phrase for contrast. 4: 'believed to have' = passive reporting verb + infinitive. 5: 'not until' = fixed time expression meaning something happened only at that point. 6: 'Before that time' links back to the previously mentioned nineteenth century. 7: 'almost every' = quantifier before singular noun. 8: 'its popularity' = possessive determiner referring back to chocolate.	B	t	REJECTED	{"grammar in context","fixed phrases and collocations","verb patterns","determiners and quantifiers"}	1	2026-07-28 17:08:31.186	2026-07-28 17:09:19.399
cms4wtnc10005a3fny0difvcs	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people for (0) OVER three thousand years, but it wasn't always the sweet treat we know today. The ancient Maya and Aztec civilisations were among the first (1) ___ discover the cacao bean, which they used to make a bitter drink. This drink was often (2) ___ important role in religious ceremonies and was even used (3) ___ a form of currency.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make (4) ___ more palatable to European tastes. (5) ___ this point onwards, chocolate slowly became popular among the wealthy classes, who could afford (6) ___ expensive imported ingredient.\\n\\nIt wasn't (7) ___ the nineteenth century that chocolate became available in solid bar form, thanks to new manufacturing techniques. Since then, chocolate (8) ___ become one of the most popular foods in the world, loved by people of all ages."	\N	["to", "an", "as", "it", "From", "such", "until", "has"]	Each gap requires a single word testing grammar: (1) 'to' completes the infinitive 'first to discover'; (2) 'an' precedes the vowel sound in 'important'; (3) 'as' follows 'used' to mean 'in the capacity of'; (4) 'it' refers back to the drink/cacao; (5) 'From' pairs with 'onwards' to show a starting point; (6) 'such' precedes 'an expensive imported ingredient'; (7) 'until' pairs with 'wasn't...that' in the cleft structure 'It wasn't until...that'; (8) 'has' forms the present perfect 'has become'.	B	t	REJECTED	{"grammatical accuracy",prepositions,"linking words","verb forms","reading comprehension"}	1	2026-07-28 17:08:31.201	2026-07-28 17:09:19.399
cms4wtncr0007a3fnl3jbt4qh	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate is (0) ONE of the most popular foods in the world today, but it has a long and surprising history. It was first used by ancient civilisations in Central America more than 3,000 years (1) ___ . At that time, chocolate was not eaten (2) ___ a solid food, as it is now, but was drunk as a bitter liquid, often mixed with spices.\\n\\nWhen Spanish explorers brought chocolate back to Europe in the sixteenth century, sugar was added to make it sweeter, and it (3) ___ soon become a fashionable drink among the wealthy. (4) ___ several hundred years, chocolate remained too expensive for ordinary people to buy, and it was not (5) ___ the nineteenth century that the first solid chocolate bars were produced.\\n\\nToday, chocolate is enjoyed by people (6) ___ all ages and backgrounds, and it is used in thousands of different products, from cakes to drinks. Despite (7) ___ popularity, however, few people are aware of just (8) ___ far chocolate's history really goes back."	\N	["ago", "as", "did", "For", "until", "of", "its", "how"]	1: 'ago' follows a time period to show past distance. 2: 'as' introduces the role/form something takes ('eaten as a solid food'). 3: 'did' completes the emphatic structure 'chocolate did soon become'. 4: 'For' + time period at the start of a sentence shows duration. 5: 'not until' is a fixed phrase meaning something happened only at a later time. 6: 'of' follows 'people' to show possession/description ('people of all ages'). 7: 'its' is the possessive pronoun referring back to chocolate. 8: 'how' completes the indirect question 'how far chocolate's history goes back'.	B	t	REJECTED	{grammar,prepositions,"fixed phrases","sentence structure","reading comprehension"}	1	2026-07-28 17:08:31.227	2026-07-28 17:09:19.399
cms4wtnd10008a3fnur64n0x0	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (1) ___ been enjoyed by people for thousands of years, but it has not always looked (2) ___ tastes the way it does today. The ancient Maya and Aztec peoples were among the first (3) ___ discover the cacao bean, which they used to make a bitter drink rather (4) ___ the sweet solid bars we know now. This drink was often mixed with spices and was considered (5) ___ valuable that cacao beans were even used as a form of money.\\n\\nWhen chocolate was brought to Europe in the sixteenth century, sugar was added to make it more pleasant, (6) ___ it remained a drink for wealthy people for a long time. It was not (7) ___ the nineteenth century that inventors found a way to make solid chocolate bars, which meant that chocolate could finally be produced (8) ___ a much larger scale and enjoyed by ordinary people."	\N	["has", "and", "to", "than", "so", "but", "until", "on"]	1. has (present perfect with 'been enjoyed'); 2. and (linking 'looked' and 'tastes'); 3. to (infinitive after 'the first'); 4. than (after 'rather'); 5. so (so + adjective + that); 6. but (contrast between sugar making it pleasant and it staying exclusive); 7. until (fixed phrase 'it was not until... that'); 8. on (fixed phrase 'on a large scale').	B	t	REJECTED	{grammar,"open cloze",collocations,"fixed phrases",cohesion}	1	2026-07-28 17:08:31.238	2026-07-28 17:09:19.399
cms4wtndc0009a3fnqigysped	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS been enjoyed by people for thousands of years, but the way it is eaten today is very different (1) ___ how it was consumed in the past. The cacao tree, (2) ___ beans are used to make chocolate, originally grew in Central and South America. Ancient civilisations such as the Maya and Aztecs used cacao beans (3) ___ make a bitter drink, which was often mixed with spices.\\n\\nIt was not (4) ___ the 16th century that chocolate was brought to Europe by Spanish explorers. At first, (5) ___ was extremely expensive and could only be afforded by wealthy people. It took (6) ___ another two hundred years before sugar was added and chocolate became sweeter, making it more popular among ordinary people.\\n\\nThe solid chocolate bar we know today did (7) ___ exist until the 19th century, when new production methods were developed. Since (8) ___, chocolate has become one of the most popular foods in the world, produced in countless forms and flavours."	\N	["to", "whose", "to", "until", "it", "up", "not", "then"]	Each gap requires a specific grammatical word: (1) 'different to/from' comparative structure; (2) 'whose' relative pronoun showing possession; (3) 'to' infinitive of purpose; (4) 'not until' time expression; (5) 'it' pronoun referring to chocolate; (6) 'up' in phrase 'took up another two hundred years' (time expression); (7) 'not' with 'did' for negative emphasis; (8) 'then' in phrase 'since then' referring back to the 19th century.	B	t	REJECTED	{"grammar in context",prepositions,"relative pronouns","fixed phrases","reading comprehension"}	1	2026-07-28 17:08:31.248	2026-07-28 17:09:19.399
cms4wtndp000aa3fni4444p5y	ruoe-part-2	CLOZE	"Read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (1) ___ thousands of years, but it has not always been the sweet treat we know today. The cacao plant, (2) ___ chocolate is made, was first grown in Central America. The ancient Maya and Aztec peoples used cacao beans to make a bitter drink, which they believed (3) ___ special powers.\\n\\nWhen Spanish explorers arrived in the Americas, they took cacao beans back to Europe. At first, (4) ___ was only the wealthy who could afford this expensive new drink. It (5) ___ until sugar was added that chocolate became popular (6) ___ a much wider audience.\\n\\nDuring the nineteenth century, inventors found ways (7) ___ turn liquid chocolate into solid bars. This meant that chocolate could finally be eaten rather (8) ___ just drunk, leading to the many chocolate products we enjoy nowadays."	\N	["for", "from which", "had", "it", "was not/wasn't", "with/among/to", "to", "than"]	Each answer completes a grammatical structure: (1) 'for' with duration; (2) 'from which' as relative clause referring to the plant's origin; (3) 'had' for reported past belief; (4) 'it' in cleft structure 'it was only...who'; (5) 'was not/wasn't' with 'It was not until X that Y' construction; (6) 'with/among/to' collocating with 'popular'; (7) 'to' after 'ways' + infinitive; (8) 'than' after comparative 'rather'.	B	t	REJECTED	{grammar,"open cloze",prepositions,"linking words","sentence structure"}	1	2026-07-28 17:08:31.261	2026-07-28 17:09:19.399
cms4wtne2000ba3fndact0itf	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (0) FOR thousands of years, but it hasn't always been the sweet treat we know today. The cacao tree, (1) ___ which chocolate is made, originally grew in Central and South America. Ancient civilisations such as the Maya and Aztecs were among the first (2) ___ discover how to use cacao beans, which they ground (3) ___ into a paste and mixed with water to make a bitter drink.\\n\\nIt was not (4) ___ the 16th century that chocolate was brought to Europe by Spanish explorers. At first, (5) ___ few people outside Spain knew about this exotic new drink. Gradually, however, it became popular among the wealthy, (6) ___ could afford to add sugar and spices to improve the taste.\\n\\nBy the 19th century, inventors had found (7) ___ to turn chocolate into a solid bar, making it far more accessible to ordinary people. Since (8) ___, chocolate has grown into one of the most popular foods in the world."	\N	["from", "to", "up", "until", "a", "who", "how", "then"]	Each gap requires a single grammatical word: (1) 'from' completes 'from which' (relative clause referring to the tree); (2) 'to' follows 'were among the first' + infinitive; (3) 'up' completes the phrasal verb 'ground up'; (4) 'until' fits the structure 'It was not until...that'; (5) 'a' precedes 'few people' (quantifier); (6) 'who' is the relative pronoun referring to 'the wealthy'; (7) 'how' completes 'found how to' (a way); (8) 'then' completes the time phrase 'Since then'.	B	t	REJECTED	{grammar,prepositions,"relative clauses","phrasal verbs","reading comprehension"}	1	2026-07-28 17:08:31.274	2026-07-28 17:09:19.399
cms4wtneg000ca3fn9ehy6l55	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (0) FOR thousands of years, but it did not always look (1) ___ it does today. The ancient Maya and Aztec peoples were among the (2) ___ to discover cacao beans, which they used to make a bitter drink rather (3) ___ the sweet bars we know now. This drink was often mixed with spices and (4) ___ served cold.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it (5) ___ pleasant to the European taste. (6) ___ this point onwards, chocolate slowly became more popular among the wealthy, (7) ___ it remained an expensive luxury for a very long time.\\n\\nIt was not until the nineteenth century, when new machinery was invented, (8) ___ solid chocolate bars became affordable for ordinary people to buy."	\N	["like", "first", "than", "was", "more", "From", "although", "that"]	Each answer completes a common grammatical structure: (1) 'look like' (preposition after verb); (2) 'the first to discover' (superlative + infinitive); (3) 'rather than' (fixed comparative phrase); (4) 'was served' (passive voice); (5) 'more pleasant' (comparative adjective); (6) 'From this point onwards' (fixed time phrase); (7) 'although' (contrast linker); (8) 'It was not until... that' (cleft sentence structure).	B	t	REJECTED	{grammar,collocations,"cohesive devices","sentence structure"}	1	2026-07-28 17:08:31.288	2026-07-28 17:09:19.399
cms4wtner000da3fnc7bmunel	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (0) FOR thousands of years, but it has not always (1) ___ the sweet treat we know today. The ancient Maya and Aztec peoples were among the (2) ___ to cultivate cacao trees, and they used the beans to make a bitter drink rather (3) ___ a solid bar. This drink was often mixed with spices and was believed (4) ___ have special powers.\\n\\nWhen chocolate was brought to Europe in the sixteenth century, sugar was added (5) ___ make it more appealing to European tastes. However, it remained a luxury (6) ___ only the wealthy could afford for a long time. It was not (7) ___ the nineteenth century that inventions in manufacturing made chocolate cheaper to produce, allowing it to (8) ___ available to ordinary people.\\n\\nToday, chocolate is enjoyed all over the world in countless different forms."	\N	["been", "first", "than", "to", "to", "which", "until", "become"]	1: 'have not always been' - present perfect with 'been' needed after 'has'. 2: 'the first to cultivate' - fixed expression. 3: 'rather than' - fixed comparative structure. 4: 'believed to have' - passive reporting verb + infinitive. 5: 'added to make' - infinitive of purpose. 6: 'a luxury which' - relative pronoun for object 'luxury'. 7: 'not until the nineteenth century' - fixed time expression. 8: 'allowing it to become' - infinitive after 'allow'.	B	t	REJECTED	{grammar,"open cloze","fixed expressions",prepositions,"relative pronouns","verb patterns"}	1	2026-07-28 17:08:31.299	2026-07-28 17:09:19.399
cms4wtnf1000ea3fnu1xcx1eq	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS been enjoyed by people for thousands of years, but it hasn't always been the sweet treat we know today. The ancient Maya and Aztec civilisations were among the first (1) ___ discover the cacao bean, which they used to make a bitter drink rather (2) ___ a solid bar. This drink was often mixed (3) ___ spices and was considered so valuable that cacao beans were even used (4) ___ a form of currency.\\n\\nIt wasn't (5) ___ chocolate arrived in Europe in the sixteenth century that sugar was added, making it sweeter and more popular. (6) ___ time, new techniques were developed, allowing chocolate to be turned into a solid form. By the nineteenth century, chocolate bars (7) ___ being produced on a large scale, and companies started competing with (8) ___ other to create new recipes and flavours that we still enjoy today."	\N	["to", "than", "with", "as", "until", "Over", "were", "each"]	1: 'first to discover' - infinitive after ordinal/superlative. 2: 'rather than' - fixed comparative phrase. 3: 'mixed with' - collocation. 4: 'used as' - fixed phrase meaning 'in the role of'. 5: 'wasn't until' - fixed structure for emphasising time. 6: 'Over time' - fixed phrase meaning 'gradually'. 7: 'were being produced' - past continuous passive to match narrative tense. 8: 'each other' - reciprocal pronoun after 'with'.	B	t	REJECTED	{grammar,collocations,"fixed phrases",prepositions}	1	2026-07-28 17:08:31.309	2026-07-28 17:09:19.399
cms50ek0q0032a3fnu64awku7	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nLEARNING A NEW LANGUAGE\\n\\nMany people (1) ___ that learning a new language as an adult is much harder than learning one as a child, but recent studies suggest this isn't necessarily true.\\n\\n1."	["A. believe", "B. think", "C. suppose", "D. imagine"]	"A. believe"	'Believe' collocates naturally with an opinion or claim about something being true, especially in the pattern 'many people believe that...'. 'Think' would need a slightly different structure to sound as natural here, while 'suppose' and 'imagine' suggest uncertainty or speculation rather than a commonly held view, which doesn't fit the context of a widely held belief being challenged by studies.	A	t	DRAFT	{"vocabulary collocation","lexical choice in context","reading comprehension"}	1	2026-07-28 18:48:45.53	2026-07-28 18:48:45.53
cms4wtnfa000fa3fnuztr45s7	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) ___HAS___ been enjoyed by people for thousands of years, but it looked very different in the past (1) ___ it does today. The ancient Maya and Aztec civilisations were among the first (2) ___ discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet solid bars we know now. This drink was often mixed with spices and was believed (4) ___ have special medicinal properties.\\n\\nWhen chocolate was brought (5) ___ Europe in the sixteenth century, sugar was added to make it more appealing to European tastes. (6) ___ that time onwards, chocolate became increasingly popular among the wealthy, who could afford (7) ___ expensive imported product. It was not (8) ___ the Industrial Revolution that methods were developed to produce solid chocolate bars cheaply, making chocolate available to everyone."	\N	["HAS", "THAN", "TO", "THAN", "TO", "TO", "FROM", "SUCH"]	1. HAS - present perfect for action continuing from past to present. 2. THAN - comparative structure 'different...than/from'. 3. TO - 'the first to discover' infinitive of purpose. 4. THAN - 'rather than' contrast. 5. TO - 'believed to have' passive reporting structure. 6. TO - 'brought to Europe' preposition of direction. 7. FROM - 'From that time onwards' fixed phrase. 8. SUCH - 'such an expensive product' intensifier before adjective+noun. 9. UNTIL/TILL - 'It was not until X that Y' cleft structure.	B	t	REJECTED	{grammar,prepositions,"fixed phrases","cohesive devices","sentence structure"}	1	2026-07-28 17:08:31.318	2026-07-28 17:09:19.399
cms4wtnfm000ga3fnmnxeibjd	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has (0) BEEN enjoyed by people for thousands of years, but it hasn't always looked (1) ___ it does today. The ancient Maya and Aztec civilisations were among the (2) ___ to discover cacao beans, which they used to make a bitter drink rather (3) ___ the sweet bars we know now. This drink was often mixed with spices and was believed to (4) ___ special powers, so it was reserved mainly for rulers and warriors.\\n\\nWhen Spanish explorers brought cacao back to Europe in the 16th century, sugar was added to make it more palatable. It took (5) ___ another 300 years before someone invented a way (6) ___ turn the liquid into a solid bar. By the 19th century, chocolate had (7) ___ one of the most popular treats in the world, and it has remained (8) ___ ever since."	\N	["like", "first", "than", "have", "almost", "to", "become", "so"]	Each gap tests grammatical structures typical of B2: (1) 'like' after verb 'looked' for comparison; (2) 'first' with superlative 'the'; (3) 'than' after comparative 'rather'; (4) 'have' fixed phrase 'believed to have'; (5) 'almost' + number expression; (6) 'to' infinitive after 'a way'; (7) 'become' present perfect fixed collocation; (8) 'so' referring back to the adjective/state mentioned.	B	t	REJECTED	{"grammatical accuracy",collocations,"sentence structure","vocabulary in context"}	1	2026-07-28 17:08:31.33	2026-07-28 17:09:19.399
cms4wtnfx000ha3fnch75an9r	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (1) ___ thousands of years, but it did not always look (2) ___ it does today. The Aztecs were among the (3) ___ to make a drink from cacao beans, although it was bitter and mixed with spices rather (4) ___ sugar. It was not (5) ___ the Spanish brought cacao back to Europe that sugar was added, making it sweeter and more popular.\\n\\nBy the 19th century, inventors had found ways (6) ___ turn the drink into a solid bar. Since (7) ___, chocolate has become one of the most loved treats in the world, and today it (8) ___ be found in almost every country, made in countless different forms and flavours."	\N	["for", "as", "first", "than", "until", "to", "then", "can"]	1. 'for' + duration; 2. 'as' comparing manner ('look as it does'); 3. 'the first' — ordinal after 'among'; 4. 'rather than' fixed phrase; 5. 'not until' fixed structure; 6. 'ways to turn' — infinitive after noun; 7. 'since then' fixed phrase; 8. 'can be found' — modal + passive.	B	t	REJECTED	{grammar,prepositions,"fixed phrases","sentence structure","vocabulary in context"}	1	2026-07-28 17:08:31.341	2026-07-28 17:09:19.399
cms4wtnge000ia3fnypuydgs7	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS been enjoyed by people for thousands of years, but it has not always been the sweet treat we know today. The ancient Maya and Aztec civilisations were among the first (1) ______ discover the cacao bean, which they used to make a bitter drink rather (2) ______ a solid bar. This drink was often mixed with spices and was considered (3) ______ valuable that cacao beans were even used as a form of currency.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it sweeter, and (4) ______ soon became a fashionable drink among the wealthy. It was not (5) ______ the nineteenth century that inventors found a way to produce solid chocolate bars, making the treat available to a (6) ______ wider audience.\\n\\nToday, chocolate is produced in enormous quantities all over the world, and (7) ______ of the countries that grow the most cacao are located near the equator, where the climate is suitable. Despite (8) ______ popularity, however, many people still know very little about the fascinating history behind this everyday treat."	\N	["to", "than", "so", "it", "until", "much", "many", "its"]	1: 'first to discover' - infinitive after ordinal/superlative. 2: 'rather than' - comparative structure. 3: 'considered so valuable that' - result clause. 4: 'it' - pronoun referring to the drink. 5: 'not until the nineteenth century' - fixed time expression. 6: 'much wider' - intensifier before comparative adjective. 7: 'many of the countries' - quantifier with 'of the'. 8: 'its popularity' - possessive determiner referring to chocolate.	B	t	REJECTED	{grammar,"open cloze",prepositions,"linking words",pronouns,comparatives}	1	2026-07-28 17:08:31.358	2026-07-28 17:09:19.399
cms50ek0z0033a3fnhj1vs354	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMY FIRST JOB\\n\\nWhen I was eighteen, I got my first (1) ___ job in a small coffee shop near my house. I was quite nervous on my first day, but the other staff were friendly and helped me to (2) ___ used to the routine."	["A) paid", "B) earned", "C) money", "D) wage"]	"A) paid"	'Paid job' is the correct collocation meaning a job you receive money for. 'Earned' is a verb, not an adjective; 'money' and 'wage' don't collocate with 'job' in this position.	A	t	DRAFT	{vocabulary,collocation,"lexical choice"}	1	2026-07-28 18:48:45.539	2026-07-28 18:48:45.539
cms4wtngq000ja3fnejrpwntf	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (1) ___ been enjoyed by people for thousands of years, but it was not always the sweet treat we know today. The ancient Maya and Aztec civilisations were among the first (2) ___ discover the cacao bean, which they used to make a bitter drink rather (3) ___ a solid food. This drink was often mixed with spices and was believed to give strength and energy to (4) ___ who drank it.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it sweeter, and it quickly became popular among the wealthy. (5) ___ that time, chocolate remained a luxury item that only rich people could afford, mainly because (6) ___ was so expensive to produce and transport.\\n\\nIt was not until the nineteenth century, when new manufacturing methods were developed, (7) ___ chocolate finally became available in solid bar form. This invention changed everything, and (8) ___ then, chocolate has become one of the most popular foods in the world, enjoyed by people of all ages and backgrounds."	\N	["has", "to", "than", "those", "At", "it", "that", "since"]	1: 'has been enjoyed' – present perfect passive. 2: 'the first to discover' – infinitive after ordinal. 3: 'rather than' – fixed comparative expression. 4: 'those who' – relative structure referring to people. 5: 'At that time' – fixed time expression. 6: 'it was' – pronoun referring back to chocolate. 7: 'it was not until... that' – cleft sentence structure. 8: 'since then' – fixed time expression meaning from that point onward.	B	t	REJECTED	{grammar,"open cloze",collocations,"sentence structure","reading comprehension"}	1	2026-07-28 17:08:31.37	2026-07-28 17:09:19.399
cms4wtnh2000ka3fnpmeeer3s	ruoe-part-2	CLOZE	"Read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has (0) BEEN enjoyed by people for thousands of years, but the way it is eaten today is very different from how it (1)___ consumed in ancient times. The Aztecs, for example, drank chocolate (2)___ a bitter, spicy drink rather than eating it as a sweet treat. It was not (3)___ the 19th century that chocolate began to be made into the solid bars we know today.\\n\\nWhen chocolate was first brought to Europe, it was (4)___ expensive that only wealthy people could afford it. Over time, however, production methods improved, (5)___ meant that prices fell and chocolate became available to (6)___ everyone. Today, chocolate is produced (7)___ such huge quantities that global demand for cocoa beans has put pressure on farmers, many (8)___ whom struggle to grow enough to meet the world's needs.\\n\\nDespite (9)___ concerns about sustainability, chocolate remains one of the most popular foods in the world, and it seems unlikely that our love (10)___ it will fade any time soon."	\N	["was", "as", "until", "so", "which", "almost", "in", "of", "these", "for"]	Each gap tests grammatical structure: (1) past simple passive form 'was'; (2) 'as' + noun to mean 'in the role of'; (3) fixed phrase 'not until'; (4) 'so...that' construction; (5) relative pronoun 'which' referring back to the clause; (6) 'almost everyone' quantifier; (7) fixed preposition 'in such quantities'; (8) 'many of whom' relative structure; (9) determiner 'these concerns'; (10) fixed collocation 'love for'.	B	t	REJECTED	{"grammar in context","open cloze",prepositions,"relative clauses","fixed phrases"}	1	2026-07-28 17:08:31.382	2026-07-28 17:09:19.399
cms4wtnhc000la3fnqf4w6ft0	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) __HAS__ been popular for thousands of years, but it wasn't always eaten (1) _____ a sweet treat. The ancient Maya and Aztec peoples were among the (2) _____ to cultivate cacao trees, and they used the beans (3) _____ make a bitter drink rather than solid chocolate bars.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added (4) _____ make the drink more pleasant to taste. (5) _____ that time onwards, chocolate slowly became fashionable among wealthy Europeans, (6) _____ it remained extremely expensive for another three hundred years.\\n\\nIt was not (7) _____ the nineteenth century, when new manufacturing techniques were developed, that chocolate became affordable enough (8) _____ ordinary people to buy. Today, chocolate is enjoyed by millions of people all over the world."	\N	["as", "first", "to", "to", "From", "although", "until", "for"]	Each answer completes standard grammatical structures: (1) 'as' + noun for role/function; (2) 'first' with superlative meaning; (3) 'to' + infinitive of purpose; (4) 'to' + infinitive of purpose; (5) 'From that time onwards' fixed phrase; (6) 'although' to contrast fashionable status with high cost; (7) 'not until' fixed structure; (8) 'for' + person + infinitive structure ('affordable for people to buy').	B	t	REJECTED	{grammar,prepositions,"linking words","reading comprehension","sentence structure"}	1	2026-07-28 17:08:31.392	2026-07-28 17:09:19.399
cms4wtnhm000ma3fn6ucw75zg	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nURBAN BEEKEEPING\\n\\nOver the past decade, beekeeping (0) HAS become an increasingly popular hobby in cities across the world. Many people believe (1) ___ bees play a vital role in pollinating plants, and (2) ___ their numbers have been declining in rural areas due to pesticide use, cities can actually offer a safer environment for them.\\n\\nRooftop hives are now a common sight (3) ___ top of office buildings, hotels and even schools. Beekeepers claim that urban bees tend to be healthier (4) ___ their rural cousins, partly because they have access to a wider variety of flowers throughout the year, from park gardens to window boxes.\\n\\nHowever, keeping bees in a city is (5) ___ without its challenges. Beekeepers must (6) ___ sure their hives do not disturb neighbours, and they need to check regularly (7) ___ the bees have enough space and are not showing signs of disease. Despite these difficulties, more and more people are willing (8) ___ give it a try, drawn by the idea of producing their own honey while helping the environment."	\N	["that", "as", "on", "than", "not", "make", "whether", "to"]	Each gap requires a specific grammatical word: (1) 'that' introduces a noun clause after 'believe'; (2) 'as' gives a reason; (3) 'on' collocates with 'top of'; (4) 'than' follows the comparative 'healthier'; (5) 'not' completes the fixed phrase 'is not without'; (6) 'make' forms the collocation 'make sure'; (7) 'whether' introduces an indirect question; (8) 'to' follows the adjective 'willing' + infinitive.	B	t	REJECTED	{grammar,collocations,"reading comprehension","use of English"}	1	2026-07-28 17:08:31.403	2026-07-28 17:09:19.399
cms50ek1i0034a3fnxmg2nv71	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMY FIRST JOB\\n\\nWhen I was eighteen, I got my first (1) ___ job in a small café near my house. I was really nervous on my first day because I had never worked before."	["A) paid", "B) earned", "C) charged", "D) spent"]	"A) paid"	'Paid job' is the correct collocation meaning a job you get money for. 'Earned' is a verb not an adjective here, 'charged' relates to asking for money, and 'spent' relates to using money, so they don't fit before 'job'.	A	t	DRAFT	{vocabulary,collocation,"word choice"}	1	2026-07-28 18:48:45.558	2026-07-28 18:48:45.558
cms4wtnhx000na3fnpqn370bv	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) ___HAS___ been popular for thousands of years, but it hasn't always been eaten (1) ___ the sweet form we know today. The ancient Maya and Aztec peoples drank chocolate (2) ___ a bitter beverage, often mixed with spices. It was considered (3) ___ valuable that cacao beans were even used (4) ___ a form of money.\\n\\nWhen chocolate was brought to Europe in the sixteenth century, sugar was added to make it more pleasant, and it slowly became (5) ___ luxury enjoyed by the wealthy. It wasn't (6) ___ the nineteenth century that inventors found a way (7) ___ turn chocolate into a solid bar, making it affordable for ordinary people.\\n\\nToday, chocolate is produced (8) ___ huge quantities all over the world, and it remains one of the most popular foods on the planet."	\N	["in", "as", "so", "as", "a", "until", "to", "in"]	Each gap tests grammatical structures typical of B2 open cloze: (1) 'in the sweet form' - preposition; (2) 'drank it as a beverage' - preposition of role/function; (3) 'so valuable that' - result clause structure; (4) 'used as a form of money' - preposition of function; (5) 'became a luxury' - indefinite article; (6) 'wasn't until' - fixed time expression; (7) 'a way to turn' - infinitive after noun; (8) 'produced in huge quantities' - preposition of manner/quantity.	B	t	REJECTED	{grammar,prepositions,articles,"sentence structure",collocations}	1	2026-07-28 17:08:31.414	2026-07-28 17:09:19.399
cms4wtna00000a3fns7afon2r	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has (0) BEEN enjoyed by people for thousands of years, but it has not always looked (1) ___ it does today. The ancient Maya and Aztec civilisations were among the (2) ___ to discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet solid bars we know now.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it more pleasant, and (4) ___ then chocolate slowly became popular across the continent. (5) ___ was not until the nineteenth century, however, that a Dutch chemist found a way to make chocolate powder, which eventually led to the solid chocolate bar (6) ___ we eat today.\\n\\nDespite (7) ___ many changes it has gone through, chocolate remains one of the world's favourite treats, and global demand for it continues (8) ___ grow every year."	\N	["like", "first", "than", "since", "It", "that", "the", "to"]	Each answer is a single grammatical word completing a common structure: (1) 'looked like' = comparison; (2) 'the first to discover' = superlative + infinitive; (3) 'rather than' = fixed phrase; (4) 'since then' = time expression; (5) 'It was not until...' = cleft sentence structure; (6) 'that' = relative pronoun referring to 'bar'; (7) 'the many changes' = article before quantifier + noun; (8) 'continues to grow' = verb pattern with infinitive.	B	t	ACTIVE	{grammar,"open cloze","sentence structure",collocations,"prepositions and linking words"}	1	2026-07-28 17:08:31.128	2026-07-28 17:09:39.605
cms4wtnai0001a3fnicjbd9bq	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS been enjoyed by people for thousands of years, but it has not always looked (1) ___ it does today. The ancient Maya and Aztec civilisations were among the (2) ___ to discover the cacao bean, (3) ___ they used to make a bitter drink rather (4) ___ the sweet solid chocolate we know now. This drink was often mixed with spices and was believed to (5) ___ special powers, including increasing energy and strength.\\n\\nIt was not (6) ___ the 16th century that chocolate was brought to Europe by Spanish explorers. (7) ___ first, only the wealthy could afford it, as cacao beans were extremely expensive. Over time, however, methods of production improved, (8) ___ meant that chocolate gradually became available to ordinary people, eventually turning into the popular treat we enjoy today."	\N	["like", "first", "which", "than", "have", "until", "At", "which"]	Each answer completes a fixed grammatical structure: (1) 'look like' = resemble; (2) 'the first to discover' = superlative + infinitive; (3) 'which' introduces a relative clause referring to the drink; (4) 'rather than' expresses contrast/preference; (5) 'have special powers' = possess; (6) 'not until' = time expression meaning 'only when'; (7) 'At first' = a fixed phrase meaning 'initially'; (8) 'which' as a relative pronoun referring back to the whole previous clause (improved production methods).	B	t	ACTIVE	{grammar,"open cloze",collocations,"relative clauses","fixed phrases"}	1	2026-07-28 17:08:31.146	2026-07-28 17:09:39.605
cms50ek1t0035a3fnosmnct1s	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMy sister has always had a great (0) ___ of adventure. Last year she decided to travel around South America on her own, which I thought was a really brave (1) ___ to make.\\n\\n0. A love  B sense  C spirit  D taste\\n1. A decision  B choice  C option  D mind"	["A decision", "B choice", "C option", "D mind"]	"A decision"	'Make a decision' is the correct fixed collocation in English. 'Choice' collocates with 'make' too but 'a brave choice to make' sounds unnatural here; 'decision' is the standard collocation with 'brave'. 'Option' and 'mind' don't fit the collocation pattern with 'make... to make'.	A	t	DRAFT	{collocation,"vocabulary in context","fixed phrases"}	1	2026-07-28 18:48:45.57	2026-07-28 18:48:45.57
cms50ek250036a3fnyi3nr4vl	ruoe-part-1	MC	"For questions, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nLearning to Cook\\n\\nWhen I was younger, I never had any interest in cooking. My mother always (0) ___ the meals, and I was happy just to eat them. It was only when I moved into my own flat that I realised I needed to learn some basic skills, or I would (1) ___ up eating toast every night.\\n\\n1."	["end", "finish", "stop", "close"]	"end"	'End up' is a fixed phrasal verb meaning to eventually be in a particular situation, often unplanned. 'Finish up' is not standard collocation here, and 'stop up'/'close up' don't fit the meaning of the sentence.	A	t	DRAFT	{vocabulary,"phrasal verbs",collocation}	1	2026-07-28 18:48:45.581	2026-07-28 18:48:45.581
cms50ek2g0037a3fnpnrs2oe8	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMy Trip to the Coast\\n\\nLast summer, I decided to (0) ___ a few days at my aunt's house near the coast. The journey took much longer than I had expected because of heavy traffic."	["spend", "pass", "take", "use"]	"spend"	'Spend' collocates with time expressions like 'a few days' to mean using time in a particular way. 'Pass' would need a different structure, 'take' doesn't fit this collocation, and 'use' is not used with periods of time in this context.	A	t	DRAFT	{"vocabulary collocation","word choice in context","lexical cloze"}	1	2026-07-28 18:48:45.592	2026-07-28 18:48:45.592
cms4xduou001fa3fnmxsbl1od	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHEWING GUM\\n\\nPeople have been chewing gum-like substances (0) FOR thousands of years, but the modern chewing gum industry only began in the nineteenth century. Early gum was made (1) ____ tree resin, which people chewed to freshen their breath or simply (2) ____ pass the time.\\n\\nIn the 1860s, an American inventor named Thomas Adams was given a supply of chicle, a natural gum from Mexico, and asked to turn it (3) ____ rubber. His attempts failed, but he noticed that people (4) ____ chewed it enjoyed the taste, so he decided to sell it as chewing gum instead. This proved to be (5) ____ much better idea, and Adams soon became successful.\\n\\nBy the early twentieth century, chewing gum had (6) ____ extremely popular across the United States, and companies began adding flavours such as mint and fruit to make it more appealing. Despite (7) ____ criticised by some people as an unhealthy habit, chewing gum continued to grow in popularity, and today it is enjoyed by millions of people all (8) ____ the world."	\N	["from", "to", "into", "who", "a", "become", "being", "over"]	Each gap tests grammatical structures typical of B2 open cloze: (1) 'made from' collocation; (2) infinitive of purpose 'to pass'; (3) 'turn into'; (4) relative pronoun 'who' referring to people; (5) 'a much better idea' - indefinite article before adjective+noun; (6) present perfect 'had become'; (7) gerund after preposition 'despite being'; (8) 'all over the world' fixed phrase.	B	t	ACTIVE	{"grammar in context",prepositions,collocations,"verb forms","relative pronouns"}	1	2026-07-28 17:24:13.854	2026-07-28 17:48:08.173
cms50ek2s0038a3fnmbwi12xv	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nA NEW HOBBY\\n\\nLast year, I decided to take up painting as a new hobby. I had never (1) ___ any interest in art before, but a friend persuaded me to join a local class.\\n\\n1. A made  B done  C had  D taken"	["made", "done", "had", "taken"]	"C"	'Had' is correct because 'have an interest in something' is the correct collocation in English. 'Made', 'done', and 'taken' do not collocate naturally with 'interest'.	A	t	DRAFT	{vocabulary,collocations,"multiple-choice cloze"}	1	2026-07-28 18:48:45.604	2026-07-28 18:48:45.604
cms50ek320039a3fng0tosmaj	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMaria had always wanted to (0)___ her own business, and after years of saving money, she finally had enough to get started.\\n\\n0. A run B make C do D have"	["A run", "B make", "C do", "D have"]	"A run"	'Run a business' is the correct collocation meaning to manage or operate it. 'Make', 'do' and 'have' do not collocate correctly with 'business' in this context.	A	t	DRAFT	{vocabulary,collocation,"word choice"}	1	2026-07-28 18:48:45.615	2026-07-28 18:48:45.615
cms50ek3e003aa3fnnm7wmkch	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMY FIRST JOB\\n\\nWhen I was eighteen, I got my first (1) ___ job in a small coffee shop near my house. I was really nervous on my first day, but the other staff were friendly and helped me a lot."	["A. paid", "B. earned", "C. spent", "D. gained"]	"A. paid"	'Paid job' is the correct collocation meaning a job where you receive money, commonly used to contrast with unpaid/volunteer work. 'Earned' is a verb, not an adjective before 'job'; 'spent' and 'gained' do not collocate with 'job' in this context.	A	t	DRAFT	{vocabulary,collocations,"reading comprehension"}	1	2026-07-28 18:48:45.626	2026-07-28 18:48:45.626
cms50ek3p003ba3fn5jb5j62c	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nMY FIRST JOB\\n\\nWhen I was eighteen, I got my first (1) ___ job in a small café near my house. I was really nervous on my first day because I had never worked before."	["A) paid", "B) earning", "C) money", "D) wage"]	"A) paid"	'Paid job' is the correct collocation meaning a job you receive money for. 'Earning' and 'wage' are not adjectives that fit before 'job', and 'money job' is not a natural collocation in English.	A	t	DRAFT	{vocabulary,collocations,"lexical choice"}	1	2026-07-28 18:48:45.637	2026-07-28 18:48:45.637
cms50ek42003ca3fnxfh9f9qw	ruoe-part-1	MC	"For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.\\n\\nLearning a New Language\\n\\nMany people (0) ___ that learning a new language as an adult is much harder than as a child. However, research (1) ___ that adults can actually learn languages very effectively if they use the right methods.\\n\\n(0) A think  B believe  C consider  D suppose\\n\\n1 A shows  B tells  C says  D speaks"	["shows", "tells", "says", "speaks"]	"shows"	'Shows' collocates naturally with 'research' to mean the research provides evidence. 'Tells' and 'says' are used for people/sources giving direct statements, not for research demonstrating findings, and 'speaks' does not collocate with 'research' in this context.	A	t	DRAFT	{collocation,"vocabulary in context","word choice"}	1	2026-07-28 18:48:45.65	2026-07-28 18:48:45.65
cms4xduuf001wa3fnt74nb0mm	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) ___HAS___ been popular for thousands of years, but it hasn't always been eaten in the way we know today. The Mayans and Aztecs were among the first people (1) ___ to make a drink from cacao beans, which they mixed with water and spices. This drink was extremely bitter, (2) ___ unlike the sweet chocolate we enjoy nowadays.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added (3) ___ order to make the drink more pleasant. It quickly became fashionable among the wealthy, (4) ___ could afford such a luxury. For a long time, chocolate remained a drink rather (5) ___ something you could eat.\\n\\nIt wasn't (6) ___ the nineteenth century that solid chocolate bars were invented, thanks to new technology that allowed manufacturers to produce chocolate on a much larger scale. Since then, chocolate (7) ___ become one of the most popular foods in the world, and every year, more (8) ___ seven million tonnes of cacao are produced globally to satisfy demand."	\N	["to", "quite", "in", "who", "than", "until", "has", "than"]	Each gap tests grammatical structures typical of B2 open cloze: (1) 'to' after 'first people' + infinitive; (2) 'quite' as an intensifier before 'unlike'; (3) 'in order to' fixed phrase; (4) 'who' as relative pronoun for people; (5) 'rather than' comparative structure; (6) 'It wasn't until' fixed expression; (7) 'has' for present perfect tense; (8) 'more than' before a number.	B	t	ACTIVE	{grammar,prepositions,"relative pronouns","fixed phrases","reading comprehension"}	1	2026-07-28 17:24:14.055	2026-07-28 17:47:57.822
cms4xdup4001ga3fne9l7164v	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS become one of the world's most popular foods, but few people know (1) ___ its origins in Central America. The Maya and Aztec peoples were the first (2) ___ discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet chocolate we know today. This drink was considered so valuable that cacao beans were (4) ___ used as a form of money.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added (5) ___ make the drink more appealing to European tastes. (6) ___ that time, chocolate has undergone countless transformations, eventually becoming the solid bars and sweets (7) ___ we eat today. Despite (8) ___ changes over the centuries, chocolate remains as popular now as it ever was."	\N	["about", "to", "than", "even", "to", "Since", "which", "these"]	Each answer completes a grammatical structure: (1) 'know about' (verb+preposition); (2) 'the first to discover' (infinitive after ordinal); (3) 'rather than' (comparative structure); (4) 'even used' (adverb of emphasis); (5) 'to make' (infinitive of purpose); (6) 'Since that time' (time expression showing continuation); (7) 'sweets which we eat' (relative pronoun); (8) 'these changes' (demonstrative determiner referring back to transformations mentioned).	B	t	ACTIVE	{grammar,"open cloze",prepositions,"relative clauses",collocations}	1	2026-07-28 17:24:13.864	2026-07-28 17:47:57.822
cms4xdupg001ha3fneedku9rr	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (1) ___ thousands of years, but it wasn't always the sweet treat we know today. The cacao tree, (2) ___ beans are used to make chocolate, originally grew in Central America. The ancient Maya and Aztec peoples were among the first (3) ___ discover how to turn cacao beans into a drink.\\n\\nUnlike modern chocolate, this early version was bitter and often mixed (4) ___ spices rather than sugar. It was considered so valuable that cacao beans were sometimes (5) ___ as a form of money. When Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it sweeter, and (6) ___ became extremely popular among wealthy people.\\n\\nIt was not (7) ___ the nineteenth century that solid chocolate bars were invented, making chocolate available to ordinary people (8) ___ well as the rich. Since then, chocolate has become one of the most popular foods in the world."	\N	["for", "whose", "to", "with", "used", "it", "until", "as"]	Each gap tests grammatical structures common at B2: (1) 'for' + duration; (2) 'whose' as possessive relative pronoun; (3) 'to' after 'first' (infinitive of purpose/ordinal); (4) 'with' collocates with 'mixed'; (5) 'used' in passive structure 'were sometimes used as'; (6) 'it' as subject pronoun referring back to chocolate; (7) 'until' in the fixed phrase 'not until...that'; (8) 'as' in the phrase 'as well as'.	B	t	ACTIVE	{"grammar (prepositions, relative pronouns, fixed phrases)","reading comprehension","sentence structure awareness"}	1	2026-07-28 17:24:13.876	2026-07-28 17:47:57.822
cms4xdupr001ia3fn2nbp5aen	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has (0) BEEN enjoyed by people for thousands of years, but it has not always been the sweet treat we know today. The cacao tree, (1) ___ beans are used to make chocolate, originally grew in Central America. Ancient civilisations such (2) ___ the Maya and Aztecs valued cacao so highly that they used the beans (3) ___ a form of currency.\\n\\nIt was not (4) ___ the 16th century that chocolate was brought to Europe by Spanish explorers. At first, it was consumed (5) ___ a bitter drink, and only the wealthy could afford it. Sugar was later added to make it more palatable, (6) ___ led to its growing popularity across the continent.\\n\\nDuring the Industrial Revolution, new methods (7) ___ production made chocolate cheaper and easier to produce in large quantities. This meant that, (8) ___ the first time, ordinary people could also enjoy this once-exclusive treat."	\N	["whose", "as", "as", "until", "as", "which", "of", "for"]	1: 'whose' shows possession (the tree's beans). 2: 'such as' introduces examples. 3: 'as' means 'in the role of' (currency). 4: 'not until' is a fixed phrase meaning 'only when'. 5: 'as' again means 'in the form of'. 6: 'which' is a relative pronoun referring to the whole previous clause. 7: 'methods of production' is a fixed collocation. 8: 'for the first time' is a fixed phrase.	B	t	ACTIVE	{grammar,"relative pronouns",prepositions,"fixed phrases",collocations}	1	2026-07-28 17:24:13.887	2026-07-28 17:47:57.822
cms4xduq4001ja3fntodimit6	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (0) FOR thousands of years, but it has not always looked (1) ___ it does today. The ancient Maya and Aztec civilisations were among the first (2) ___ discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet solid chocolate we know now. This drink was often mixed (4) ___ spices and was considered so valuable that cacao beans were even used (5) ___ a form of money.\\n\\nIt was not until the 16th century that chocolate was brought to Europe, (6) ___ it quickly became popular among the wealthy. Sugar was added to make it sweeter, and (7) ___ the Industrial Revolution, new machinery made (8) ___ possible to produce solid chocolate bars cheaply. This meant that, for the first time, chocolate could be enjoyed by ordinary people rather than just the rich."	\N	["like", "to", "than", "with", "as", "where", "during", "it"]	Each answer completes a grammatical structure: (1) 'like' compares present appearance to past; (2) 'to' follows 'first' + infinitive; (3) 'than' follows comparative 'rather'; (4) 'with' collocates with 'mixed'; (5) 'as' introduces a role/function; (6) 'where' is a relative adverb referring to Europe; (7) 'during' indicates a time period; (8) 'it' is the impersonal object pronoun in 'made it possible'.	B	t	ACTIVE	{grammar,prepositions,collocations,"sentence structure","reading comprehension"}	1	2026-07-28 17:24:13.9	2026-07-28 17:47:57.822
cms4xduqh001ka3fnxildwtfy	ruoe-part-2	CLOZE	"Read the text and think of the word which best fits the gap.\\n\\nThe History of Chewing Gum\\n\\nPeople have chewed gum-like substances for thousands of years, but modern chewing gum only became popular in the nineteenth century. It was originally made from a natural substance called chicle, ___(1)___ comes from the sapodilla tree in Central America."	\N	"which"	'Which' is required as a relative pronoun to introduce a non-defining relative clause referring back to 'chicle' (a thing, not a person), correctly connecting the two clauses.	B	t	ACTIVE	{grammar,"relative clauses","open cloze reading"}	1	2026-07-28 17:24:13.913	2026-07-28 17:47:57.822
cms4xduqs001la3fnamrc3bqm	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (1) ___ been enjoyed by people for thousands of years, but it has not always been the sweet treat we know today. The Aztecs and Mayans were among the first (2) ___ to cultivate cacao beans, which they used to make a bitter drink. This drink was often mixed (3) ___ spices and was believed to have special powers.\\n\\nWhen Spanish explorers arrived in Central America, they brought cacao beans back to Europe, (4) ___ sugar was soon added to make the drink sweeter. (5) ___ the 19th century, chocolate remained an expensive luxury enjoyed only by the wealthy. It was not (6) ___ new manufacturing methods were developed that chocolate became affordable for ordinary people.\\n\\nToday, chocolate is produced (7) ___ huge quantities all over the world, and it is difficult to imagine a supermarket (8) ___ any chocolate products on its shelves at all."	\N	["has", "people", "with", "where", "By", "until", "in", "without"]	Each gap tests grammatical structures: (1) present perfect auxiliary 'has'; (2) noun after 'first' - 'people'; (3) fixed phrase 'mixed with'; (4) relative adverb 'where'; (5) preposition of time 'By'; (6) fixed structure 'not until'; (7) fixed phrase 'in huge quantities'; (8) preposition 'without' meaning lacking something.	B	t	ACTIVE	{grammar,prepositions,"fixed phrases","reading comprehension"}	1	2026-07-28 17:24:13.924	2026-07-28 17:47:57.822
cms4xdur4001ma3fnv66jwlha	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHEWING GUM\\n\\nPeople (0) HAVE been chewing gum-like substances for thousands of years, but the modern chewing gum industry only began in the 19th century. (1) ___ that time, a man named John Curtis started selling gum made from tree resin in the United States. It was not (2) ___ popular at first, but it laid the foundation for what was to come.\\n\\nLater, a Mexican general (3) ___ the name of Antonio López de Santa Anna brought a substance called chicle to New York. He hoped it (4) ___ be used to make rubber, but this experiment failed completely. However, an inventor called Thomas Adams realised chicle could be made (5) ___ a much better chewing gum than the resin previously used, (6) ___ it did not fall apart in your mouth.\\n\\nSince then, chewing gum has become popular all (7) ___ the world, with hundreds of different flavours now available. Some scientists even claim that chewing gum can help people concentrate better, (8) ___ this idea remains controversial among researchers."	\N	["At", "very", "by", "would", "into", "as", "over", "although"]	Each answer completes a standard grammatical structure: (1) 'At that time' (fixed phrase for time reference); (2) 'not very popular' (intensifier with adjective); (3) 'by the name of' (fixed phrase meaning 'called'); (4) 'hoped it would be used' (reported speech/past future); (5) 'made into' (phrasal verb pattern meaning transformed into); (6) 'as it did not fall apart' (conjunction giving reason); (7) 'all over the world' (fixed phrase); (8) 'although this idea remains controversial' (contrast conjunction).	B	t	ACTIVE	{"grammar in context",prepositions,"fixed phrases",conjunctions,"modal verbs"}	1	2026-07-28 17:24:13.936	2026-07-28 17:47:57.822
cms4xdurg001na3fn26yszo6d	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) has been enjoyed by people for thousands of years, but it looked very different in the past. The ancient Maya and Aztec peoples were (1) ______ first to grow cacao beans, which they used (2) ______ make a bitter drink rather (3) ______ the sweet solid chocolate we know today. This drink was often mixed with spices and (4) ______ sometimes considered so valuable that cacao beans were used (5) ______ money.\\n\\nWhen chocolate was brought to Europe in the sixteenth century, sugar was added to make it (6) ______ pleasant to European tastes. It remained an expensive luxury (7) ______ several centuries, enjoyed mainly by the wealthy. It was not (8) ______ the nineteenth century that new manufacturing methods made solid chocolate bars affordable for ordinary people."	\N	["the", "to", "than", "was", "as", "more", "for", "until"]	1: 'the first' - definite article before superlative. 2: 'used to make' - infinitive of purpose. 3: 'rather than' - fixed comparative phrase. 4: 'was sometimes considered' - passive verb form needed. 5: 'used as money' - preposition showing function/role. 6: 'more pleasant' - comparative form required. 7: 'for several centuries' - preposition of duration. 8: 'not until' - fixed phrase meaning 'only when'.	B	t	ACTIVE	{"grammar accuracy",collocations,prepositions,"fixed phrases","reading comprehension"}	1	2026-07-28 17:24:13.948	2026-07-28 17:47:57.822
cms4xdurt001oa3fnybk09l4o	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS been enjoyed by people for thousands of years, although it did not always look (1) ___ it does today. The ancient Maya and Aztec civilisations were among the (2) ___ to use cacao beans, which they ground (3) ___ to make a bitter drink rather than a sweet treat. This drink was often mixed with spices and (4) ___ believed to have special properties, being used in religious ceremonies as (5) ___ as for medicinal purposes.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make the drink more pleasant, (6) ___ meant it quickly became popular among the wealthy. It was not (7) ___ the nineteenth century that solid chocolate bars were invented, making chocolate available (8) ___ ordinary people for the first time."	\N	["like", "first", "up", "was", "well", "which", "until", "to"]	Each gap requires a specific word that fits grammatically and logically: (1) 'like' compares appearance; (2) 'first' completes 'among the first to'; (3) 'up' completes phrasal verb 'ground up'; (4) 'was' forms passive 'was believed'; (5) 'well' completes 'as well as'; (6) 'which' introduces a relative clause referring to the whole previous clause; (7) 'until' completes the structure 'It was not until...that'; (8) 'to' follows 'available' (available to someone).	B	t	ACTIVE	{grammar,"open cloze",collocations,prepositions,"linking words"}	1	2026-07-28 17:24:13.961	2026-07-28 17:47:57.822
cms4xdus5001pa3fnuhugg5sk	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people (0) FOR thousands of years, but it (1) ___ not always been the sweet treat we know today. The ancient Maya and Aztec civilisations were among (2) ___ first to use cacao beans, which they ground (3) ___ into a bitter drink mixed with spices. This drink was so highly valued (4) ___ cacao beans were even used as a form of currency.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make (5) ___ more palatable to European tastes. It took several centuries before chocolate (6) ___ transformed into the solid bars we eat nowadays. In 1847, a British company discovered a way (7) ___ make chocolate that could be moulded into shapes rather (8) ___ only drunk, and modern chocolate as we know it was born."	\N	["has", "the", "up", "that", "it", "was", "to", "than"]	1: 'has' completes present perfect 'has not always been'. 2: 'the' before superlative 'first'. 3: 'up' collocates with 'ground up' (grind up). 4: 'that' follows 'so...that' structure. 5: 'it' refers back to the drink/cacao. 6: 'was' completes passive 'was transformed'. 7: 'to' follows 'a way to do something'. 8: 'than' completes comparative structure 'rather...than'.	B	t	ACTIVE	{grammar,collocation,"sentence structure","reading comprehension"}	1	2026-07-28 17:24:13.973	2026-07-28 17:47:57.822
cms4xdush001qa3fnsfdveqgs	ruoe-part-2	CLOZE	"Read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) ___HAS___ been enjoyed by people for thousands of years, but it has not always been the sweet treat we know today. The Aztecs and Mayans were among the (1) ___ to use cacao beans, which they ground (2) ___ a bitter drink mixed with spices. This drink was believed (3) ___ have energising and even medicinal properties.\\n\\nWhen Spanish explorers brought cacao back to Europe in the 16th century, sugar was added to make (4) ___ more appealing to European tastes. (5) ___ that point, chocolate remained a drink enjoyed mainly by the wealthy, (6) ___ it was expensive to produce.\\n\\nIt wasn't (7) ___ the 19th century that solid chocolate bars were invented, thanks to new manufacturing techniques. (8) ___ soon as production became cheaper, chocolate became available to ordinary people, and its popularity grew rapidly. Today, chocolate is consumed all (9) ___ the world, and (10) ___ matter where you go, you are likely to find some variation of this beloved treat."	\N	["first", "into", "to", "it", "At", "as", "until", "As", "over", "no"]	Each gap tests grammatical structures: (1) 'first' completes 'among the first to'; (2) 'into' follows 'ground'; (3) 'to' after passive 'believed'; (4) 'it' refers back to the drink; (5) 'At that point' is a fixed time phrase; (6) 'as' means 'because'; (7) 'until' with 'wasn't...that'; (8) 'As soon as' fixed phrase; (9) 'over' in 'all over the world'; (10) 'no matter where' fixed expression.	B	t	ACTIVE	{grammar,"open cloze",collocations,"fixed phrases",prepositions}	1	2026-07-28 17:24:13.985	2026-07-28 17:47:57.822
cms4xdusu001ra3fn13oyl794	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS been enjoyed by people for thousands of years, but it did not always look (1) ___ it does today. The ancient Maya and Aztec civilisations were (2) ___ first to discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet solid bars we know now. This drink was often mixed with spices and was believed to (4) ___ special powers, so it was mainly reserved for rulers and warriors.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it more pleasant to taste. (5) ___ this point onwards, chocolate slowly became popular among the wealthy classes across the continent. However, (6) ___ was not until the nineteenth century, with the invention of new machinery, that solid chocolate bars could be produced (7) ___ a large scale.\\n\\nToday, chocolate is enjoyed by people of (8) ___ ages all over the world, and it remains one of the most popular treats ever created."	\N	["like", "the", "than", "have", "From", "it", "on", "all"]	Each gap requires a specific grammatical word: (1) 'like' for comparison after 'look'; (2) 'the' before superlative 'first'; (3) 'than' after 'rather'; (4) 'have' with 'special powers'; (5) 'From' to start a time phrase 'From this point onwards'; (6) 'it' in the fixed phrase 'it was not until...that'; (7) 'on' in the collocation 'on a large scale'; (8) 'all' in the phrase 'people of all ages'.	B	t	ACTIVE	{grammar,"open cloze",collocations,prepositions,"fixed phrases"}	1	2026-07-28 17:24:13.998	2026-07-28 17:47:57.822
cms4xdut5001sa3fngc1xngoc	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (1) ___ been enjoyed by people for thousands of years, but it hasn't always looked the way it does today. The ancient Maya and Aztec civilisations were among the (2) ___ to discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet solid bars we know now. This drink was often mixed with spices and was considered so valuable that cacao beans were even used (4) ___ a form of money.\\n\\nIt wasn't until the 16th century that chocolate was brought to Europe, (5) ___ it quickly became popular among the wealthy. Sugar was added to make it sweeter, and (6) ___ time, new methods were developed to turn the drink into solid chocolate. By the 19th century, chocolate bars similar to those sold today had appeared on the market.\\n\\nDespite (7) ___ hundreds of years old, chocolate remains one of the world's favourite treats. Today, people all over the globe continue (8) ___ enjoy it in countless forms, from simple bars to elaborate desserts."	\N	["has", "first", "than", "as", "where", "in", "being", "to"]	Each gap tests grammatical structure: 1) present perfect auxiliary 'has'; 2) superlative phrase 'the first'; 3) comparative 'rather than'; 4) 'used as' (function); 5) relative adverb 'where'; 6) fixed phrase 'in time'; 7) gerund after preposition-like use 'despite being'; 8) infinitive after 'continue to'.	B	t	ACTIVE	{grammar,"open cloze","word forms",collocations,"sentence structure"}	1	2026-07-28 17:24:14.009	2026-07-28 17:47:57.822
cms4xdutg001ta3fnxvinxxf3	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) HAS become one of the world's most popular foods, but it wasn't always eaten as a sweet treat. The cacao tree, (1) _____ chocolate is made from, originally grew in Central America, and ancient civilisations there were the first (2) _____ discover its value. However, they did not eat chocolate (3) _____ we do today. Instead, they made a bitter drink from crushed cacao beans, which (4) _____ often mixed with spices.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make the drink sweeter, and it soon became fashionable (5) _____ wealthy households. It was not (6) _____ the nineteenth century that solid chocolate bars, similar to (7) _____ we eat now, were first produced. Since then, chocolate has been developed (8) _____ hundreds of different forms, from simple bars to elaborate desserts, and it remains a favourite around the world today."	\N	["which", "to", "as", "was", "with", "until", "what", "into"]	Each gap tests grammatical structures typical of B2 level: relative pronouns (which), infinitive after ordinal/first (to discover), comparative conjunction (as), passive verb form (was), preposition collocation (fashionable with), fixed phrase (not until), free relative pronoun (what we eat), and preposition of change/result (developed into).	B	t	ACTIVE	{grammar,"open cloze",prepositions,"relative pronouns","verb forms","reading for structure"}	1	2026-07-28 17:24:14.02	2026-07-28 17:47:57.822
cms4xdutr001ua3fnrcfl006u	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) ___HAS___ been enjoyed by people for thousands of years, but it was not always eaten (1) ___ sweet form. The ancient Maya and Aztec civilisations drank chocolate (2) ___ a bitter beverage, often mixed with spices. It was not (3) ___ the Spanish brought cacao beans to Europe in the sixteenth century that sugar was added to the drink.\\n\\n(4) ___ the following centuries, chocolate remained an expensive luxury enjoyed mainly (5) ___ the wealthy. It was only (6) ___ the Industrial Revolution that new machinery made chocolate cheaper to produce, allowing (7) ___ to be sold in solid bar form for the first time.\\n\\nToday, chocolate is (8) ___ popular that the average person eats several kilograms of it every year."	\N	["in", "as", "until", "Over/During", "by", "with/during", "it", "so"]	Each gap requires a single grammatical word: 1 'in' (in sweet form), 2 'as' (drink something as a beverage), 3 'until' (not until = fixed expression), 4 'Over/During' (time expression), 5 'by' (agent - enjoyed by the wealthy), 6 'with/during' (with the Industrial Revolution), 7 'it' (referring back to chocolate as object), 8 'so' (so + adjective + that = result clause).	B	t	ACTIVE	{grammar,prepositions,"linking words","reading comprehension","sentence structure"}	1	2026-07-28 17:24:14.031	2026-07-28 17:47:57.822
cms4xduu2001va3fnybz47un4	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has (0) BEEN enjoyed by people for thousands of years, but it did not always look (1) ____ it does today. The ancient Maya and Aztec civilisations were among the first (2) ____ discover the cacao bean, which they used to make a bitter drink rather (3) ____ the sweet bars we know now. This drink was often mixed with spices and was considered (4) ____ valuable that cacao beans were even used as a form of money.\\n\\nWhen chocolate was brought to Europe in the sixteenth century, sugar was added (5) ____ make it more appealing to European tastes. Over time, inventors found ways (6) ____ turn the drink into a solid form, and by the nineteenth century, chocolate bars (7) ____ become widely available. Today, chocolate is produced (8) ____ enormous quantities and enjoyed all over the world in countless different forms."	\N	["like", "to", "than", "so", "to", "to", "had", "in"]	1: 'look like' = comparison structure. 2: 'the first to discover' = infinitive after ordinal. 3: 'rather than' = comparison contrast. 4: 'so valuable that' = result clause. 5: 'added to make' = purpose infinitive. 6: 'ways to turn' = infinitive after noun. 7: 'had become' = past perfect, action completed before another past time reference. 8: 'produced in enormous quantities' = fixed prepositional phrase.	B	t	ACTIVE	{grammar,"open cloze",prepositions,"linking words","verb tenses"}	1	2026-07-28 17:24:14.042	2026-07-28 17:47:57.822
cms4xduuq001xa3fny12voy87	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has (0) BEEN enjoyed by people for thousands of years, but it has not always looked (1) ___ it does today. The Aztecs and Mayans were among the first (2) ___ discover the cacao bean, which they used to make a bitter drink rather (3) ___ the sweet solid bars we know now. This drink was often mixed with spices and was believed (4) ___ have special medicinal properties.\\n\\nWhen chocolate was brought to Europe in the sixteenth century, sugar was added to make (5) ___ more appealing to European tastes. It was not (6) ___ the nineteenth century that solid chocolate bars were invented, changing the way (7) ___ which people consumed this popular treat forever.\\n\\nToday, chocolate is produced (8) ___ a massive scale, with millions of tonnes being manufactured every year across the world."	\N	["like", "to", "than", "to", "it", "until", "in", "on"]	1: 'like' after 'looked' for comparison. 2: 'to' with infinitive after 'first'. 3: 'than' after comparative 'rather'. 4: 'to' with passive infinitive 'believed to have'. 5: 'it' as object pronoun referring to chocolate. 6: 'until/till' with 'not... until' structure. 7: 'in which' relative clause referring to 'way'. 8: 'on' fixed phrase 'on a massive scale'.	B	t	ACTIVE	{grammar,prepositions,"sentence structure",collocations,"reading comprehension"}	1	2026-07-28 17:24:14.066	2026-07-28 17:47:57.822
cms4xduv1001ya3fnl46h8iyy	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (1) ___ been enjoyed by people for thousands of years, but it has not always looked like the sweet treat we know today. The ancient Maya and Aztec civilisations were among the (2) ___ to discover the cacao bean, which they used to make a bitter drink rather (3) ___ a solid bar. This drink was often mixed with spices and was considered (4) ___ valuable that cacao beans were even used as a form of currency.\\n\\nIt was not (5) ___ the 16th century that chocolate was brought to Europe by Spanish explorers. Once there, sugar was added to make it sweeter, and it quickly became popular among the wealthy. (6) ___ time, new methods of production were developed, which eventually made chocolate affordable for everyone, not (7) ___ the rich.\\n\\nToday, chocolate is produced and consumed all over the world, and (8) ___ matter where you go, you are likely to find someone who enjoys it."	\N	["has", "first", "than", "so", "until", "Over", "just", "no"]	1. 'has' completes present perfect 'has been enjoyed'. 2. 'first' with 'the' means the earliest people. 3. 'than' follows 'rather'. 4. 'so' pairs with 'that' for result clause. 5. 'until' with 'not... until' shows the point in time when something began. 6. 'Over' with 'time' means 'as time passed'. 7. 'just' with 'not' means 'only'. 8. 'no' with 'matter' forms the fixed phrase 'no matter where'.	B	t	ACTIVE	{grammar,collocations,"fixed phrases",cohesion}	1	2026-07-28 17:24:14.077	2026-07-28 17:47:57.822
cms4xduvb001za3fno0wa41c3	ruoe-part-2	CLOZE	"For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate (0) ___HAS___ been enjoyed by people for thousands of years, but it wasn't always the sweet treat we know today. The ancient Mayans and Aztecs were (1) ___ first to cultivate cacao trees, and they used the beans to make a bitter drink rather (2) ___ a solid food. This drink was often mixed (3) ___ spices and was considered so valuable that cacao beans were even used (4) ___ a form of currency.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added to make it more palatable to European tastes. (5) ___ soon became a fashionable drink among the wealthy, although it remained too expensive for ordinary people (6) ___ many years.\\n\\nIt was not until the nineteenth century that inventors found a way (7) ___ turn cacao into solid chocolate bars, making it more affordable and (8) ___ popular than ever. Today, chocolate is enjoyed all over the world in countless different forms."	\N	["the", "than", "with", "as", "It", "for", "to", "more"]	Each gap tests grammatical structures: (1) 'the first' - definite article with superlative; (2) 'rather than' - comparison structure; (3) 'mixed with' - fixed preposition collocation; (4) 'used as' - preposition indicating function/role; (5) 'It' - subject pronoun referring back to the drink; (6) 'for many years' - preposition of duration; (7) 'a way to turn' - infinitive after noun; (8) 'more popular' - comparative adjective structure.	B	t	ACTIVE	{grammar,prepositions,articles,"comparative structures","sentence cohesion"}	1	2026-07-28 17:24:14.087	2026-07-28 17:47:57.822
cms4xduoe001ea3fnhwotzze1	ruoe-part-2	CLOZE	"Read the text below and think of the word which best fits each gap. Use only ONE word in each gap.\\n\\nTHE HISTORY OF CHOCOLATE\\n\\nChocolate has been enjoyed by people for thousands of years, but it was not always eaten (0) AS a sweet treat. The ancient Maya and Aztec civilisations in Central America were among the first (1) ______ discover the value of the cacao bean. They ground the beans (2) ______ made a bitter drink, which was often mixed with spices rather (3) ______ sugar.\\n\\nWhen Spanish explorers brought cacao back to Europe in the sixteenth century, sugar was added (4) ______ make the drink sweeter, and it quickly became popular among the wealthy. (5) ______ this time, chocolate was still only available as a drink, not as something you could eat in solid form.\\n\\nIt was not (6) ______ the nineteenth century that inventors found a way to produce solid chocolate bars. Since (7) ______, chocolate has become one of the most popular foods in the world, and today it is difficult to imagine a supermarket (8) ______ any chocolate at all on its shelves."	\N	["to", "and", "than", "to", "At", "until", "then", "without"]	Each gap tests grammatical structures typical of B2 open cloze: infinitive after superlative (1: to), linking verbs (2: and), comparative structure 'rather than' (3: than), infinitive of purpose (4: to), prepositional phrase 'at this time' (5: At), fixed expression 'not until' (6: until), time expression 'since then' (7: then), and preposition after 'imagine' (8: without).	B	t	ACTIVE	{grammar,prepositions,"fixed phrases","reading comprehension"}	1	2026-07-28 17:24:13.838	2026-07-28 17:48:08.173
cms50ejuj002oa3fn5061inx0	ruoe-part-1	MC	"Read the text below and decide which answer best fits the gap.\\n\\nAfter walking for nearly three hours along the mountain path, the group finally managed to ________ their destination just before sunset.\\n\\nChoose the correct word:"	["A) arrive", "B) reach", "C) get", "D) approach"]	"B) reach"	'Reach' takes a direct object without a preposition ('reach their destination'). 'Arrive' requires 'at/in', and 'get' requires 'to'.	A	t	DRAFT	{Vocabulary,Collocations,"Verb patterns"}	1	2026-07-28 18:48:45.307	2026-07-28 18:48:45.307
cms50ejvt002pa3fneey7tvs4	ruoe-part-1	MC	"Read the text below and choose the correct word for the gap.\\n\\nSarah decided to (1) ______ up a new hobby during the summer holidays to stay active."	["A) make", "B) take", "C) set", "D) bring"]	"B) take"	'Take up' is a standard phrasal verb meaning to start a new hobby or activity.	A	t	DRAFT	{Vocabulary,"Phrasal Verbs","Reading & Use of English Part 1"}	1	2026-07-28 18:48:45.353	2026-07-28 18:48:45.353
\.


--
-- Data for Name: QuestionEdit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QuestionEdit" (id, "questionId", "editorId", changes, "createdAt") FROM stdin;
cms4wuojy000oa3fnlh6a6aij	cms4wtnbm0004a3fn5i43r7zk	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.436Z", "before": null}}	2026-07-28 17:09:19.438
cms4wuok4000pa3fnc5otxco2	cms4wtnc10005a3fny0difvcs	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.444Z", "before": null}}	2026-07-28 17:09:19.444
cms4wuok8000qa3fn4a08t3v4	cms4wtncf0006a3fnhe805oka	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.448Z", "before": null}}	2026-07-28 17:09:19.448
cms4wuokc000ra3fn3bj80ns8	cms4wtncr0007a3fnl3jbt4qh	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.452Z", "before": null}}	2026-07-28 17:09:19.452
cms4wuokg000sa3fnahsji458	cms4wtnd10008a3fnur64n0x0	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.456Z", "before": null}}	2026-07-28 17:09:19.456
cms4wuokk000ta3fn3hoavwh3	cms4wtndc0009a3fnqigysped	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.460Z", "before": null}}	2026-07-28 17:09:19.46
cms4wuoko000ua3fnk2puptlj	cms4wtndp000aa3fni4444p5y	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.463Z", "before": null}}	2026-07-28 17:09:19.464
cms4wuoks000va3fnlseo3o6l	cms4wtne2000ba3fndact0itf	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.467Z", "before": null}}	2026-07-28 17:09:19.468
cms4wuokv000wa3fnqlqy2ivj	cms4wtneg000ca3fn9ehy6l55	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.471Z", "before": null}}	2026-07-28 17:09:19.472
cms4wuokz000xa3fnltk14gr5	cms4wtner000da3fnc7bmunel	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.475Z", "before": null}}	2026-07-28 17:09:19.475
cms4wuol3000ya3fn0mnzc4yd	cms4wtnf1000ea3fnu1xcx1eq	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.478Z", "before": null}}	2026-07-28 17:09:19.479
cms4wuol7000za3fn1b4lifxp	cms4wtnfa000fa3fnuztr45s7	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.483Z", "before": null}}	2026-07-28 17:09:19.483
cms4wuolb0010a3fndyfri9o0	cms4wtnfm000ga3fnmnxeibjd	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.487Z", "before": null}}	2026-07-28 17:09:19.487
cms4wuolf0011a3fnivsnyx9q	cms4wtnfx000ha3fnch75an9r	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.491Z", "before": null}}	2026-07-28 17:09:19.491
cms4wuolj0012a3fnl9jobm1n	cms4wtnge000ia3fnypuydgs7	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.494Z", "before": null}}	2026-07-28 17:09:19.495
cms4wuolm0013a3fnviwsb4rr	cms4wtngq000ja3fnejrpwntf	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.498Z", "before": null}}	2026-07-28 17:09:19.499
cms4wuolq0014a3fn43gx5o6b	cms4wtnh2000ka3fnpmeeer3s	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.502Z", "before": null}}	2026-07-28 17:09:19.503
cms4wuolu0015a3fn3l6ftwwn	cms4wtnhc000la3fnqf4w6ft0	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.506Z", "before": null}}	2026-07-28 17:09:19.506
cms4wuoly0016a3fnz6cumd5i	cms4wtnhm000ma3fn6ucw75zg	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.510Z", "before": null}}	2026-07-28 17:09:19.51
cms4wuom20017a3fnuth7ls6q	cms4wtnhx000na3fnpqn370bv	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_reject", "before": null}, "status": {"after": "REJECTED", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:19.513Z", "before": null}}	2026-07-28 17:09:19.514
cms4wv44a0018a3fn1bq3sy9f	cms4wtna00000a3fns7afon2r	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:39.609Z", "before": null}}	2026-07-28 17:09:39.61
cms4wv44f0019a3fnmc8weed7	cms4wtnai0001a3fnicjbd9bq	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:39.615Z", "before": null}}	2026-07-28 17:09:39.615
cms4wv44i001aa3fnip57qanq	cms4wtnax0002a3fnv78qo3w4	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:39.618Z", "before": null}}	2026-07-28 17:09:39.618
cms4wv44m001ba3fn8wkuxoaa	cms4wtnb90003a3fnm53uovwu	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:09:39.621Z", "before": null}}	2026-07-28 17:09:39.622
cms4y8dfp0020a3fn4ltviuz9	cms4xdup4001ga3fne9l7164v	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.828Z", "before": null}}	2026-07-28 17:47:57.829
cms4y8dfw0021a3fnmp89gkd9	cms4xdupg001ha3fneedku9rr	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.835Z", "before": null}}	2026-07-28 17:47:57.836
cms4y8dfz0022a3fn0bfv5098	cms4xdupr001ia3fn2nbp5aen	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.838Z", "before": null}}	2026-07-28 17:47:57.839
cms4y8dg10023a3fnlcfq4hfv	cms4xduq4001ja3fntodimit6	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.841Z", "before": null}}	2026-07-28 17:47:57.841
cms4y8dg50024a3fnf93cxup2	cms4xduqh001ka3fnxildwtfy	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.844Z", "before": null}}	2026-07-28 17:47:57.845
cms4y8dg90025a3fn5dwobsuc	cms4xduqs001la3fnamrc3bqm	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.848Z", "before": null}}	2026-07-28 17:47:57.849
cms4y8dgd0026a3fnpli0wlnv	cms4xdur4001ma3fnv66jwlha	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.852Z", "before": null}}	2026-07-28 17:47:57.853
cms4y8dgg0027a3fn5zsvwp87	cms4xdurg001na3fn26yszo6d	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.855Z", "before": null}}	2026-07-28 17:47:57.856
cms4y8dgj0028a3fnatkqmfd0	cms4xdurt001oa3fnybk09l4o	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.858Z", "before": null}}	2026-07-28 17:47:57.859
cms4y8dgm0029a3fng3sg0stc	cms4xdus5001pa3fnuhugg5sk	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.862Z", "before": null}}	2026-07-28 17:47:57.862
cms4y8dgq002aa3fno5vv76hy	cms4xdush001qa3fnsfdveqgs	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.865Z", "before": null}}	2026-07-28 17:47:57.866
cms4y8dgt002ba3fnr98rn2ms	cms4xdusu001ra3fn13oyl794	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.868Z", "before": null}}	2026-07-28 17:47:57.869
cms4y8dgw002ca3fnrhfvv3hz	cms4xdut5001sa3fngc1xngoc	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.871Z", "before": null}}	2026-07-28 17:47:57.872
cms4y8dgz002da3fnv172948d	cms4xdutg001ta3fnxvinxxf3	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.874Z", "before": null}}	2026-07-28 17:47:57.875
cms4y8dh3002ea3fnjdjghh6c	cms4xdutr001ua3fnrcfl006u	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.878Z", "before": null}}	2026-07-28 17:47:57.879
cms4y8dh6002fa3fnedeno195	cms4xduu2001va3fnybz47un4	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.882Z", "before": null}}	2026-07-28 17:47:57.882
cms4y8dha002ga3fnpz8acram	cms4xduuf001wa3fnt74nb0mm	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.886Z", "before": null}}	2026-07-28 17:47:57.886
cms4y8dhe002ha3fns30fnsz4	cms4xduuq001xa3fny12voy87	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.889Z", "before": null}}	2026-07-28 17:47:57.89
cms4y8dhi002ia3fnxga2d2kq	cms4xduv1001ya3fnl46h8iyy	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.894Z", "before": null}}	2026-07-28 17:47:57.895
cms4y8dhm002ja3fn643yskyc	cms4xduvb001za3fno0wa41c3	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:47:57.898Z", "before": null}}	2026-07-28 17:47:57.898
cms4y8lf5002ka3fn1wad414w	cms4xduoe001ea3fnhwotzze1	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:48:08.177Z", "before": null}}	2026-07-28 17:48:08.177
cms4y8lf8002la3fn9bngeq7j	cms4xduou001fa3fnmxsbl1od	0712d5fc-a6d9-4d24-8667-ada7402934b2	{"action": {"after": "bulk_approve", "before": null}, "status": {"after": "ACTIVE", "before": "DRAFT"}, "reviewedAt": {"after": "2026-07-28T17:48:08.180Z", "before": null}}	2026-07-28 17:48:08.18
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: SkillProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SkillProfile" (id, "userId", "partId", "attemptsCount", accuracy, "avgTimeSeconds", "lastAttemptAt") FROM stdin;
\.


--
-- Data for Name: TimeTracker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TimeTracker" (id, "attemptId", "remainingSeconds", "lastHeartbeatAt", version) FROM stdin;
cms4y97dr002na3fnczm2um1k	cms4y97d2002ma3fn1kpsrhbm	4020	2026-07-28 17:50:38.295	7
cms50oro3003na3fn6fnjzphm	cms50orn5003ma3fnzgyg8w7z	3720	2026-07-28 19:04:13.235	17
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image, "passwordHash", role, "createdAt", "updatedAt") FROM stdin;
0712d5fc-a6d9-4d24-8667-ada7402934b2	Admin	admin@examforge.com	2026-07-17 17:32:42.661	\N	$2b$10$4Q9987byWIKIgNwSQwO2u.tcLN.lJAUs/.pH6e4WMyB/oxaaYtPiO	ADMIN	2026-07-17 17:32:42.661	2026-07-17 17:32:42.661
4e767bbf-77dc-4e94-9106-1da884b7399a	Tester	tester@examforge.com	2026-07-20 20:52:01.862	\N	$2b$10$ZOj8h/6BZRK2ig.pjS052uwIKP.xgk9WehR3yAVBAcrHMavGo5gBm	USER	2026-07-20 20:52:01.862	2026-07-20 20:52:01.862
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: WritingPrompt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WritingPrompt" (id, "examPartId", prompt, "wordCountMin", "wordCountMax", rubric, "createdAt") FROM stdin;
\.


--
-- Data for Name: WritingSubmission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WritingSubmission" (id, "attemptId", "writingPromptId", content, "wordCount", scores, feedback, "submittedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
05f3d6c0-909c-425a-9265-7ba169a934d5	1aaa1900d338f5f5998254f9e682f9812f4ed792fbd5e61489dd6a9ae42e5633	2026-07-17 15:28:17.740232+00	20260717152817_init	\N	\N	2026-07-17 15:28:17.406283+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: Answer Answer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_pkey" PRIMARY KEY (id);


--
-- Name: AudioExercise AudioExercise_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AudioExercise"
    ADD CONSTRAINT "AudioExercise_pkey" PRIMARY KEY (id);


--
-- Name: ChallengeParticipation ChallengeParticipation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChallengeParticipation"
    ADD CONSTRAINT "ChallengeParticipation_pkey" PRIMARY KEY (id);


--
-- Name: DailyStreak DailyStreak_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DailyStreak"
    ADD CONSTRAINT "DailyStreak_pkey" PRIMARY KEY (id);


--
-- Name: ExamAttempt ExamAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExamAttempt"
    ADD CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY (id);


--
-- Name: ExamPart ExamPart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExamPart"
    ADD CONSTRAINT "ExamPart_pkey" PRIMARY KEY (id);


--
-- Name: FlashcardDeck FlashcardDeck_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlashcardDeck"
    ADD CONSTRAINT "FlashcardDeck_pkey" PRIMARY KEY (id);


--
-- Name: Flashcard Flashcard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Flashcard"
    ADD CONSTRAINT "Flashcard_pkey" PRIMARY KEY (id);


--
-- Name: GeneratedContent GeneratedContent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GeneratedContent"
    ADD CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY (id);


--
-- Name: Goal Goal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Goal"
    ADD CONSTRAINT "Goal_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: QuestionEdit QuestionEdit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionEdit"
    ADD CONSTRAINT "QuestionEdit_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SkillProfile SkillProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SkillProfile"
    ADD CONSTRAINT "SkillProfile_pkey" PRIMARY KEY (id);


--
-- Name: TimeTracker TimeTracker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimeTracker"
    ADD CONSTRAINT "TimeTracker_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WritingPrompt WritingPrompt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WritingPrompt"
    ADD CONSTRAINT "WritingPrompt_pkey" PRIMARY KEY (id);


--
-- Name: WritingSubmission WritingSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WritingSubmission"
    ADD CONSTRAINT "WritingSubmission_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- Name: Achievement_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Achievement_userId_idx" ON public."Achievement" USING btree ("userId");


--
-- Name: Achievement_userId_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Achievement_userId_type_key" ON public."Achievement" USING btree ("userId", type);


--
-- Name: Answer_attemptId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Answer_attemptId_idx" ON public."Answer" USING btree ("attemptId");


--
-- Name: Answer_attemptId_questionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Answer_attemptId_questionId_key" ON public."Answer" USING btree ("attemptId", "questionId");


--
-- Name: Answer_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Answer_questionId_idx" ON public."Answer" USING btree ("questionId");


--
-- Name: AudioExercise_examPartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AudioExercise_examPartId_idx" ON public."AudioExercise" USING btree ("examPartId");


--
-- Name: AudioExercise_generatedContentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AudioExercise_generatedContentId_key" ON public."AudioExercise" USING btree ("generatedContentId");


--
-- Name: AudioExercise_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AudioExercise_status_idx" ON public."AudioExercise" USING btree (status);


--
-- Name: ChallengeParticipation_challengeId_score_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChallengeParticipation_challengeId_score_idx" ON public."ChallengeParticipation" USING btree ("challengeId", score);


--
-- Name: ChallengeParticipation_challengeId_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChallengeParticipation_challengeId_userId_idx" ON public."ChallengeParticipation" USING btree ("challengeId", "userId");


--
-- Name: ChallengeParticipation_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChallengeParticipation_userId_idx" ON public."ChallengeParticipation" USING btree ("userId");


--
-- Name: DailyStreak_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DailyStreak_userId_key" ON public."DailyStreak" USING btree ("userId");


--
-- Name: ExamAttempt_anonymousSessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExamAttempt_anonymousSessionId_idx" ON public."ExamAttempt" USING btree ("anonymousSessionId");


--
-- Name: ExamAttempt_anonymousSessionId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExamAttempt_anonymousSessionId_status_idx" ON public."ExamAttempt" USING btree ("anonymousSessionId", status);


--
-- Name: ExamAttempt_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExamAttempt_userId_idx" ON public."ExamAttempt" USING btree ("userId");


--
-- Name: ExamAttempt_userId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExamAttempt_userId_status_idx" ON public."ExamAttempt" USING btree ("userId", status);


--
-- Name: ExamPart_paper_partNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExamPart_paper_partNumber_idx" ON public."ExamPart" USING btree (paper, "partNumber");


--
-- Name: ExamPart_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExamPart_sortOrder_idx" ON public."ExamPart" USING btree ("sortOrder");


--
-- Name: FlashcardDeck_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FlashcardDeck_createdById_idx" ON public."FlashcardDeck" USING btree ("createdById");


--
-- Name: FlashcardDeck_examPartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FlashcardDeck_examPartId_idx" ON public."FlashcardDeck" USING btree ("examPartId");


--
-- Name: FlashcardDeck_generatedContentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FlashcardDeck_generatedContentId_idx" ON public."FlashcardDeck" USING btree ("generatedContentId");


--
-- Name: Flashcard_deckId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Flashcard_deckId_idx" ON public."Flashcard" USING btree ("deckId");


--
-- Name: Flashcard_deckId_nextReviewAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Flashcard_deckId_nextReviewAt_idx" ON public."Flashcard" USING btree ("deckId", "nextReviewAt");


--
-- Name: Flashcard_nextReviewAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Flashcard_nextReviewAt_idx" ON public."Flashcard" USING btree ("nextReviewAt");


--
-- Name: GeneratedContent_artifactId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GeneratedContent_artifactId_idx" ON public."GeneratedContent" USING btree ("artifactId");


--
-- Name: GeneratedContent_contentType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GeneratedContent_contentType_idx" ON public."GeneratedContent" USING btree ("contentType");


--
-- Name: GeneratedContent_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GeneratedContent_createdAt_idx" ON public."GeneratedContent" USING btree ("createdAt");


--
-- Name: GeneratedContent_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GeneratedContent_createdById_idx" ON public."GeneratedContent" USING btree ("createdById");


--
-- Name: GeneratedContent_notebookId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GeneratedContent_notebookId_idx" ON public."GeneratedContent" USING btree ("notebookId");


--
-- Name: GeneratedContent_status_contentType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GeneratedContent_status_contentType_idx" ON public."GeneratedContent" USING btree (status, "contentType");


--
-- Name: GeneratedContent_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GeneratedContent_status_idx" ON public."GeneratedContent" USING btree (status);


--
-- Name: Goal_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Goal_userId_idx" ON public."Goal" USING btree ("userId");


--
-- Name: Goal_userId_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Goal_userId_type_key" ON public."Goal" USING btree ("userId", type);


--
-- Name: PasswordResetToken_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_email_idx" ON public."PasswordResetToken" USING btree (email);


--
-- Name: PasswordResetToken_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_token_idx" ON public."PasswordResetToken" USING btree (token);


--
-- Name: PasswordResetToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);


--
-- Name: QuestionEdit_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "QuestionEdit_createdAt_idx" ON public."QuestionEdit" USING btree ("createdAt");


--
-- Name: QuestionEdit_editorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "QuestionEdit_editorId_idx" ON public."QuestionEdit" USING btree ("editorId");


--
-- Name: QuestionEdit_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "QuestionEdit_questionId_idx" ON public."QuestionEdit" USING btree ("questionId");


--
-- Name: Question_examPartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Question_examPartId_idx" ON public."Question" USING btree ("examPartId");


--
-- Name: Question_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Question_status_idx" ON public."Question" USING btree (status);


--
-- Name: Question_type_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Question_type_status_idx" ON public."Question" USING btree (type, status);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: SkillProfile_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SkillProfile_userId_idx" ON public."SkillProfile" USING btree ("userId");


--
-- Name: SkillProfile_userId_partId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SkillProfile_userId_partId_key" ON public."SkillProfile" USING btree ("userId", "partId");


--
-- Name: TimeTracker_attemptId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TimeTracker_attemptId_key" ON public."TimeTracker" USING btree ("attemptId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: WritingPrompt_examPartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WritingPrompt_examPartId_idx" ON public."WritingPrompt" USING btree ("examPartId");


--
-- Name: WritingSubmission_attemptId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WritingSubmission_attemptId_idx" ON public."WritingSubmission" USING btree ("attemptId");


--
-- Name: WritingSubmission_attemptId_writingPromptId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WritingSubmission_attemptId_writingPromptId_key" ON public."WritingSubmission" USING btree ("attemptId", "writingPromptId");


--
-- Name: WritingSubmission_writingPromptId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WritingSubmission_writingPromptId_idx" ON public."WritingSubmission" USING btree ("writingPromptId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Achievement Achievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Answer Answer_attemptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES public."ExamAttempt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Answer Answer_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AudioExercise AudioExercise_generatedContentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AudioExercise"
    ADD CONSTRAINT "AudioExercise_generatedContentId_fkey" FOREIGN KEY ("generatedContentId") REFERENCES public."GeneratedContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChallengeParticipation ChallengeParticipation_attemptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChallengeParticipation"
    ADD CONSTRAINT "ChallengeParticipation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES public."ExamAttempt"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChallengeParticipation ChallengeParticipation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChallengeParticipation"
    ADD CONSTRAINT "ChallengeParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DailyStreak DailyStreak_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DailyStreak"
    ADD CONSTRAINT "DailyStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExamAttempt ExamAttempt_partId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExamAttempt"
    ADD CONSTRAINT "ExamAttempt_partId_fkey" FOREIGN KEY ("partId") REFERENCES public."ExamPart"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ExamAttempt ExamAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExamAttempt"
    ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FlashcardDeck FlashcardDeck_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlashcardDeck"
    ADD CONSTRAINT "FlashcardDeck_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FlashcardDeck FlashcardDeck_generatedContentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlashcardDeck"
    ADD CONSTRAINT "FlashcardDeck_generatedContentId_fkey" FOREIGN KEY ("generatedContentId") REFERENCES public."GeneratedContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Flashcard Flashcard_deckId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Flashcard"
    ADD CONSTRAINT "Flashcard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES public."FlashcardDeck"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GeneratedContent GeneratedContent_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GeneratedContent"
    ADD CONSTRAINT "GeneratedContent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GeneratedContent GeneratedContent_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GeneratedContent"
    ADD CONSTRAINT "GeneratedContent_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Goal Goal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Goal"
    ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionEdit QuestionEdit_editorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionEdit"
    ADD CONSTRAINT "QuestionEdit_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QuestionEdit QuestionEdit_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionEdit"
    ADD CONSTRAINT "QuestionEdit_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_examPartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_examPartId_fkey" FOREIGN KEY ("examPartId") REFERENCES public."ExamPart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkillProfile SkillProfile_partId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SkillProfile"
    ADD CONSTRAINT "SkillProfile_partId_fkey" FOREIGN KEY ("partId") REFERENCES public."ExamPart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SkillProfile SkillProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SkillProfile"
    ADD CONSTRAINT "SkillProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TimeTracker TimeTracker_attemptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimeTracker"
    ADD CONSTRAINT "TimeTracker_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES public."ExamAttempt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WritingPrompt WritingPrompt_examPartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WritingPrompt"
    ADD CONSTRAINT "WritingPrompt_examPartId_fkey" FOREIGN KEY ("examPartId") REFERENCES public."ExamPart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WritingSubmission WritingSubmission_attemptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WritingSubmission"
    ADD CONSTRAINT "WritingSubmission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES public."ExamAttempt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WritingSubmission WritingSubmission_writingPromptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WritingSubmission"
    ADD CONSTRAINT "WritingSubmission_writingPromptId_fkey" FOREIGN KEY ("writingPromptId") REFERENCES public."WritingPrompt"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict zxo4cmmN2CdXN1XajpjIVI368Q5a0pfbwelon8Zqu0Y0B8O1PjRgV3yAyWjWKQB

