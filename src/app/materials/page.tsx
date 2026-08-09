// src/app/materials/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Trash2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { deleteMaterial } from './actions'
import AddMaterialForm from './AddMaterialForm'
import GenerateQuizButton from './GenerateQuizButton'

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
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })

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

        {/* Notifikasi */}
        {message && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
            {error}
          </div>
        )}

        <AddMaterialForm />

        {/* Daftar materi */}
        {(!materials || materials.length === 0) ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
            <FileText size={20} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-900">Belum ada materi</p>
            <p className="mt-1 text-sm text-slate-500">
              Tambahkan materi pertamamu untuk mulai membuat kuis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((m) => (
              <article
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold tracking-tight text-slate-900">
                      {m.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {m.content}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
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
                  <GenerateQuizButton materialId={m.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}