import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  content: string;
}

export function LegalPageLayout({ title, lastUpdated, content }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] dark:bg-neutral-950">
      <header className="bg-[var(--color-purple-dark)] text-white">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
            Hammet
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 sm:p-12">
          <h1 className="font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            {title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
            Last updated: {lastUpdated}
          </p>

          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h2 className="font-heading text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-10 mb-4 first:mt-0">
                  {children}
                </h2>
              ),
              h2: ({ children }) => (
                <h3 className="font-heading text-lg font-semibold text-neutral-900 dark:text-neutral-50 mt-8 mb-3">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="font-heading text-base font-semibold text-neutral-800 dark:text-neutral-100 mt-6 mb-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-600 dark:text-neutral-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-2 mb-4 text-sm text-neutral-600 dark:text-neutral-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[var(--color-purple)] underline underline-offset-2 hover:no-underline"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-neutral-700 dark:text-neutral-300">
                  {children}
                </em>
              ),
              hr: () => <hr className="my-8 border-neutral-200 dark:border-neutral-800" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} HammetLabs. All rights reserved.
      </footer>
    </div>
  );
}