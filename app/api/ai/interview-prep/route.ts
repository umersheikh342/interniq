import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitOrNull } from "@/lib/api/rate-limit";
import { runAiOperation } from "@/lib/ai/service";
import {
  fetchRedditInterviewPosts,
  generateInterviewPrepContent,
} from "@/lib/ai/interview-prep";

/**
 * POST /api/ai/interview-prep
 *
 * Fetches real Reddit interview experiences for the given company/role,
 * then uses AI to generate 10 tailored Q&A pairs the applicant can study.
 *
 * Body: { applicationId, internshipTitle, companyName, requiredSkills? }
 */
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimitOrNull(req);
    if (limited) return limited;

    // Auth — applicant only
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Verify the user is an applicant
    const { data: profile } = await supabase
      .from("applicant_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Applicant profile not found." }, { status: 403 });
    }

    const body = await req.json();
    const { internshipTitle, companyName, requiredSkills = [] } = body;

    if (!internshipTitle || !companyName) {
      return NextResponse.json(
        { error: "internshipTitle and companyName are required." },
        { status: 400 }
      );
    }

    // ── Step 1: Scrape Reddit (best-effort, non-blocking on failure) ──────────
    let redditPosts: Awaited<ReturnType<typeof fetchRedditInterviewPosts>> = [];
    try {
      redditPosts = await fetchRedditInterviewPosts(companyName, internshipTitle);
    } catch {
      // Reddit fetch failed — AI will fall back to general knowledge
    }

    // ── Step 2: Generate AI questions + answers ───────────────────────────────
    const result = await runAiOperation("applicantInterviewPrep", () =>
      generateInterviewPrepContent(
        { internshipTitle, companyName, requiredSkills, redditContext: "" },
        redditPosts
      )
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "AI generation failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...result.data,
      company: companyName,
      role: internshipTitle,
      reddit_count: redditPosts.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
