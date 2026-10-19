import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Barlow_Condensed({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const body = IBM_Plex_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "ThrottleDex", template: "%s · ThrottleDex" },
  description: "The car people real enthusiasts send their friends to, one city at a time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex w-full max-w-[920px] items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-display text-xl font-bold uppercase tracking-wide text-ink no-underline">
              ThrottleDex
            </Link>
            <nav className="flex items-center gap-4 text-[13.5px]">
              <Link href="/nyc" className="text-ink-2 hover:text-ink">NYC</Link>
              <Link href="/dashboard" className="text-ink-2 hover:text-ink">Your list</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[920px] flex-1 px-4 pt-7 pb-14">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto w-full max-w-[920px] px-4 py-5 font-mono text-[12px] text-ink-3">
            Nobody pays to be on a list. Curators vouch with their own name.
          </div>
        </footer>
      </body>
    </html>
  );
}
