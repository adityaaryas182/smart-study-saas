// src/app/LandingPage.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    ArrowRight,
    BrainCircuit,
    Check,
    CheckCircle2,
    Clock3,
    Code2,
    Database,
    FileText,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Upload,
    Webhook,
    Zap,
  } from 'lucide-react'
import {
  Inter,
  Space_Grotesk,
} from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

const GITHUB_URL =
  'https://github.com/adityaaryas182/smart-study-saas'

// Placeholder — ganti nanti dengan email / LinkedIn asli.
const CONTACT_URL = 'mailto:your-email@example.com'

const features = [
  {
    icon: Upload,
    title: 'Unggah PDF & DOCX',
    description:
      'Masukkan materi tanpa repot menyalin semuanya. Smart Study membaca dokumen berbasis teks dan mengubahnya menjadi sumber belajar.',
  },
  {
    icon: BrainCircuit,
    title: 'Kuis dari AI',
    description:
      'Google Gemini menyusun soal pilihan ganda dari materimu, lalu hasilnya divalidasi sebelum masuk ke sesi belajar.',
  },
  {
    icon: RefreshCw,
    title: 'Spaced Repetition',
    description:
      'Soal dijadwalkan ulang dengan prinsip SM-2 agar materi yang perlu diingat kembali muncul pada waktu yang lebih tepat.',
  },
]

const workflow = [
  {
    number: '01',
    icon: FileText,
    title: 'Unggah materi',
    description:
      'Tempel teks atau unggah PDF dan DOCX yang ingin kamu pelajari.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'AI bikin kuis',
    description:
      'Gemini mengubah isi materi menjadi soal pilihan ganda yang siap dikerjakan.',
  },
  {
    number: '03',
    icon: Clock3,
    title: 'Belajar & ulangi',
    description:
      'Kerjakan kuis, beri rating kesulitan, lalu sistem mengatur kapan soal perlu muncul lagi.',
  },
]

const sciencePoints = [
  {
    icon: Clock3,
    title: 'Spacing effect',
    description:
      'Belajar yang disebar ke beberapa sesi memberi kesempatan bagi ingatan untuk diperkuat kembali, dibanding menumpuk semuanya dalam satu sesi panjang.',
  },
  {
    icon: BrainCircuit,
    title: 'Active recall',
    description:
      'Mencoba mengambil jawaban dari ingatan melatih proses retrieval, bukan sekadar membaca ulang materi secara pasif.',
  },
  {
    icon: RefreshCw,
    title: 'Melawan pola lupa',
    description:
      'Ingatan cenderung melemah seiring waktu. Pengulangan terjadwal memberi kesempatan untuk mengaktifkan kembali materi sebelum terlalu lama terlupakan.',
  },
]

const techStack = [
  'Next.js 16',
  'TypeScript',
  'Supabase',
  'PostgreSQL',
  'Google Gemini',
  'Stripe',
  'Tailwind CSS',
  'Zod',
]

const architecture = [
  {
    icon: Database,
    title: 'Transaksi atomik',
    description:
      'Operasi multi-langkah penting dijalankan melalui PostgreSQL functions agar penyimpanan soal, progres, dan kredit tetap konsisten.',
  },
  {
    icon: Webhook,
    title: 'Webhook idempoten',
    description:
      'Event Stripe dicatat berdasarkan primary key sehingga event yang sama tidak diproses berulang kali.',
  },
  {
    icon: ShieldCheck,
    title: 'Aman berlapis',
    description:
      'RLS melindungi data, grading dilakukan di server, dan kunci jawaban tidak pernah dikirim sebelum jawaban dinilai.',
  },
]

export default function LandingPage() {
  const [showQuiz, setShowQuiz] =
    useState(false)

  const [reduceMotion, setReduceMotion] =
    useState(false)

  // Hormati prefers-reduced-motion.
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    function syncPreference() {
      setReduceMotion(mediaQuery.matches)
    }

    syncPreference()

    mediaQuery.addEventListener(
      'change',
      syncPreference
    )

    return () => {
      mediaQuery.removeEventListener(
        'change',
        syncPreference
      )
    }
  }, [])

  // Signature animation:
  // Materi -> Kuis -> Materi setiap ~3 detik.
  useEffect(() => {
    if (reduceMotion) {
      setShowQuiz(true)
      return
    }

    const interval = window.setInterval(
      () => {
        setShowQuiz((current) => !current)
      },
      3000
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [reduceMotion])

  return (
    <div
      className={`${inter.className} min-h-screen overflow-x-hidden bg-white text-slate-900`}
    >
      {/* =================================================
          NAVBAR
      ================================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="flex items-center gap-2.5"
          >
            <LogoMark />

            <span
              className={`${spaceGrotesk.className} text-sm font-bold tracking-tight text-slate-900 sm:text-base`}
            >
              Smart Study
              <span className="hidden sm:inline">
                {' '}
                &amp; Quiz
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 sm:px-4 sm:text-sm"
            >
              <Code2 size={15} />
              Lihat Kode
            </a>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 motion-reduce:hover:translate-y-0 sm:px-4 sm:text-sm"
            >
              Coba Gratis
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        {/* =================================================
            HERO
        ================================================= */}
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-100/60 via-violet-100/60 to-purple-100/30 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -left-24 top-72 -z-10 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-8 lg:pb-32 lg:pt-24">
            {/* Hero copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <Sparkles size={13} />
                Powered by Google Gemini
              </div>

              <h1
                className={`${spaceGrotesk.className} max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[4rem]`}
              >
                Belajar lebih pintar:{' '}
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                  AI bikin soal
                </span>
                , sains yang atur jadwalnya.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Unggah PDF atau DOCX, ubah materi
                menjadi kuis dengan AI, lalu
                belajar kembali melalui spaced
                repetition agar sesi belajarmu
                lebih terarah.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 motion-reduce:hover:translate-y-0"
                >
                  Coba Gratis
                  <ArrowRight size={16} />
                </Link>

                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <Code2 size={16} />
                  Lihat Kode
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500"
                  />
                  Mulai gratis
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500"
                  />
                  PDF &amp; DOCX
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500"
                  />
                  Jadwal review otomatis
                </span>
              </div>
            </div>

            {/* Signature animation */}
            <HeroTransformation
              showQuiz={showQuiz}
            />
          </div>
        </section>

        {/* =================================================
            FEATURES
        ================================================= */}
        <section
          id="fitur"
          className="border-y border-slate-100 bg-slate-50/70 py-24 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Semua dalam satu alur"
              title="Dari dokumen sampai sesi belajar."
              description="Tidak berhenti di pembuatan soal. Smart Study menghubungkan materi, AI, latihan aktif, dan jadwal review dalam satu workflow."
            />

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon

                return (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 motion-reduce:hover:translate-y-0"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-violet-500/15">
                      <Icon size={20} />
                    </div>

                    <h3
                      className={`${spaceGrotesk.className} mt-5 text-lg font-bold tracking-tight text-slate-900`}
                    >
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            HOW IT WORKS
        ================================================= */}
        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Cara kerja"
              title="Tiga langkah dari materi ke ingatan."
              description="Workflow dibuat sederhana supaya waktu belajarmu habis untuk memahami materi, bukan menyiapkan sistem."
            />

            <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
              <div
                aria-hidden="true"
                className="absolute left-[16%] right-[16%] top-11 hidden h-px bg-gradient-to-r from-indigo-200 via-violet-300 to-indigo-200 lg:block"
              />

              {workflow.map((step) => {
                const Icon = step.icon

                return (
                  <article
                    key={step.number}
                    className="relative rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`${spaceGrotesk.className} bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-3xl font-bold text-transparent`}
                      >
                        {step.number}
                      </span>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon size={19} />
                      </div>
                    </div>

                    <h3
                      className={`${spaceGrotesk.className} mt-8 text-xl font-bold tracking-tight text-slate-900`}
                    >
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            SCIENCE
        ================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 to-white py-24 sm:py-28">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-100/70 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  <BrainCircuit size={13} />
                  Bukan sekadar tren AI
                </div>

                <h2
                  className={`${spaceGrotesk.className} mt-5 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl`}
                >
                  Kenapa spaced repetition?
                </h2>

                <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                  Belajar efektif bukan hanya soal
                  berapa lama kamu membaca. Riset
                  psikologi kognitif mendukung
                  praktik belajar yang tersebar
                  dalam waktu dan pengambilan aktif
                  informasi dari ingatan untuk
                  membantu retensi jangka panjang.
                </p>

                <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FB923C]/10 text-[#FB923C]">
                      <Zap size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Tujuannya bukan belajar lebih
                        sering tanpa arah.
                      </p>

                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        Tujuannya adalah mengulang
                        kembali hal yang relevan pada
                        waktu yang relevan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {sciencePoints.map((point) => {
                  const Icon = point.icon

                  return (
                    <article
                      key={point.title}
                      className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600">
                        <Icon size={19} />
                      </div>

                      <div>
                        <h3
                          className={`${spaceGrotesk.className} font-bold tracking-tight text-slate-900`}
                        >
                          {point.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {point.description}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            PRICING
        ================================================= */}
        <section
          id="harga"
          className="py-24 sm:py-28"
        >
          <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Harga sederhana"
              title="Mulai gratis, upgrade saat butuh lebih."
              description="Semua fitur inti bisa dicoba tanpa harus langsung berlangganan."
              centered
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {/* FREE */}
              <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Free
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <span
                      className={`${spaceGrotesk.className} text-4xl font-bold tracking-tight text-slate-950`}
                    >
                      Rp 0
                    </span>

                    <span className="pb-1 text-sm text-slate-500">
                      /selamanya
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Cocok untuk mencoba workflow
                    belajar berbasis AI.
                  </p>
                </div>

                <ul className="mt-7 space-y-3">
                  <PricingItem>
                    10 kredit generate
                  </PricingItem>
                  <PricingItem>
                    Maksimal 3 materi
                  </PricingItem>
                  <PricingItem>
                    Upload PDF &amp; DOCX
                  </PricingItem>
                  <PricingItem>
                    Kuis AI &amp; spaced repetition
                  </PricingItem>
                  <PricingItem>
                    Dashboard progres
                  </PricingItem>
                </ul>

                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  Mulai Gratis
                  <ArrowRight size={15} />
                </Link>
              </article>

              {/* PRO */}
              <div className="rounded-3xl bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#7C3AED] p-[1px] shadow-xl shadow-violet-500/15">
                <article className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-white p-7 sm:p-8">
                  <div
                    aria-hidden="true"
                    className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-100 blur-3xl"
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-indigo-600">
                        Pro
                      </p>

                      <span className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        Paling Lengkap
                      </span>
                    </div>

                    <div className="mt-3 flex items-end gap-2">
                      <span
                        className={`${spaceGrotesk.className} text-4xl font-bold tracking-tight text-slate-950`}
                      >
                        Rp 49.000
                      </span>

                      <span className="pb-1 text-sm text-slate-500">
                        /bln
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      Untuk pengguna yang ingin
                      belajar lebih banyak materi
                      setiap bulan.
                    </p>
                  </div>

                  <ul className="relative mt-7 space-y-3">
                    <PricingItem>
                      100 kredit / bulan
                    </PricingItem>
                    <PricingItem>
                      Maksimal 50 materi
                    </PricingItem>
                    <PricingItem>
                      Upload PDF &amp; DOCX
                    </PricingItem>
                    <PricingItem>
                      Kuis AI &amp; spaced repetition
                    </PricingItem>
                    <PricingItem>
                      Semua fitur Smart Study
                    </PricingItem>
                  </ul>

                  <Link
                    href="/login"
                    className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 motion-reduce:hover:translate-y-0"
                  >
                    Coba Pro
                    <ArrowRight size={15} />
                  </Link>
                </article>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              Mode demo — pembayaran memakai Stripe
              test mode.
            </p>
          </div>
        </section>

        {/* =================================================
            TECH STACK
        ================================================= */}
        <section className="border-y border-slate-100 bg-slate-50/70 py-20">
          <div className="mx-auto max-w-6xl px-5 text-center sm:px-6 lg:px-8">
            <p
              className={`${spaceGrotesk.className} text-sm font-bold tracking-tight text-slate-900`}
            >
              Dibangun dengan stack modern
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              {techStack.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            ARCHITECTURE
        ================================================= */}
        <section className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-28">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                <Code2 size={13} />
                Untuk mata teknis
              </div>

              <h2
                className={`${spaceGrotesk.className} mt-5 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl`}
              >
                Bukan sekadar UI yang cantik.
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-400">
                Arsitektur backend dirancang agar
                proses penting tetap konsisten,
                aman, dan tidak bergantung pada
                kepercayaan terhadap client.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {architecture.map((item) => {
                const Icon = item.icon

                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                      <Icon size={20} />
                    </div>

                    <h3
                      className={`${spaceGrotesk.className} mt-5 text-lg font-bold tracking-tight text-white`}
                    >
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {item.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}
        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] px-6 py-12 text-center text-white shadow-2xl shadow-violet-500/20 sm:px-12 sm:py-16">
              <div
                aria-hidden="true"
                className="absolute -left-20 -top-28 h-72 w-72 rounded-full border border-white/10"
              />

              <div
                aria-hidden="true"
                className="absolute -bottom-32 -right-12 h-80 w-80 rounded-full bg-white/10 blur-3xl"
              />

              <div className="relative mx-auto max-w-3xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/20">
                  <Sparkles size={21} />
                </div>

                <h2
                  className={`${spaceGrotesk.className} mt-6 text-3xl font-bold tracking-[-0.03em] sm:text-4xl`}
                >
                  Punya materi? Jadikan sesi
                  belajar yang lebih terarah.
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
                  Upload materi, generate kuis, dan
                  biarkan Smart Study membantu
                  menentukan apa yang perlu kamu
                  ulangi berikutnya.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 motion-reduce:hover:translate-y-0"
                  >
                    Coba Gratis
                    <ArrowRight size={16} />
                  </Link>

                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    <Code2 size={16} />
                    Lihat Source Code
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark />

                <span
                  className={`${spaceGrotesk.className} text-sm font-bold text-slate-900`}
                >
                  Smart Study &amp; Quiz
                </span>
              </div>

              <p className="mt-3 text-xs leading-6 text-slate-500">
                Dibuat oleh Aditya Arya — tertarik
                membangun aplikasi seperti ini?{' '}
                <a
                  href={CONTACT_URL}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Hubungi saya
                </a>
                .
              </p>
            </div>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <Code2 size={15} />
              Source code di GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// =========================================================
// HERO TRANSFORMATION
// =========================================================

function HeroTransformation({
  showQuiz,
}: {
  showQuiz: boolean
}) {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      {/* Decorative backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-x-10 bottom-0 top-12 rounded-[2rem] bg-gradient-to-br from-indigo-200/60 via-violet-200/50 to-purple-200/30 blur-2xl"
      />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl sm:p-6">
        {/* Fake app chrome */}
        <div className="mb-5 flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>

          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
            Smart Study
          </span>
        </div>

        {/* Transformation status */}
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div
            className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-colors duration-500 ${
              !showQuiz
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-400'
            } motion-reduce:transition-none`}
          >
            Materi
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span className="h-px w-4 bg-slate-200 sm:w-7" />

            <Sparkles
              size={14}
              className={`transition-colors duration-500 ${
                showQuiz
                  ? 'text-violet-500'
                  : 'text-slate-300'
              } motion-reduce:transition-none`}
            />

            <span className="h-px w-4 bg-slate-200 sm:w-7" />
          </div>

          <div
            className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-colors duration-500 ${
              showQuiz
                ? 'border-violet-200 bg-violet-50 text-violet-700'
                : 'border-slate-200 bg-white text-slate-400'
            } motion-reduce:transition-none`}
          >
            Kuis
          </div>
        </div>

        {/* Both cards occupy same grid cell */}
        <div className="grid min-h-[360px]">
          {/* MATERIAL CARD */}
          <div
            aria-hidden={showQuiz}
            className={`col-start-1 row-start-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-700 ease-out sm:p-6 ${
              showQuiz
                ? 'pointer-events-none translate-y-4 scale-[0.97] opacity-0'
                : 'translate-y-0 scale-100 opacity-100'
            } motion-reduce:transform-none motion-reduce:transition-none`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Biologi — Fotosintesis
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Materi siap diproses
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                <span className="rounded bg-red-50 px-2 py-1 text-[9px] font-bold text-red-500">
                  PDF
                </span>

                <span className="rounded bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-500">
                  DOCX
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-2.5 w-3/4 rounded-full bg-slate-200" />
              <div className="h-2.5 w-full rounded-full bg-slate-100" />
              <div className="h-2.5 w-[92%] rounded-full bg-slate-100" />
              <div className="h-2.5 w-[86%] rounded-full bg-slate-100" />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] leading-5 text-slate-500">
                Fotosintesis adalah proses
                tumbuhan mengubah energi cahaya
                menjadi energi kimia. Proses ini
                terutama berlangsung di kloroplas
                dan memanfaatkan cahaya, air,
                serta karbon dioksida...
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400">
                Mengekstrak konsep penting
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
                <Sparkles size={10} />
                Gemini
              </span>
            </div>
          </div>

          {/* QUIZ CARD */}
          <div
            aria-hidden={!showQuiz}
            className={`col-start-1 row-start-1 rounded-2xl border border-violet-200 bg-white p-5 shadow-lg shadow-violet-500/5 transition-all duration-700 ease-out sm:p-6 ${
              showQuiz
                ? 'translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none -translate-y-4 scale-[0.97] opacity-0'
            } motion-reduce:transform-none motion-reduce:transition-none`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600">
                <Sparkles size={10} />
                Kuis dibuat AI
              </span>

              <span className="text-[10px] font-medium text-slate-400">
                1 / 5
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold leading-6 text-slate-900">
              Apa fungsi utama fotosintesis pada
              tumbuhan?
            </p>

            <div className="mt-5 space-y-2.5">
              <QuizOption label="A">
                Mengubah energi cahaya menjadi
                energi kimia
              </QuizOption>

              <QuizOption label="B">
                Menyerap seluruh oksigen dari udara
              </QuizOption>

              <QuizOption
                label="C"
                correct
              >
                Menghasilkan energi kimia dari
                cahaya
              </QuizOption>

              <QuizOption label="D">
                Mengubah mineral langsung menjadi
                cahaya
              </QuizOption>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                <CheckCircle2 size={12} />
                Jawaban tervalidasi
              </span>

              <span className="text-[10px] text-slate-400">
                Siap untuk review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating mini card */}
      <div className="absolute -bottom-5 -left-2 hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:flex sm:items-center sm:gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FB923C]">
          <Clock3 size={13} />
        </div>

        <div>
          <p className="text-[9px] text-slate-400">
            Review berikutnya
          </p>

          <p className="text-[10px] font-bold text-slate-800">
            Dijadwalkan otomatis
          </p>
        </div>
      </div>
    </div>
  )
}

function QuizOption({
  label,
  children,
  correct = false,
}: {
  label: string
  children: React.ReactNode
  correct?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[11px] leading-5 ${
        correct
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold ${
          correct
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {correct ? (
          <Check size={12} />
        ) : (
          label
        )}
      </span>

      <span>{children}</span>
    </div>
  )
}

// =========================================================
// SHARED SMALL COMPONENTS
// =========================================================

function LogoMark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-sm shadow-violet-500/20">
      <Sparkles
        size={15}
        strokeWidth={2.2}
      />
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string
  title: string
  description: string
  centered?: boolean
}) {
  return (
    <div
      className={
        centered
          ? 'mx-auto max-w-2xl text-center'
          : 'max-w-2xl'
      }
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
        {eyebrow}
      </p>

      <h2
        className={`${spaceGrotesk.className} mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl`}
      >
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
        {description}
      </p>
    </div>
  )
}

function PricingItem({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-600">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check size={12} />
      </span>

      <span>{children}</span>
    </li>
  )
}