// src/app/dashboard/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const upcoming: { review_day: string; jumlah: number }[] = stats.upcoming ?? []
  const maxCount = Math.max(1, ...upcoming.map((d) => d.jumlah))

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/" className="text-sm underline">← Beranda</Link>
      </div>

      {/* Kartu metrik */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Materi" value={stats.total_materials} />
        <StatCard label="Total Soal" value={stats.total_questions} />
        <StatCard label="Jatuh Tempo" value={stats.due_today} highlight />
        <StatCard label="Dikuasai" value={stats.mastered} />
      </div>

      {/* Progres mastery */}
      <div className="mb-8 rounded-lg border p-5">
        <h2 className="mb-3 font-semibold">Progres Belajar</h2>
        <div className="flex gap-6 text-sm">
          <span className="text-green-600">✓ Dikuasai: {stats.mastered}</span>
          <span className="text-amber-600">◐ Dipelajari: {stats.in_progress}</span>
          <span className="text-gray-400">
            ○ Belum disentuh: {Math.max(0, stats.total_questions - stats.mastered - stats.in_progress)}
          </span>
        </div>
      </div>

      {/* Grafik jadwal review mendatang (bar sederhana pakai div) */}
      <div className="rounded-lg border p-5">
        <h2 className="mb-4 font-semibold">Jadwal Review 7 Hari ke Depan</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada review terjadwal.</p>
        ) : (
          <div className="flex items-end gap-3" style={{ height: 140 }}>
            {upcoming.map((d) => (
              <div key={d.review_day} className="flex flex-1 flex-col items-center gap-1">
                <div className="text-xs text-gray-500">{d.jumlah}</div>
                <div
                  className="w-full rounded-t bg-black"
                  style={{ height: `${(d.jumlah / maxCount) * 100}%`, minHeight: 4 }}
                />
                <div className="text-xs text-gray-400">
                  {new Date(d.review_day).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-black' : ''}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}