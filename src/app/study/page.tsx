// src/app/study/page.tsx

import { Inter } from 'next/font/google'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

import AppShell from '../(app)/AppShell'
import StudySession from './StudySession'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default async function StudyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let credits = 0

  // Tidak mengubah flow auth Study.
  // Hanya membaca kredit untuk AppNav.
  if (user) {
    const admin = createAdminClient()

    const { data: profile } =
      await admin
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

    credits = profile?.credits ?? 0
  }

  return (
    <AppShell credits={credits}>
      {/* Study sengaja tetap white canvas */}
      <div
        className={`${inter.className} min-h-[calc(100vh-8rem)] bg-white`}
      >
        <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-12">
          <StudySession />
        </main>
      </div>
    </AppShell>
  )
}