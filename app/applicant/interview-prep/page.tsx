import { createClient } from "@/lib/supabase/server";
import { getApplicantApplications } from "@/lib/queries/applicant";
import InterviewPrepClient from "./InterviewPrepClient";
import { CalendarCheck, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InterviewPrepPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: applications } = await getApplicantApplications(
    supabase,
    user.email || ""
  );

  // Only surface applications that are in the interview stage
  const interviewApps = (applications ?? []).filter(
    (app: any) => app.status === "interview"
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal to-emerald flex items-center justify-center shadow-teal/20 shadow-md">
              <CalendarCheck className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-primary dark:text-white">
              Interview Prep
            </h1>
          </div>
          <p className="text-text-secondary dark:text-slate-400 mt-1 ml-10">
            AI-powered practice questions sourced from real Reddit interview
            experiences — tailored to your internship.
          </p>
        </div>
      </div>

      {/* How it works info banner */}
      <div className="flex gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>How it works:</strong> We scan Reddit communities like{" "}
          <strong>r/cscareerquestions</strong> and <strong>r/internships</strong>{" "}
          for real interview experiences at your target company, then use AI to
          generate 10 tailored questions with ideal model answers you can study
          and self-rate.
        </span>
      </div>

      {/* Main interactive section */}
      <InterviewPrepClient interviewApplications={interviewApps} />
    </div>
  );
}
