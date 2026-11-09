"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { InterviewPrepQuestion, InterviewPrepResult } from "@/lib/ai/interview-prep";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Application {
  id: string;
  status: string;
  internships: {
    title: string;
    company_name: string;
    required_skills?: string[];
    deadline?: string;
  } | null;
}

interface InterviewPrepClientProps {
  interviewApplications: Application[];
}

type SelfRating = "needs_work" | "ok" | "nailed_it" | null;

/* ------------------------------------------------------------------ */
/*  Question Card                                                       */
/* ------------------------------------------------------------------ */

function QuestionCard({
  q,
  index,
}: {
  q: InterviewPrepQuestion;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [rating, setRating] = useState<SelfRating>(null);

  const difficultyColor = {
    Easy: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30",
    Medium: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30",
    Hard: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30",
  }[q.difficulty];

  const categoryColor: Record<string, string> = {
    Technical: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30",
    Behavioral: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/30",
    Situational: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30",
    "Role-Specific": "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/15 border-teal-200 dark:border-teal-500/30",
    "Company Fit": "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/15 border-orange-200 dark:border-orange-500/30",
  };

  const catColor =
    categoryColor[q.category] ??
    "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 shadow-card overflow-hidden transition-all">
      {/* Header row */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Number bubble */}
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal to-emerald text-white text-sm font-bold flex items-center justify-center shadow-teal/20 shadow-md">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border", catColor)}>
              {q.category}
            </span>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border", difficultyColor)}>
              {q.difficulty}
            </span>
            {rating && (
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border",
                rating === "nailed_it" ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30" :
                rating === "ok" ? "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30" :
                "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30"
              )}>
                {rating === "nailed_it" ? <CheckCircle2 className="w-3 h-3" /> : rating === "ok" ? <MinusCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {rating === "nailed_it" ? "Nailed it!" : rating === "ok" ? "OK" : "Needs work"}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-text-primary dark:text-white leading-snug pr-4">
            {q.question}
          </p>
        </div>

        <span className="flex-shrink-0 text-text-muted dark:text-slate-500 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border dark:border-slate-700">
          {/* AI Tip */}
          <div className="flex gap-2 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">{q.tip}</p>
          </div>

          {/* Practice answer textarea */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Your Practice Answer
            </label>
            <textarea
              className="w-full rounded-xl border border-border dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-text-primary dark:text-white placeholder-text-muted dark:placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal/40 resize-none transition-colors"
              rows={4}
              placeholder="Type your answer here to practice before revealing the ideal answer…"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
          </div>

          {/* Reveal / Hide ideal answer */}
          <button
            onClick={() => setShowAnswer((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal dark:text-teal hover:underline"
          >
            {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswer ? "Hide ideal answer" : "Reveal ideal answer"}
          </button>

          {showAnswer && (
            <div className="p-4 rounded-xl bg-teal-light/50 dark:bg-teal/10 border border-teal/20 dark:border-teal/30">
              <p className="text-xs font-semibold text-teal-dark dark:text-teal uppercase tracking-wide mb-2">
                Ideal Answer
              </p>
              <p className="text-sm text-text-primary dark:text-slate-200 leading-relaxed">
                {q.ideal_answer}
              </p>
            </div>
          )}

          {/* Self-rating */}
          {showAnswer && (
            <div>
              <p className="text-xs font-semibold text-text-secondary dark:text-slate-400 mb-2 uppercase tracking-wide">
                How did you do?
              </p>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { key: "needs_work", label: "😕 Needs Work", active: "bg-rose-100 border-rose-400 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400 dark:text-rose-300" },
                    { key: "ok", label: "😐 OK", active: "bg-amber-100 border-amber-400 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400 dark:text-amber-300" },
                    { key: "nailed_it", label: "😊 Nailed It!", active: "bg-emerald-100 border-emerald-400 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400 dark:text-emerald-300" },
                  ] as const
                ).map(({ key, label, active }) => (
                  <button
                    key={key}
                    onClick={() => setRating(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                      rating === key
                        ? active
                        : "border-border dark:border-slate-600 text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Client Component                                               */
/* ------------------------------------------------------------------ */

export default function InterviewPrepClient({ interviewApplications }: InterviewPrepClientProps) {
  const [selectedId, setSelectedId] = useState<string>(
    interviewApplications[0]?.id ?? ""
  );
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedApp = interviewApplications.find((a) => a.id === selectedId);

  const generate = useCallback(async () => {
    if (!selectedApp?.internships) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          internshipTitle: selectedApp.internships.title,
          companyName: selectedApp.internships.company_name,
          requiredSkills: selectedApp.internships.required_skills ?? [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prep material.");
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [selectedApp]);

  /* ── Empty state ── */
  if (interviewApplications.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-card border border-border dark:border-slate-700 flex flex-col items-center">
        <div className="w-16 h-16 bg-teal-light dark:bg-teal/15 text-teal-dark dark:text-teal rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-primary dark:text-white mb-2">
          No Upcoming Interviews
        </h2>
        <p className="text-text-secondary dark:text-slate-400 max-w-md mx-auto">
          Interview Prep unlocks when one of your applications reaches the{" "}
          <strong>Interview Stage</strong>. Keep applying — you're almost there!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application selector + generate button */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border dark:border-slate-700 shadow-card flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Preparing for
          </label>
          {interviewApplications.length === 1 ? (
            <div>
              <p className="font-semibold text-text-primary dark:text-white">
                {selectedApp?.internships?.title}
              </p>
              <p className="text-sm text-text-secondary dark:text-slate-400">
                {selectedApp?.internships?.company_name}
              </p>
            </div>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setResult(null); setError(null); }}
              className="w-full rounded-xl border border-border dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-text-primary dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40"
            >
              {interviewApplications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.internships?.title} @ {app.internships?.company_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <Button
          variant="gradient"
          onClick={generate}
          disabled={loading}
          className="gap-2 shrink-0"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
          ) : result ? (
            <><RefreshCw className="w-4 h-4" /> Regenerate</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Prep</>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-sm text-rose-700 dark:text-rose-400 flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
                    <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Quick Tips */}
          {result.tips.length > 0 && (
            <div className="bg-gradient-to-br from-teal/5 to-emerald/5 dark:from-teal/10 dark:to-emerald/10 rounded-2xl p-5 border border-teal/20 dark:border-teal/30">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-teal" />
                <h3 className="font-semibold text-teal-dark dark:text-teal text-sm">
                  Quick Prep Tips
                </h3>
              </div>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-border dark:border-slate-700 text-sm">
              <span className="font-bold text-teal">{result.questions.length}</span>
              <span className="text-text-secondary dark:text-slate-400 ml-1">questions</span>
            </div>
            {result.reddit_sources.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-border dark:border-slate-700 text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0C4.478 0 0 4.478 0 10c0 5.523 4.478 10 10 10 5.523 0 10-4.477 10-10S15.523 0 10 0zm5.864 11.166c.028.183.042.37.042.556 0 2.853-3.322 5.166-7.42 5.166-4.097 0-7.419-2.313-7.419-5.166 0-.186.014-.373.042-.556a1.388 1.388 0 0 1-.528-2.701 1.388 1.388 0 0 1 1.666.665c.924-.575 2.09-.95 3.368-1.03l.624-2.909a.278.278 0 0 1 .329-.214l2.055.43A.972.972 0 0 1 10.556 6a.972.972 0 1 1-.944 1.192l-1.847-.386-.549 2.555c1.258.09 2.396.465 3.303 1.03a1.388 1.388 0 0 1 2.676.69 1.388 1.388 0 0 1-.89 1.3c.03.182.044.368.044.555 0 2.853-3.322 5.166-7.42 5.166.001 0 0 0 0 0zM6.806 11.806a.972.972 0 1 0 0 1.944.972.972 0 0 0 0-1.944zm6.388 0a.972.972 0 1 0 0 1.944.972.972 0 0 0 0-1.944zm-3.75 3.75c-.742 0-1.666-.3-2.166-.8a.278.278 0 0 1 .393-.393c.4.4 1.165.636 1.773.636.608 0 1.374-.236 1.773-.636a.277.277 0 0 1 .394.393c-.5.5-1.424.8-2.167.8z" />
                </svg>
                <span className="font-bold text-orange-500">{result.reddit_sources.length}</span>
                <span className="text-text-secondary dark:text-slate-400">Reddit posts sourced</span>
              </div>
            )}
          </div>

          {/* Question cards */}
          <div className="space-y-3">
            {result.questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </div>

          {/* Reddit sources disclosure */}
          {result.reddit_sources.length > 0 && (
            <details className="bg-white dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 overflow-hidden">
              <summary className="px-5 py-3 text-xs font-semibold text-text-secondary dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2 uppercase tracking-wide">
                <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0C4.478 0 0 4.478 0 10c0 5.523 4.478 10 10 10 5.523 0 10-4.477 10-10S15.523 0 10 0zm5.864 11.166c.028.183.042.37.042.556 0 2.853-3.322 5.166-7.42 5.166-4.097 0-7.419-2.313-7.419-5.166 0-.186.014-.373.042-.556a1.388 1.388 0 0 1-.528-2.701 1.388 1.388 0 0 1 1.666.665c.924-.575 2.09-.95 3.368-1.03l.624-2.909a.278.278 0 0 1 .329-.214l2.055.43A.972.972 0 0 1 10.556 6a.972.972 0 1 1-.944 1.192l-1.847-.386-.549 2.555c1.258.09 2.396.465 3.303 1.03a1.388 1.388 0 0 1 2.676.69 1.388 1.388 0 0 1-.89 1.3c.03.182.044.368.044.555 0 2.853-3.322 5.166-7.42 5.166.001 0 0 0 0 0zM6.806 11.806a.972.972 0 1 0 0 1.944.972.972 0 0 0 0-1.944zm6.388 0a.972.972 0 1 0 0 1.944.972.972 0 0 0 0-1.944zm-3.75 3.75c-.742 0-1.666-.3-2.166-.8a.278.278 0 0 1 .393-.393c.4.4 1.165.636 1.773.636.608 0 1.374-.236 1.773-.636a.277.277 0 0 1 .394.393c-.5.5-1.424.8-2.167.8z" />
                </svg>
                Reddit Sources ({result.reddit_sources.length} posts)
              </summary>
              <ul className="px-5 pb-4 space-y-1.5 border-t border-border dark:border-slate-700 pt-3">
                {result.reddit_sources.map((src, i) => {
                  const urlMatch = src.match(/https?:\/\/\S+/);
                  const url = urlMatch?.[0] ?? "#";
                  const label = src.replace(url, "").trim();
                  return (
                    <li key={i} className="text-xs text-text-muted dark:text-slate-500">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal dark:hover:text-teal inline-flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        {label || src}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
        </>
      )}

      {/* Initial CTA when nothing generated yet */}
      {!result && !loading && !error && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-border dark:border-slate-700 p-10 text-center">
          <div className="w-14 h-14 bg-teal-light dark:bg-teal/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-teal" />
          </div>
          <h3 className="font-display font-bold text-lg text-primary dark:text-white mb-2">
            Ready to ace your interview?
          </h3>
          <p className="text-sm text-text-secondary dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Click <strong>Generate Prep</strong> and we'll scan Reddit for real
            interview experiences at{" "}
            <strong>{selectedApp?.internships?.company_name}</strong>, then craft
            10 tailored Q&amp;A pairs to help you prepare.
          </p>
          <Button variant="gradient" onClick={generate} className="gap-2">
            <Sparkles className="w-4 h-4" /> Generate Prep
          </Button>
        </div>
      )}
    </div>
  );
}
