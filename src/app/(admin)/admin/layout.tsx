import { requireAdmin } from "@/lib/auth";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { await requireAdmin(); return <main className="min-h-screen max-w-6xl mx-auto p-6 sm:p-10">{children}</main>; }
