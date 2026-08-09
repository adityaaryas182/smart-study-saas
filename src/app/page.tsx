// src/app/page.tsx
import Link from 'next/link'
import { BookOpen, Layers, BarChart3, ArrowRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './(auth)/actions'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // === Belum login: landing sederhana ===
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Smart Study &amp; Quiz
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Ubah materi belajarmu jadi kuis dengan AI, lalu ingat lebih lama
            dengan penjadwalan spaced repetition.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Masuk untuk mulai
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  // Ambil profil untuk sapaan + sisa kredit
  const { data: profile } = await supabase
    .from('users')
    .select('name, credits')
    .eq('id', user.id)
    .single()

  const displayName = profile?.name || user.email?.split('@')[0] || 'Kamu'

  // === Sudah login: hub ===
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Halo, {displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Siap belajar hari ini? Pilih salah satu di bawah.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              <span className="tabular-nums text-slate-900">{profile?.credits ?? 0}</span> kredit
            </span>
            <form action={signOut}>
              <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900">
                Keluar
              </button>
            </form>
          </div>
        </div>

        {/* Kartu aksi */}
        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            href="/study"
            icon={<BookOpen size={18} />}
            title="Mulai Belajar"
            desc="Kerjakan soal yang jatuh tempo hari ini."
            primary
          />
          <ActionCard
            href="/materials"
            icon={<Layers size={18} />}
            title="Kelola Materi"
            desc="Tambah materi dan buat kuis dengan AI."
          />
          <ActionCard
            href="/dashboard"
            icon={<BarChart3 size={18} />}
            title="Lihat Progres"
            desc="Pantau penguasaan dan jadwal review."
          />
        </div>
      </main>
    </div>
  )
}

function ActionCard({
  href, icon, title, desc, primary,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl border p-6 shadow-sm transition ${
        primary
          ? 'border-slate-900 bg-slate-900 hover:bg-slate-800'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span className={primary ? 'text-slate-400' : 'text-slate-300'}>{icon}</span>
      <h2
        className={`mt-4 font-semibold tracking-tight ${
          primary ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      <p className={`mt-1.5 text-sm leading-relaxed ${primary ? 'text-slate-400' : 'text-slate-500'}`}>
        {desc}
      </p>
      <span
        className={`mt-4 inline-flex items-center gap-1 text-xs font-medium ${
          primary ? 'text-white' : 'text-slate-900'
        }`}
      >
        Buka
        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}