import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/Toaster";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
});

export const metadata: Metadata = {
  title: "Puzzle Club",
  description:
    "A community of curious minds. Share puzzles, solve them, leave a note.",
};

const themeScript = `(function(){try{var t=localStorage.getItem("puzzle-club-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <ToastProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-6 pb-12">{children}</main>
          <footer className="pb-10 text-center text-sm text-muted">
            A little space for people who like to figure things out.
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}