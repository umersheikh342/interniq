import { redirect } from "next/navigation";
import { getUserFromHeaders, createClient } from "@/lib/supabase/server";
import { getApplicantRecommendations } from "@/lib/ai/recommendations";
import JobAlertsClient from "./JobAlertsClient";

export const dynamic = "force-dynamic";

export default async function JobAlertsPage() {
  const user = getUserFromHeaders();
  if (!user) redirect("/applicant-auth");
  const { recommendations } = await getApplicantRecommendations(createClient(), user.id, user.email);
  return <JobAlertsClient jobs={recommendations} />;
}
