"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, Lock, HelpCircle, ArrowLeft } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import FormNotice from "@/components/ui/FormNotice";
import OtpVerifyForm from "@/components/auth/OtpVerifyForm";
import { createClient } from "@/lib/supabase/client";
import {
  verifyRecaptcha,
  recaptchaErrorMessage,
} from "@/lib/recaptcha/client";
import { safeRedirectPath } from "@/lib/utils";

type Step = "email" | "otp";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  async function sendLoginOtp(targetEmail: string): Promise<string | null> {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return otpError?.message ?? null;
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    // Guard against double-click / Enter+click / rapid resubmits: a second
    // signInWithOtp() call would issue a fresh code and invalidate the one
    // already in the user's inbox.
    if (status === "loading") return;
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address to continue.");
      return;
    }

    setStatus("loading");

    const check = await verifyRecaptcha("login");
    if (!check.ok) {
      setStatus("idle");
      setError(recaptchaErrorMessage());
      return;
    }

    const otpError = await sendLoginOtp(trimmed);
    setStatus("idle");

    if (otpError) {
      console.error("Supabase OTP error:", otpError);
      setError(otpError);
      return;
    }

    setStep("otp");
  }

  async function handleVerifyOtp(token: string): Promise<string | null> {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "email",
    });

    if (verifyError) {
      // GoTrue returns "Token has expired or is invalid" for any code that no
      // longer matches the latest one — usually a stale/superseded code rather
      // than a genuinely expired one. Give a clearer explanation without
      // changing backend behavior.
      return /expired or is invalid/i.test(verifyError.message)
        ? "That code is invalid or has already been replaced. Check the most recent email or request a new code."
        : verifyError.message;
    }

    const next = safeRedirectPath(searchParams.get("next"), "/dashboard");
    router.push(next);
    router.refresh();
    return null;
  }

  async function handleResendOtp(): Promise<string | null> {
    return sendLoginOtp(email.trim());
  }

  async function handleGoogleLogin() {
    setError(null);

    setStatus("loading");
    const check = await verifyRecaptcha("google_oauth");
    if (!check.ok) {
      setStatus("idle");
      setError(recaptchaErrorMessage());
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setStatus("idle");
      setError(error.message);
    }
  }

  async function handleGithubLogin() {
    setError(null);
    setStatus("loading");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setStatus("idle");
      setError(error.message);
    }
  }

  async function handleLinkedInLogin() {
    setError(null);
    setStatus("loading");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setStatus("idle");
      setError(error.message);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address to reset your password.");
      return;
    }

    setStatus("loading");

    const check = await verifyRecaptcha("password_reset");
    if (!check.ok) {
      setStatus("idle");
      setError(recaptchaErrorMessage());
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setStatus("idle");

    if (resetError) {
      setError(resetError.message);
    } else {
      setError("Password reset link sent! Check your email.");
      // Optional: you could use a success state or toast here if available.
    }
  }

  return (
    <Shell>
      <div className="mx-auto flex min-h-[calc(100vh-160px)] items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
          {/* Brand Card Top Banner */}
          <div className="bg-primary p-6 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial-ai opacity-30 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-teal">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight">
                InternIQ Workspace
              </h1>
              <p className="font-mono text-xs text-teal">
                Discover Potential. Create Impact.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-primary">
                {isForgotPassword 
                  ? "Reset Password" 
                  : step === "email" 
                    ? "Recruiter Sign In" 
                    : "Verify Authentication Code"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                {isForgotPassword
                  ? "Enter your email to receive a password reset link."
                  : step === "email"
                    ? "Enter your work email to receive a secure one-time passcode."
                    : "We sent a 6-digit passcode to your email inbox."}
              </p>
            </div>

            {/* OAUTH SIGN-IN BUTTONS */}
            {step === "email" && !isForgotPassword && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-slate-50 py-2.5 px-4 text-xs sm:text-sm font-semibold text-text-primary hover:bg-slate-100 transition-colors shadow-subtle disabled:opacity-50"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-slate-50 py-2.5 px-4 text-xs sm:text-sm font-semibold text-text-primary hover:bg-slate-100 transition-colors shadow-subtle disabled:opacity-50"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                  </svg>
                  <span>Continue with GitHub</span>
                </button>

                <button
                  type="button"
                  onClick={handleLinkedInLogin}
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-slate-50 py-2.5 px-4 text-xs sm:text-sm font-semibold text-text-primary hover:bg-slate-100 transition-colors shadow-subtle disabled:opacity-50"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>Continue with LinkedIn</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-border" />
                  <span className="bg-white px-3 font-mono text-[10px] uppercase text-text-muted">
                    or email login
                  </span>
                </div>
              </div>
            )}


            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {error && <FormNotice tone={error.includes("sent") ? "success" : "error"}>{error}</FormNotice>}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                    <span>Work Email Address</span>
                    <Mail className="h-3.5 w-3.5 text-text-muted" />
                  </label>
                  <input
                    type="email"
                    placeholder="recruiter@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-slate-50/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full py-3"
                  isLoading={status === "loading"}
                >
                  Send Reset Link
                </Button>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError(null);
                    }}
                    className="text-xs text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5 font-medium"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                  </button>
                </div>
              </form>
            ) : step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                {error && <FormNotice tone="error">{error}</FormNotice>}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                    <span>Work Email Address</span>
                    <Mail className="h-3.5 w-3.5 text-text-muted" />
                  </label>
                  <input
                    type="email"
                    placeholder="recruiter@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-slate-50/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full py-3"
                  isLoading={status === "loading"}
                >
                  Send One-Time Passcode
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                    }}
                    className="text-xs text-teal font-medium hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <OtpVerifyForm
                  email={email.trim()}
                  onVerify={handleVerifyOtp}
                  onResend={handleResendOtp}
                  verifyLabel="Authenticate & Log In"
                  hint="We sent your 6-digit login code to"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Use a different email address
                </button>
              </div>
            )}

            {/* FORGOT SIGN-IN HELP SECTION PLACEHOLDER */}
            <div className="border-t border-border pt-4 text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-teal transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Need sign-in assistance?</span>
              </button>

              {showHelp && (
                <div className="rounded-xl border border-border bg-slate-50 p-3 text-left text-xs text-text-secondary space-y-1">
                  <p className="font-semibold text-text-primary">Recruiter Access Tips:</p>
                  <p>• Make sure to check your spam/junk folder for the OTP code.</p>
                  <p>• If you don&apos;t have an account, sign up first.</p>
                </div>
              )}

              <p className="text-xs text-text-secondary dark:text-slate-300 pt-1">
                No recruiter workspace yet?{" "}
                <Link href="/signup" className="font-bold text-teal-dark dark:text-teal-300 hover:underline">
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-text-secondary dark:text-slate-300 pt-1">
                Looking for internships instead?{" "}
                <Link href="/applicant-auth" className="font-bold text-purple-ai dark:text-purple-300 hover:underline">
                  Applicant Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
