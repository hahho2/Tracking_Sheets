import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppStoreProvider } from "@/lib/store";
import { ToastContainer } from "@/components/ui/toast";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "CodeTrack — Coding Progress & Spaced Revision Tracker",
  description:
    "Track DSA, SQL, and programming language problems with rich notes, spaced repetition revisions, and study streak analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-400">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppStoreProvider>
            {children}
            <ToastContainer />
          </AppStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

