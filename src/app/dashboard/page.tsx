// src/app/dashboard/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, BookText, Layers, CalendarClock, CircleCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ReviewChart from './ReviewChart'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data } = await admin.rpc('get_dashboard', { p_user_id: user.id })

  const stats = data ?? {
    total_materials: 0, total_questions: 0, due_today: 0,
    mastered: 0, in_progress: 0, upcoming: [],
  }

  const raw: { review_day: string; jumlah: number }[] = stats.upcoming ?? []
  const byDay = new Map(raw.map((d) => [d.review_day.slice(0, 10), Number(d.jumlah)]))
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    return {
      label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      jumlah: byDay.get(key) ?? 0,
    }
  })

  const untouched = Math.max(0, stats.total_questions - stats.mastered - stats.in_progress)
  const total = Math.max(1, stats.total_questions)
  const pct = (n: number) => (n / total) * 100

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="mx-auto max-w-5xl px-6 py-12">
        
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ringkasan progres belajar dan jadwal review kamu.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 hover:shadow"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Beranda
          </Link>
        </div>

        {/* Kartu Metrik - Gaya Grid Seamless ala Linear */}
        <div className="mb-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<BookText size={16} />} label="Materi" value={stats.total_materials} />
          <Stat icon={<Layers size={16} />} label="Total Soal" value={stats.total_questions} />
          <Stat icon={<CalendarClock size={16} />} label="Jatuh Tempo" value={stats.due_today} accent />
          <Stat icon={<CircleCheck size={16} />} label="Dikuasai" value={stats.mastered} />
        </div>

        {/* Progres Penguasaan */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-baseline justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800">
              Progres Penguasaan
            </h2>
            <span className="text-sm font-medium text-slate-500">
              {stats.mastered + stats.in_progress} / {stats.total_questions} soal disentuh
            </span>
          </div>

          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="bg-slate-900 transition-all duration-500" style={{ width: `${pct(stats.mastered)}%` }} />
            <div className="bg-slate-400 transition-all duration-500" style={{ width: `${pct(stats.in_progress)}%` }} />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            <Legend color="bg-slate-900" label="Dikuasai" value={stats.mastered} />
            <Legend color="bg-slate-400" label="Dipelajari" value={stats.in_progress} />
            <Legend color="bg-slate-200" label="Belum disentuh" value={untouched} />
          </div>
        </section>

        {/* Grafik Review */}
        <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-8 flex items-baseline justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800">
              Jadwal Review
            </h2>
            <span className="text-sm text-slate-400">
              7 hari ke depan
            </span>
          </div>
          
          <ReviewChart data={chartData} />
        </section>
      </main>
    </div>
  )
}

function Stat({
  icon, label, value, accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: boolean
}) {
  const isUrgent = accent && value > 0

  return (
    <div className="flex flex-col justify-between bg-white p-6 transition-colors hover:bg-slate-50/50">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {/* Ikon polos, tanpa lingkaran/ring. Muted secara default. */}
        <span className={isUrgent ? 'text-indigo-500' : 'text-slate-300'}>
          {icon}
        </span>
      </div>
      <div>
        <div
          className={`text-4xl font-bold tracking-tight tabular-nums ${
            isUrgent ? 'text-indigo-600' : 'text-slate-900'
          }`}
        >
          {value}
        </div>
        {isUrgent && (
          <p className="mt-2 text-xs font-medium text-slate-500">
            Sesi review menunggumu hari ini
          </p>
        )}
      </div>
    </div>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-3 w-3 rounded-sm ${color} ring-1 ring-inset ring-black/5`} />
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-bold tabular-nums text-slate-900">{value}</span>
    </div>
  )
}