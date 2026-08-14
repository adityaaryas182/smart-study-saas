// src/app/page.tsx

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BookText,
  CalendarClock,
  CircleCheck,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react'
import {
  Inter,
  Space_Grotesk,
} from 'next/font/google'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LandingPage from './LandingPage'
import MiniReviewChart from './MiniReviewChart'
import AppShell from './(app)/AppShell'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

type UpcomingReview = {
  review_day: string
  jumlah: number
}

type DashboardStats = {
  total_materials: number
  total_questions: number
  due_today: number
  mastered: number
  in_progress: number
  upcoming: UpcomingReview[]
}

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Landing JANGAN diubah.
  if (!user) {
    return <LandingPage />
  }

  const admin = createAdminClient()

  const [
    profileResult,
    dashboardResult,
    materialsResult,
  ] = await Promise.all([
    admin
      .from('users')
      .select('name, credits')
      .eq('id', user.id)
      .single(),

    admin.rpc('get_dashboard', {
      p_user_id: user.id,
    }),

    admin
      .from('materials')
      .select(
        'id, title, created_at, questions(count)'
      )
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      })
      .limit(3),
  ])

  if (profileResult.error) {
    console.log(
      '[home] profile error:',
      profileResult.error.message
    )
  }

  if (dashboardResult.error) {
    console.log(
      '[home] dashboard error:',
      dashboardResult.error.message
    )
  }

  if (materialsResult.error) {
    console.log(
      '[home] recent materials error:',
      materialsResult.error.message
    )
  }

  const profile = profileResult.data

  const rawStats =
    (dashboardResult.data ??
      {}) as unknown as Partial<DashboardStats>

  const stats: DashboardStats = {
    total_materials: Number(
      rawStats.total_materials ?? 0
    ),
    total_questions: Number(
      rawStats.total_questions ?? 0
    ),
    due_today: Number(
      rawStats.due_today ?? 0
    ),
    mastered: Number(
      rawStats.mastered ?? 0
    ),
    in_progress: Number(
      rawStats.in_progress ?? 0
    ),
    upcoming: Array.isArray(
      rawStats.upcoming
    )
      ? rawStats.upcoming
      : [],
  }

  const recentMaterials =
    materialsResult.data ?? []

  const displayName =
    profile?.name ||
    user.email?.split('@')[0] ||
    'Kamu'

  // =====================================================
  // CHART
  // =====================================================
  const byDay = new Map(
    stats.upcoming.map((item) => [
      item.review_day.slice(0, 10),
      Number(item.jumlah),
    ])
  )

  const chartData = Array.from(
    {
      length: 7,
    },
    (_, index) => {
      const date = new Date()

      date.setDate(
        date.getDate() + index
      )

      const key = date
        .toISOString()
        .slice(0, 10)

      return {
        label: date.toLocaleDateString(
          'id-ID',
          {
            day: 'numeric',
            month: 'short',
          }
        ),
        jumlah:
          byDay.get(key) ?? 0,
      }
    }
  )

  // =====================================================
  // SMART CTA
  // =====================================================
  const primaryCta =
    stats.due_today > 0
      ? {
          title: `Kamu punya ${stats.due_today} soal untuk direview hari ini`,
          description:
            'Selesaikan sesi review hari ini untuk menjaga ritme belajarmu tetap konsisten.',
          href: '/study',
          label: 'Mulai Belajar',
          icon: BookOpen,
        }
      : stats.total_materials === 0
        ? {
            title:
              'Mulai dengan menambah materi pertamamu',
            description:
              'Tempel teks atau unggah PDF dan DOCX, lalu buat kuis pertamamu dengan AI.',
            href: '/materials',
            label: 'Tambah Materi',
            icon: FileText,
          }
        : {
            title:
              'Semua soal terjadwal. Tambah materi baru untuk lanjut.',
            description:
              'Tidak ada review yang perlu dikerjakan sekarang. Kamu bisa menambah materi berikutnya.',
            href: '/materials',
            label: 'Kelola Materi',
            icon: Layers,
          }

  const CtaIcon = primaryCta.icon

  const contextualGreeting =
    stats.due_today > 0
      ? 'Ada sesi review yang menunggumu hari ini.'
      : stats.total_materials === 0
        ? 'Mari siapkan materi pertamamu.'
        : 'Semua review sudah terjadwal. Ritmemu sedang rapi.'

  return (
    <AppShell
      credits={profile?.credits ?? 0}
    >
      <main
        className={`${inter.className} mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12`}
      >
        {/* =================================================
            GREETING
        ================================================= */}
        <header className="mb-8">
          <h1
            className={`${spaceGrotesk.className} text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl`}
          >
            Halo, {displayName}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {contextualGreeting}
          </p>
        </header>

        {/* =================================================
            SMART CTA
        ================================================= */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 shadow-sm shadow-indigo-500/5">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                <CtaIcon size={20} />
              </div>

              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Berikutnya
                </p>

                <h2
                  className={`${spaceGrotesk.className} text-lg font-bold tracking-tight text-slate-950 sm:text-xl`}
                >
                  {primaryCta.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {primaryCta.description}
                </p>
              </div>
            </div>

            <Link
              href={primaryCta.href}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:self-auto"
            >
              {primaryCta.label}
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={
              <BookText size={16} />
            }
            label="Total Materi"
            value={stats.total_materials}
            tone="indigo"
          />

          <StatCard
            icon={<Layers size={16} />}
            label="Total Soal"
            value={stats.total_questions}
            tone="violet"
          />

          <StatCard
            icon={
              <CalendarClock
                size={16}
              />
            }
            label="Jatuh Tempo"
            value={stats.due_today}
            tone="amber"
            urgent={stats.due_today > 0}
          />

          <StatCard
            icon={
              <CircleCheck size={16} />
            }
            label="Dikuasai"
            value={stats.mastered}
            tone="emerald"
          />
        </section>

        {/* =================================================
            CHART + RECENT MATERIALS
        ================================================= */}
        <div className="mb-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  className={`${spaceGrotesk.className} font-bold tracking-tight text-slate-900`}
                >
                  Jadwal Review
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  7 hari ke depan
                </p>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              >
                Lihat detail
                <ArrowRight size={12} />
              </Link>
            </div>

            <MiniReviewChart
              data={chartData}
            />
          </section>

          {/* Materi terakhir */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  className={`${spaceGrotesk.className} font-bold tracking-tight text-slate-900`}
                >
                  Materi Terakhir
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Materi yang baru kamu
                  tambahkan
                </p>
              </div>

              {recentMaterials.length >
                0 && (
                <Link
                  href="/materials"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Semua materi
                  <ArrowRight
                    size={12}
                  />
                </Link>
              )}
            </div>

            {recentMaterials.length ===
            0 ? (
              <div className="flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={18} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Belum ada materi
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                  Tambahkan materi
                  pertamamu untuk mulai
                  membuat kuis.
                </p>

                <Link
                  href="/materials"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Tambah materi
                  <ArrowRight
                    size={12}
                  />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMaterials.map(
                  (material) => {
                    const questionCount =
                      (
                        material.questions as
                          | {
                              count: number
                            }[]
                          | null
                      )?.[0]?.count ?? 0

                    return (
                      <article
                        key={material.id}
                        className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FileText
                            size={15}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-slate-800">
                            {material.title}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-slate-400">
                              {new Date(
                                material.created_at
                              ).toLocaleDateString(
                                'id-ID',
                                {
                                  day: 'numeric',
                                  month:
                                    'short',
                                }
                              )}
                            </span>

                            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-indigo-600">
                              {questionCount}{' '}
                              soal
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/materials"
                          className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          Buka
                        </Link>
                      </article>
                    )
                  }
                )}
              </div>
            )}
          </section>
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}
        <section>
          <h2
            className={`${spaceGrotesk.className} mb-4 text-sm font-bold tracking-tight text-slate-900`}
          >
            Akses Cepat
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <ActionCard
              href="/study"
              icon={
                <BookOpen size={18} />
              }
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
              icon={
                <BarChart3 size={18} />
              }
              title="Lihat Progres"
              desc="Pantau penguasaan dan jadwal review."
            />
          </div>
        </section>
      </main>
    </AppShell>
  )
}

// =========================================================
// STAT CARD
// =========================================================

type StatTone =
  | 'indigo'
  | 'violet'
  | 'amber'
  | 'emerald'

const statToneClasses: Record<
  StatTone,
  {
    icon: string
    value: string
  }
> = {
  indigo: {
    icon:
      'bg-indigo-50 text-indigo-600',
    value: 'text-slate-950',
  },

  violet: {
    icon:
      'bg-violet-50 text-violet-600',
    value: 'text-slate-950',
  },

  amber: {
    icon:
      'bg-amber-50 text-amber-600',
    value: 'text-slate-950',
  },

  emerald: {
    icon:
      'bg-emerald-50 text-emerald-600',
    value: 'text-slate-950',
  },
}

function StatCard({
  icon,
  label,
  value,
  tone,
  urgent = false,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone: StatTone
  urgent?: boolean
}) {
  const styles =
    statToneClasses[tone]

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 ${
        urgent
          ? 'border-indigo-200'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon}`}
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-4 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${
          urgent
            ? 'text-indigo-600'
            : styles.value
        }`}
      >
        {value}
      </p>

      {urgent && (
        <p className="mt-1 text-[11px] font-medium text-indigo-500">
          Perlu direview hari ini
        </p>
      )}
    </article>
  )
}

// =========================================================
// QUICK ACTION
// =========================================================

function ActionCard({
  href,
  icon,
  title,
  desc,
  primary,
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
      className={`group flex min-h-44 flex-col rounded-xl border p-5 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
        primary
          ? 'border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/15'
          : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      <span
        className={
          primary
            ? 'text-indigo-100'
            : 'text-indigo-600'
        }
      >
        {icon}
      </span>

      <h2
        className={`mt-4 font-semibold tracking-tight ${
          primary
            ? 'text-white'
            : 'text-slate-900'
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-1.5 text-sm leading-relaxed ${
          primary
            ? 'text-indigo-100'
            : 'text-slate-500'
        }`}
      >
        {desc}
      </p>

      <span
        className={`mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold ${
          primary
            ? 'text-white'
            : 'text-indigo-600'
        }`}
      >
        Buka

        <ArrowRight
          size={12}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  )
}