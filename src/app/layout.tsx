// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'   // WAJIB tetap ada — ini yang memuat Tailwind

export const metadata: Metadata = {
  title: 'Smart Study & Quiz',
  description: 'AI-Powered Smart Study & Quiz Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}