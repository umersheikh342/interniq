import "server-only";

import { generateJson } from "@/lib/ai/provider-manager";
import { parseJsonFromModelText } from "@/lib/ai/prompts";
import { AiError } from "@/lib/ai/errors";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface InterviewPrepQuestion {
  question: string;
  category: "Technical" | "Behavioral" | "Situational" | "Company Fit" | "Role-Specific";
  difficulty: "Easy" | "Medium" | "Hard";
  ideal_answer: string;
  tip: string;
}

export interface InterviewPrepResult {
  questions: InterviewPrepQuestion[];
  tips: string[];
  reddit_sources: string[];
}

export interface InterviewPrepInput {
  internshipTitle: string;
  companyName: string;
  requiredSkills: string[];
  redditContext: string; // scraped Reddit post summaries
}

/* ------------------------------------------------------------------ */
/*  Reddit Scraper                                                      */
/* ------------------------------------------------------------------ */

export interface RedditPost {
  title: string;
  selftext: string;
  subreddit: string;
  url: string;
}

/**
 * Fetches relevant Reddit posts about interview experiences at the given
 * company / role using Reddit's public JSON search API (no auth needed).
 * Falls back to an empty array if Reddit is unreachable.
 */
export async function fetchRedditInterviewPosts(
  companyName: string,
  role: string
): Promise<RedditPost[]> {
  const queries = [
    `${companyName} ${role} interview`,
    `${companyName} internship interview experience`,
  ];

  const subreddits = ["cscareerquestions", "internships", "jobs"];

  const all: RedditPost[] = [];

  for (const q of queries) {
    for (const sub of subreddits) {
      try {
        const url =
          `https://www.reddit.com/r/${sub}/search.json` +
          `?q=${encodeURIComponent(q)}&sort=relevance&limit=5&restrict_sr=1`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": "InternIQ/1.0 (interview-prep; educational use)",
          },
          // 5-second timeout — Reddit is a best-effort source
          signal: AbortSignal.timeout(5_000),
        });

        if (!res.ok) continue;

        const json = await res.json();
        const posts: RedditPost[] = (json?.data?.children ?? [])
          .map((child: any) => ({
            title: child.data?.title ?? "",
            selftext: (child.data?.selftext ?? "").slice(0, 600),
            subreddit: child.data?.subreddit_name_prefixed ?? `r/${sub}`,
            url: `https://reddit.com${child.data?.permalink ?? ""}`,
          }))
          .filter((p: RedditPost) => p.title.length > 10);

        all.push(...posts);
      } catch {
        // Reddit unreachable, timeout, or rate-limited — skip gracefully
      }
    }
  }

  // Deduplicate by title, cap at 15 posts
  const seen = new Set<string>();
  return all
    .filter((p) => {
      if (seen.has(p.title)) return false;
      seen.add(p.title);
      return true;
    })
    .slice(0, 15);
}

/* ------------------------------------------------------------------ */
/*  Prompt                                                              */
/* ------------------------------------------------------------------ */

const INTERVIEW_PREP_SYSTEM = `You are an expert interview coach helping internship applicants prepare.

Generate tailored interview questions WITH detailed ideal answers so the applicant can study.

Rules:
- Return ONLY valid JSON. No markdown, no code fences, no commentary.
- ideal_answer should be 2-4 sentences, concrete and specific to the role/company.
- tip should be one short sentence of actionable advice (e.g. "Use the STAR method here").
- Include a mix of Technical, Behavioral, Situational, Role-Specific, and Company Fit questions.
- Base questions on the Reddit experiences AND the internship context provided.`;

const INTERVIEW_PREP_SCHEMA = `{
  "questions": [
    {
      "question": "Tell me about a time you debugged a complex issue.",
      "category": "Behavioral",
      "difficulty": "Medium",
      "ideal_answer": "Describe the situation briefly, explain your systematic debugging steps, and emphasize the outcome and what you learned.",
      "tip": "Use the STAR method: Situation, Task, Action, Result."
    }
  ],
  "tips": [
    "Research the company's recent projects and mention them naturally.",
    "Prepare 2-3 questions to ask the interviewer at the end.",
    "Practice your answers out loud the night before."
  ]
}`;

function buildInterviewPrepPrompt(input: InterviewPrepInput): string {
  const skillsLine = input.requiredSkills.length
    ? `Required skills: ${input.requiredSkills.join(", ")}`
    : "No specific skills listed.";

  const redditSection = input.redditContext
    ? `\nREAL INTERVIEW EXPERIENCES FROM REDDIT (use these to shape realistic questions):\n${input.redditContext}`
    : "\nNo Reddit data available — use common knowledge for this company/role.";

  return `Generate 10 interview preparation questions for this internship.

INTERNSHIP DETAILS
Company: ${input.companyName}
Role: ${input.internshipTitle}
${skillsLine}
${redditSection}

Return JSON exactly matching this schema (10 questions):
${INTERVIEW_PREP_SCHEMA}`;
}

/* ------------------------------------------------------------------ */
/*  Main Generation Function                                            */
/* ------------------------------------------------------------------ */

/**
 * Generates interview prep questions + ideal answers using AI,
 * enriched by real Reddit interview experiences.
 */
export async function generateInterviewPrepContent(
  input: InterviewPrepInput,
  redditPosts: RedditPost[]
): Promise<InterviewPrepResult> {
  const redditContext = redditPosts
    .map((p, i) => `[${i + 1}] ${p.subreddit} — "${p.title}"\n${p.selftext}`)
    .join("\n\n");

  const sources = redditPosts.map(
    (p) => `${p.subreddit}: "${p.title}" — ${p.url}`
  );

  const prompt = buildInterviewPrepPrompt({ ...input, redditContext });

  const rawText = await generateJson(prompt, {
    systemInstruction: INTERVIEW_PREP_SYSTEM,
  });

  let parsed: { questions: InterviewPrepQuestion[]; tips: string[] };
  try {
    parsed = parseJsonFromModelText(rawText);
  } catch {
    throw new AiError(
      "JSON_PARSE",
      `Interview prep JSON could not be parsed: ${rawText.slice(0, 200)}`
    );
  }

  return {
    questions: parsed.questions ?? [],
    tips: parsed.tips ?? [],
    reddit_sources: sources,
  };
}
