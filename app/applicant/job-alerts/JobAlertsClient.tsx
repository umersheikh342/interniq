"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Building2, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RecommendationResult } from "@/lib/ai/recommendations";
import { toast } from "sonner";

type Props = { jobs: RecommendationResult[] };
type Preferences = { desired_companies?: string[]; target_skills?: string[]; job_alerts_enabled?: boolean };

export default function JobAlertsClient({ jobs }: Props) {
  const supabase = createClient();
  const [preferences, setPreferences] = useState<Preferences>({});
  const [ready, setReady] = useState(false);
  const companies = preferences.desired_companies ?? [];
  const skills = preferences.target_skills ?? [];
  const matches = useMemo(() => jobs.filter((job) => {
    const companyMatch = companies.some((company) => job.company_name.toLowerCase().includes(company.toLowerCase()));
    const skillMatch = skills.some((skill) => [...job.required_skills, ...job.preferred_skills].some((item) => item.toLowerCase() === skill.toLowerCase()));
    return companyMatch || skillMatch;
  }), [jobs, companies, skills]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setPreferences((data.user?.user_metadata ?? {}) as Preferences);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !preferences.job_alerts_enabled || !matches.length || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    matches.slice(0, 3).forEach((job) => {
      const key = `job-alert-seen:${job.id}`;
      if (localStorage.getItem(key)) return;
      new Notification("New internship matches your preferences", { body: `${job.title} at ${job.company_name}` });
      localStorage.setItem(key, "1");
    });
  }, [ready, preferences.job_alerts_enabled, matches]);

  async function toggleAlerts() {
    if (!preferences.job_alerts_enabled) {
      if (typeof Notification === "undefined") { toast.error("Browser notifications are not supported here."); return; }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { toast.error("Allow notifications in your browser to enable job alerts."); return; }
    }
    const enabled = !preferences.job_alerts_enabled;
    const { error } = await supabase.auth.updateUser({ data: { job_alerts_enabled: enabled } });
    if (error) toast.error(error.message);
    else { setPreferences((current) => ({ ...current, job_alerts_enabled: enabled })); toast.success(enabled ? "Job alerts enabled" : "Job alerts paused"); }
  }

  return <div className="mx-auto max-w-4xl space-y-5">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-teal">Personalized search</p><h1 className="mt-1 text-2xl font-bold text-primary dark:text-white">Job alerts</h1><p className="mt-1 text-sm text-text-secondary">Open this page to see internships matching your target companies and skills. Browser notifications are sent for new matches while you use the app.</p></header>
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800">
      <div className="flex items-start gap-3"><Bell className="mt-0.5 h-5 w-5 text-teal"/><div><p className="text-sm font-semibold text-primary dark:text-white">Browser alerts {preferences.job_alerts_enabled ? "on" : "off"}</p><p className="text-xs text-text-secondary">Notifications are deduplicated for each matching internship.</p></div></div>
      <button type="button" onClick={toggleAlerts} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">{preferences.job_alerts_enabled ? "Pause alerts" : "Enable alerts"}</button>
    </section>
    {!companies.length && !skills.length ? <Link href="/applicant/preferences" className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-teal hover:bg-slate-50"><Building2 className="h-4 w-4"/>Add target companies or skills to personalize alerts</Link> : null}
    <div className="flex items-center justify-between"><h2 className="font-semibold text-primary dark:text-white">Matching opportunities</h2><span className="text-xs text-text-muted">{matches.length} matches</span></div>
    {!matches.length ? <div className="rounded-2xl border border-border bg-white p-8 text-center dark:bg-slate-800"><Briefcase className="mx-auto h-6 w-6 text-text-muted"/><p className="mt-2 text-sm text-text-secondary">No open internships match your preferences yet.</p><Link href="/applicant/internships" className="mt-3 inline-block text-sm font-medium text-teal">Browse all jobs</Link></div> : <div className="space-y-2">{matches.map((job) => <Link key={job.id} href={job.public_slug ? `/internships/${job.public_slug}` : "/applicant/internships"} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4 hover:border-teal/50 dark:bg-slate-800"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-primary dark:text-white">{job.title}</span><span className="mt-1 block truncate text-xs text-text-secondary">{job.company_name} · {job.location || "Location flexible"}</span></span><span className="shrink-0 text-xs text-teal">View role →</span></Link>)}</div>}
  </div>;
}
