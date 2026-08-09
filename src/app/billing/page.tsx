// src/app/billing/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, openCustomerPortal } from './actions'
import { isProUser } from '@/lib/subscription'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('plan, subscription_status, credits, current_period_end')
    .eq('id', user.id)
    .single()

    const isPro = isProUser(profile)

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Beranda
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Langganan</h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola paket dan kredit generate kuis kamu.
        </p>

        {status === 'success' && (
          <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            Pembayaran berhasil. Kredit akan masuk dalam beberapa detik.
          </div>
        )}
        {status === 'cancelled' && (
          <div className="mt-6 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
            Checkout dibatalkan.
          </div>
        )}

        {/* Status saat ini */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Paket Aktif
            </span>
            <span className="text-sm tabular-nums text-slate-500">
              {profile?.credits ?? 0} kredit tersisa
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {isPro ? 'Pro' : 'Free'}
          </p>
          {isPro && profile?.current_period_end && (
            <p className="mt-1 text-sm text-slate-500">
              Diperpanjang{' '}
              {new Date(profile.current_period_end).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </section>

        {/* Aksi */}
        {isPro ? (
          <form action={openCustomerPortal} className="mt-4">
            <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900">
              Kelola Langganan
            </button>
          </form>
        ) : (
          <section className="mt-4 rounded-xl border border-slate-900 bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={15} />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Upgrade
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Pro
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-slate-500" />
                {CREDIT_LABEL} kredit setiap bulan
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-slate-500" />
                Batalkan kapan saja
              </li>
            </ul>
            <form action={createCheckoutSession} className="mt-6">
              <button className="w-full rounded-md bg-white py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
                Upgrade ke Pro
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}

const CREDIT_LABEL = 100