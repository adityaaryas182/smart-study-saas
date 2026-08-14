// src/app/(app)/AppFooter.tsx

import {
    Code2,
    Sparkles,
  } from 'lucide-react'
  
  const GITHUB_URL =
    'https://github.com/adityaaryas182/smart-study-saas'
  
  export default function AppFooter() {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Sparkles
                size={13}
                strokeWidth={2.2}
              />
            </span>
  
            <span className="text-xs font-semibold text-slate-600">
              Smart Study &amp; Quiz
            </span>
          </div>
  
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 self-start rounded-md text-xs font-medium text-slate-400 transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 sm:self-auto"
          >
            <Code2 size={13} />
            Source code
          </a>
        </div>
      </footer>
    )
  }