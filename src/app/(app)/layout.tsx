import React, { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <div className="flex min-h-screen flex-col bg-background text-foreground"><Suspense fallback={<div className="h-16 border-b border-border/40" />}><AppHeader /></Suspense><div className="flex flex-1 w-full"><Suspense fallback={<aside className="hidden lg:flex w-64 border-r border-border/40" />}><AppSidebar /></Suspense><main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main></div><MobileNav /></div>;
}
