// src/app/billing/page.tsx

import { redirect } from 'next/navigation'
import {
  Check,
  Sparkles,
} from 'lucide-react'
import {
  Inter,
  Space_Grotesk,
} from 'next/font/google'

import { createClient } from '@/lib/supabase/server'
import { isProUser } from '@/lib/subscription'

import AppShell from '../(app)/AppShell'
import {
  createCheckoutSession,
  openCustomerPortal,
} from './actions'

const CREDIT_LABEL = 100

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
  }>
}) {
  const { status } =
    await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } =
    await supabase
      .from('users')
      .select(
        'plan, subscription_status, credits, current_period_end'
      )
      .eq('id', user.id)
      .single()

  const isPro =
    isProUser(profile)

  return (
    <AppShell
      credits={profile?.credits ?? 0}
    >
      <main
        className={`${inter.className} mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12`}
      >
        {/* =================================================
            HEADER
        ================================================= */}
        <header>
          <h1
            className={`${spaceGrotesk.className} text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl`}
          >
            Langganan
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kelola paket dan kredit
            generate kuis kamu.
          </p>
        </header>

        {/* =================================================
            STATUS MESSAGE
        ================================================= */}
        {status === 'success' && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Pembayaran berhasil. Kredit
            akan masuk dalam beberapa
            detik.
          </div>
        )}

        {status === 'cancelled' && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Checkout dibatalkan.
          </div>
        )}

        {/* =================================================
            CURRENT PLAN
        ================================================= */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Paket Aktif
            </span>

            <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold tabular-nums text-indigo-600">
              {profile?.credits ?? 0}{' '}
              kredit tersisa
            </span>
          </div>

          <p
            className={`${spaceGrotesk.className} mt-3 text-2xl font-bold tracking-tight ${
              isPro
                ? 'text-indigo-600'
                : 'text-slate-900'
            }`}
          >
            {isPro ? 'Pro' : 'Free'}
          </p>

          {isPro &&
            profile?.current_period_end && (
              <p className="mt-1 text-sm text-slate-500">
                Diperpanjang{' '}
                {new Date(
                  profile.current_period_end
                ).toLocaleDateString(
                  'id-ID',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </p>
            )}
        </section>

        {/* =================================================
            ACTION
        ================================================= */}
        {isPro ? (
          <form
            action={openCustomerPortal}
            className="mt-4"
          >
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30">
              Kelola Langganan
            </button>
          </form>
        ) : (
          <section className="relative mt-4 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-white via-white to-indigo-50/70 p-6 shadow-sm">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-100/70 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-center gap-2 text-indigo-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <Sparkles
                    size={15}
                  />
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Upgrade
                </span>
              </div>

              <p
                className={`${spaceGrotesk.className} mt-4 text-2xl font-bold tracking-tight text-slate-950`}
              >
                Pro
              </p>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Lebih banyak kredit dan
                kapasitas materi untuk
                sesi belajar yang lebih
                aktif.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-indigo-500"
                  />

                  {CREDIT_LABEL} kredit
                  setiap bulan
                </li>

                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-indigo-500"
                  />

                  Batalkan kapan saja
                </li>
              </ul>

              <form
                action={
                  createCheckoutSession
                }
                className="mt-6"
              >
                <button className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/15 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                  Upgrade ke Pro
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </AppShell>
  )
}