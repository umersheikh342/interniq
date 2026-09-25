"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Search,
  Briefcase,
  Bookmark,
  FileText,
  Settings,
  Menu,
  X,
  ChevronRight,
  Bell,
  GraduationCap,
  MessageSquareText,
  Building2,
  Code2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/applicant", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/applicant/resume", label: "CV optimizer", icon: FileText },
  { href: "/applicant/profile", label: "Profile & skills", icon: UserCircle },
  { href: "/applicant/settings", label: "GitHub & LinkedIn", icon: Code2 },
  { href: "/applicant/internships", label: "Job search", icon: Search },
  { href: "/applicant/job-alerts", label: "Job alerts", icon: Bell },
  { href: "/applicant/interview-prep", label: "Interview questions", icon: MessageSquareText },
  { href: "/applicant/roadmap", label: "Course roadmap", icon: GraduationCap },
  { href: "/applicant/saved", label: "Saved jobs", icon: Bookmark },
  { href: "/applicant/applications", label: "Applications", icon: Briefcase },
  { href: "/applicant/preferences", label: "Companies & skills", icon: Building2 },
  { href: "/applicant/settings", label: "Settings", icon: Settings },
];

export default function ApplicantSidebar({
  userEmail,
  userName,
}: {
  userEmail?: string;
  userName?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 py-3 backdrop-blur shadow-subtle">
        <Link href="/applicant" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-teal shadow-subtle">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3" />
                <path d="M12 8v8" />
                <path d="M8 20l4-4 4 4" />
              </svg>
              <div className="absolute -top-1 -right-1 h-2 w-2">
                <svg viewBox="0 0 12 12" className="h-full w-full text-teal" fill="currentColor">
                  <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
                </svg>
              </div>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-primary dark:text-white">
              Intern<span className="text-gradient">IQ</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl border border-border dark:border-slate-700 p-2 text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar & Mobile Sliding Drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-sidebar dark:bg-slate-950 text-white transition-all duration-200 border-r border-white/10",
          // Mobile state
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          // Desktop collapsed state
          collapsed ? "lg:w-16" : "lg:w-56"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 dark:border-slate-800">
          <Link href="/applicant" className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-teal shadow-subtle shrink-0">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3" />
                <path d="M12 8v8" />
                <path d="M8 20l4-4 4 4" />
              </svg>
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5">
                <svg viewBox="0 0 12 12" className="h-full w-full text-teal" fill="currentColor">
                  <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
                </svg>
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display text-xl font-extrabold tracking-tight text-white">
                  Intern<span className="text-gradient">IQ</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-teal">
                  Applicant Portal
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            title="Toggle Sidebar"
          >
            <ChevronRight
              className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-180")}
            />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto" aria-label="Applicant navigation">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors group relative",
                  isActive
                    ? "bg-gradient-primary text-white shadow-teal font-semibold"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                  </>
                )}
                {isActive && !collapsed && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-white shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Applicant Profile / Bottom Panel */}
        <div className="border-t border-white/10 dark:border-slate-800 p-4 space-y-3">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Display
              </span>
              <ThemeToggle />
            </div>
          )}

          {!collapsed && (userEmail || userName) && (
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/20 text-teal font-bold font-mono text-sm border border-teal/30 shrink-0">
                {(userName || userEmail || "A")[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {userName || "Applicant Account"}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {userEmail}
                </span>
              </div>
            </div>
          )}

          <div className={cn("flex", collapsed ? "flex-col items-center gap-2" : "justify-between")}>
            <LogoutButton collapsed={collapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
