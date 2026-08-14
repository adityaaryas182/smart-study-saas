// src/app/materials/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FileText,
  Trash2,
} from 'lucide-react'
import {
  Inter,
  Space_Grotesk,
} from 'next/font/google'

import { createClient } from '@/lib/supabase/server'
import {
  isProUser,
  materialLimit,
} from '@/lib/subscription'

import AppShell from '../(app)/AppShell'
import AddMaterialForm from './AddMaterialForm'
import GenerateQuizButton from './GenerateQuizButton'
import { deleteMaterial } from './actions'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}) {
  const { error, message } =
    await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // =====================================================
  // MATERIALS
  // Logic tetap sama seperti versi lama
  // =====================================================
  const { data: materials } =
    await supabase
      .from('materials')
      .select(
        'id, title, content, created_at, questions(count)'
      )
      .order('created_at', {
        ascending: false,
      })

  // =====================================================
  // PROFILE
  //
  // plan + subscription_status tetap digunakan untuk
  // perhitungan kuota.
  //
  // credits hanya ditambahkan ke select agar AppShell
  // dapat menampilkan sisa kredit user.
  // =====================================================
  const { data: profile } =
    await supabase
      .from('users')
      .select(
        'plan, subscription_status, credits'
      )
      .eq('id', user.id)
      .single()

  // Logic kuota tetap sama
  const isPro = isProUser(profile)
  const limit = materialLimit(profile)
  const used = materials?.length ?? 0
  const atLimit = used >= limit

  return (
    <AppShell
      credits={profile?.credits ?? 0}
    >
      <main
        className={`${inter.className} mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12`}
      >
        {/* =================================================
            HEADER
        ================================================= */}
        <header className="mb-8">
          <h1
            className={`${spaceGrotesk.className} text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl`}
          >
            Materi Belajar
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Simpan materi, lalu buat kuis
            darinya dengan AI.
          </p>
        </header>

        {/* =================================================
            KUOTA
        ================================================= */}
        <section className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">
              <span className="font-semibold tabular-nums text-indigo-600">
                {used}
              </span>

              <span className="text-slate-400">
                {' '}
                / {limit} materi
              </span>
            </span>

            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isPro
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>

          {!isPro && (
            <Link
              href="/billing"
              className="self-start rounded-md text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 sm:self-auto"
            >
              Upgrade ke Pro
            </Link>
          )}
        </section>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}
        {message && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* =================================================
            ADD MATERIAL
        ================================================= */}
        {atLimit ? (
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-600">
            Kuota materi penuh.{' '}

            {!isPro ? (
              <>
                <Link
                  href="/billing"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
                >
                  Upgrade ke Pro
                </Link>{' '}
                untuk menambah hingga 50
                materi.
              </>
            ) : (
              'Hapus materi lama untuk menambah yang baru.'
            )}
          </div>
        ) : (
          <AddMaterialForm />
        )}

        {/* =================================================
            MATERIAL LIST
        ================================================= */}
        {!materials ||
        materials.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
              <FileText size={19} />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              Belum ada materi
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Tambahkan materi pertamamu
              untuk mulai membuat kuis.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {materials.map((material) => {
              // Logic count soal tetap sama
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
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FileText
                            size={15}
                          />
                        </div>

                        <div className="min-w-0">
                          <h2
                            className={`${spaceGrotesk.className} font-semibold tracking-tight text-slate-900`}
                          >
                            {material.title}
                          </h2>

                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                            {
                              material.content
                            }
                          </p>
                        </div>
                      </div>

                      <div className="ml-12 mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>
                          {new Date(
                            material.created_at
                          ).toLocaleDateString(
                            'id-ID',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </span>

                        {questionCount > 0 && (
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold tabular-nums text-indigo-600">
                            {questionCount} soal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Logic delete tetap sama */}
                    <form
                      action={deleteMaterial}
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={material.id}
                      />

                      <button
                        type="submit"
                        aria-label="Hapus materi"
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {/* Logic generate quiz tetap sama */}
                    <GenerateQuizButton
                      materialId={
                        material.id
                      }
                      existingCount={
                        questionCount
                      }
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </AppShell>
  )
}