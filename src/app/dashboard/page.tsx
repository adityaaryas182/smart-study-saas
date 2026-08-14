// src/app/dashboard/page.tsx

import { redirect } from 'next/navigation'
import {
  BookText,
  CalendarClock,
  CircleCheck,
  Layers,
} from 'lucide-react'
import {
  Inter,
  Space_Grotesk,
} from 'next/font/google'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

import AppShell from '../(app)/AppShell'
import ReviewChart from './ReviewChart'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()

  const [
    dashboardResult,
    profileResult,
  ] = await Promise.all([
    admin.rpc('get_dashboard', {
      p_user_id: user.id,
    }),

    admin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single(),
  ])

  const data = dashboardResult.data

  const stats = data ?? {
    total_materials: 0,
    total_questions: 0,
    due_today: 0,
    mastered: 0,
    in_progress: 0,
    upcoming: [],
  }

  const raw: {
    review_day: string
    jumlah: number
  }[] = stats.upcoming ?? []

  const byDay = new Map(
    raw.map((item) => [
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
        label:
          date.toLocaleDateString(
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

  const untouched = Math.max(
    0,
    stats.total_questions -
      stats.mastered -
      stats.in_progress
  )

  const total = Math.max(
    1,
    stats.total_questions
  )

  const pct = (value: number) =>
    (value / total) * 100

  return (
    <AppShell
      credits={
        profileResult.data?.credits ?? 0
      }
    >
      <main
        className={`${inter.className} mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12`}
      >
        {/* =================================================
            HEADER
        ================================================= */}
        <header className="mb-8">
          <h1
            className={`${spaceGrotesk.className} text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl`}
          >
            Progres Belajar
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ringkasan penguasaan dan
            jadwal review kamu.
          </p>
        </header>

        {/* =================================================
            METRICS
        ================================================= */}
        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={
              <BookText size={16} />
            }
            label="Materi"
            value={
              stats.total_materials
            }
          />

          <Stat
            icon={<Layers size={16} />}
            label="Total Soal"
            value={
              stats.total_questions
            }
          />

          <Stat
            icon={
              <CalendarClock
                size={16}
              />
            }
            label="Jatuh Tempo"
            value={stats.due_today}
            accent
          />

          <Stat
            icon={
              <CircleCheck size={16} />
            }
            label="Dikuasai"
            value={stats.mastered}
          />
        </section>

        {/* =================================================
            MASTERY
        ================================================= */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-baseline sm:justify-between">
            <h2
              className={`${spaceGrotesk.className} font-bold tracking-tight text-slate-900`}
            >
              Progres Penguasaan
            </h2>

            <span className="text-sm font-medium tabular-nums text-slate-500">
              {stats.mastered +
                stats.in_progress}{' '}
              / {stats.total_questions}{' '}
              soal disentuh
            </span>
          </div>

          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-indigo-600 transition-all duration-500"
              style={{
                width: `${pct(
                  stats.mastered
                )}%`,
              }}
            />

            <div
              className="bg-slate-400 transition-all duration-500"
              style={{
                width: `${pct(
                  stats.in_progress
                )}%`,
              }}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            <Legend
              color="bg-indigo-600"
              label="Dikuasai"
              value={stats.mastered}
            />

            <Legend
              color="bg-slate-400"
              label="Dipelajari"
              value={
                stats.in_progress
              }
            />

            <Legend
              color="bg-slate-200"
              label="Belum disentuh"
              value={untouched}
            />
          </div>
        </section>

        {/* =================================================
            REVIEW CHART
        ================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-8 flex items-baseline justify-between border-b border-slate-100 pb-4">
            <h2
              className={`${spaceGrotesk.className} font-bold tracking-tight text-slate-900`}
            >
              Jadwal Review
            </h2>

            <span className="text-sm text-slate-400">
              7 hari ke depan
            </span>
          </div>

          <ReviewChart
            data={chartData}
          />
        </section>
      </main>
    </AppShell>
  )
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: boolean
}) {
  const isUrgent =
    accent && value > 0

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 ${
        isUrgent
          ? 'border-indigo-200'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </span>
      </div>

      <div
        className={`mt-4 text-3xl font-bold tracking-tight tabular-nums ${
          isUrgent
            ? 'text-indigo-600'
            : 'text-slate-950'
        }`}
      >
        {value}
      </div>

      {isUrgent && (
        <p className="mt-1.5 text-[11px] font-medium text-indigo-500">
          Sesi review menunggumu
          hari ini
        </p>
      )}
    </article>
  )
}

function Legend({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`h-3 w-3 rounded-sm ${color} ring-1 ring-inset ring-black/5`}
      />

      <span className="text-sm font-medium text-slate-600">
        {label}
      </span>

      <span className="text-sm font-bold tabular-nums text-slate-900">
        {value}
      </span>
    </div>
  )
}