// src/app/materials/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Trash2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { deleteMaterial } from './actions'
import AddMaterialForm from './AddMaterialForm'
import GenerateQuizButton from './GenerateQuizButton'
import { isProUser, materialLimit } from '@/lib/subscription'

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: materials } = await supabase
    .from('materials')
    .select('id, title, content, created_at, questions(count)')
    .order('created_at', { ascending: false })

  // Ambil profil user beserta plan & subscription_status
  const { data: profile } = await supabase
    .from('users')
    .select('plan, subscription_status')
    .eq('id', user.id)
    .single()

  // Menggunakan helper dari file subscription
  const isPro = isProUser(profile)
  const limit = materialLimit(profile)
  const used = materials?.length ?? 0
  const atLimit = used >= limit

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Materi Belajar
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Simpan materi, lalu buat kuis darinya dengan AI.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Beranda
          </Link>
        </div>

        {/* Indikator kuota */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <span className="text-sm text-slate-600">
            <span className="font-medium tabular-nums text-slate-900">{used}</span>
            <span className="text-slate-400"> / {limit} materi</span>
            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {isPro ? 'pro' : 'free'}
            </span>
          </span>
          {!isPro && (
            <Link href="/billing" className="text-xs font-medium text-indigo-600 hover:underline">
              Upgrade ke Pro
            </Link>
          )}
        </div>

        {/* Notifikasi message */}
        {message && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {message}
          </div>
        )}
        
        {/* Notifikasi error */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Form Add atau Peringatan Kuota Penuh */}
        {atLimit ? (
          <div className="mb-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Kuota materi penuh.{' '}
            {!isPro ? (
              <>
                <Link href="/billing" className="font-medium text-indigo-600 hover:underline">
                  Upgrade ke Pro
                </Link>{' '}
                untuk menambah hingga 50 materi.
              </>
            ) : (
              'Hapus materi lama untuk menambah yang baru.'
            )}
          </div>
        ) : (
          <AddMaterialForm />
        )}
        
        {/* Daftar materi */}
        {(!materials || materials.length === 0) ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
            <FileText size={20} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-900">Belum ada materi</p>
            <p className="mt-1 text-sm text-slate-500">
              Tambahkan materi pertamamu untuk mulai membuat kuis.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {materials.map((m) => {
              // Ambil jumlah soal dari hasil count (bentuknya array [{count: N}]).
              const questionCount = (m.questions as { count: number }[] | null)?.[0]?.count ?? 0

              return (
                <article
                  key={m.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold tracking-tight text-slate-900">{m.title}</h2>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{m.content}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                        <span>
                          {new Date(m.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                        {/* badge jumlah soal */}
                        {questionCount > 0 && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                            {questionCount} soal
                          </span>
                        )}
                      </div>
                    </div>

                    <form action={deleteMaterial}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        aria-label="Hapus materi"
                        className="shrink-0 rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {/* teruskan questionCount ke tombol */}
                    <GenerateQuizButton materialId={m.id} existingCount={questionCount} />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}