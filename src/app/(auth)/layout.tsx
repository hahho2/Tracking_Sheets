import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-surface-card neo-raised flex items-center justify-center text-primary">
          <Terminal className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            CodeTrack
          </span>
          <span className="text-sm font-semibold text-foreground">
            Revision &amp; Progress Platform
          </span>
        </div>
      </div>

      <div className="w-full max-w-md">{children}</div>

      <footer className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CodeTrack. All rights reserved.
      </footer>
    </div>
  );
}
