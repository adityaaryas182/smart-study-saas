// src/app/(auth)/login/page.tsx

import Link from 'next/link'
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Sparkles,
} from 'lucide-react'
import {
  Inter,
  Space_Grotesk,
} from 'next/font/google'

import {
  login,
  signInWithGoogle,
} from '../actions'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}) {
  const { error, message } = await searchParams

  return (
    <main
      className={`${inter.className} min-h-screen bg-white text-slate-900`}
    >
      <div className="grid min-h-screen md:grid-cols-[45%_55%]">
        {/* =================================================
            LEFT — LOGIN FORM
        ================================================= */}
        <section className="relative flex min-h-screen items-center justify-center bg-white px-5 py-20 sm:px-8 md:px-10 lg:px-14">
          {/* Kembali ke landing page */}
          <Link
            href="/"
            className="absolute left-5 top-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:left-8 sm:top-8 md:left-10 lg:left-14"
          >
            <ArrowLeft size={14} />
            Kembali ke beranda
          </Link>

          <div className="w-full max-w-[400px]">
            {/* Brand */}
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-violet-500/20">
                <Sparkles
                  size={19}
                  strokeWidth={2.2}
                />
              </div>

              <h1
                className={`${spaceGrotesk.className} mt-6 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-[2rem]`}
              >
                Selamat datang kembali
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Masuk untuk lanjut belajar.
              </p>
            </div>

            {/* =================================================
                NOTIFICATION
            ================================================= */}
            <div className="mt-7">
              {message && (
                <div
                  role="status"
                  className="mb-4 flex gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-6 text-emerald-800"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}
            </div>

            {/* =================================================
                EMAIL + PASSWORD LOGIN
            ================================================= */}
            <form
              action={login}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:translate-y-0 motion-reduce:transform-none"
              >
                Masuk
              </button>
            </form>

            {/* =================================================
                DIVIDER
            ================================================= */}
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium text-slate-400">
                atau
              </span>

              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
              >
                <GoogleIcon />

                Masuk dengan Google
              </button>
            </form>

            {/* =================================================
                SIGNUP LINK
            ================================================= */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link
                href="/signup"
                className="font-semibold text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition hover:text-violet-700 hover:decoration-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              >
                Daftar
              </Link>
            </p>

            <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">
              Smart Study &amp; Quiz · Belajar dengan AI dan spaced repetition.
            </p>
          </div>
        </section>

        {/* =================================================
            RIGHT — VISUAL PANEL
            Hilang pada mobile (< md)
        ================================================= */}
        <aside className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#7C3AED] text-white md:flex md:flex-col md:justify-between">
          {/* Decorative circles */}
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute right-8 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl"
          />

          {/* Dot pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* =================================================
              TOP BRAND
          ================================================= */}
          <div className="relative z-10 flex items-center gap-3 px-10 pt-10 lg:px-14 lg:pt-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              <Sparkles
                size={18}
                strokeWidth={2.2}
              />
            </div>

            <span
              className={`${spaceGrotesk.className} text-sm font-bold tracking-tight`}
            >
              Smart Study &amp; Quiz
            </span>
          </div>

          {/* =================================================
              MAIN VISUAL CONTENT
          ================================================= */}
          <div className="relative z-10 mx-auto w-full max-w-2xl px-10 lg:px-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-50 backdrop-blur-sm">
                <BrainCircuit size={14} />
                Belajar lebih terarah
              </div>

              <h2
                className={`${spaceGrotesk.className} mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white lg:text-5xl xl:text-[3.5rem]`}
              >
                Belajar yang benar-benar menempel.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-indigo-100 lg:text-base lg:leading-8">
                Ubah materi menjadi kuis dengan AI, latih ingatan dengan active
                recall, lalu ulangi pada waktu yang lebih tepat.
              </p>
            </div>

            {/* =================================================
                MINI PRODUCT PREVIEW
            ================================================= */}
            <div className="mt-10 grid max-w-xl gap-3 lg:grid-cols-2">
              {/* AI Quiz */}
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl shadow-indigo-950/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                    <BrainCircuit size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Kuis dari materi
                    </p>

                    <p className="mt-0.5 text-[10px] text-indigo-200">
                      Powered by Gemini
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/15" />
                  <div className="h-2 w-5/6 rounded-full bg-white/15" />
                  <div className="h-2 w-2/3 rounded-full bg-white/15" />
                </div>

                <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] font-medium text-emerald-100">
                  ✓ Jawaban tervalidasi
                </div>
              </div>

              {/* Review */}
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl shadow-indigo-950/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Review otomatis
                    </p>

                    <p className="mt-0.5 text-[10px] text-indigo-200">
                      Spaced repetition
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <ReviewRow
                    label="Fotosintesis"
                    status="Hari ini"
                  />

                  <ReviewRow
                    label="Respirasi sel"
                    status="3 hari"
                  />

                  <ReviewRow
                    label="Genetika"
                    status="7 hari"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              BOTTOM LABELS
          ================================================= */}
          <div className="relative z-10 flex flex-wrap items-center gap-5 px-10 pb-10 text-[11px] font-medium text-indigo-200 lg:px-14 lg:pb-12">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              AI Quiz
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Active Recall
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              SM-2
            </span>
          </div>
        </aside>
      </div>
    </main>
  )
}

// =========================================================
// MINI REVIEW ROW
// =========================================================

function ReviewRow({
  label,
  status,
}: {
  label: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-indigo-100">
        {label}
      </span>

      <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-semibold text-white">
        {status}
      </span>
    </div>
  )
}

// =========================================================
// GOOGLE BRAND ICON
// =========================================================

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />

      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />

      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />

      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
      />
    </svg>
  )
}