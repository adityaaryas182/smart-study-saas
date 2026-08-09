// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const CREDIT_REFILL = 100 // kredit bulanan untuk Pro

export async function POST(request: Request) {
  // Inisialisasi di dalam handler (runtime), bukan level modul (build-time).
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  // WAJIB: baca body mentah. Signature dihitung dari byte asli.
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    return NextResponse.json({ error: 'NO_SIGNATURE' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    // Melempar error kalau signature palsu -> tolak.
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[stripe] signature invalid:', err)
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      // Pembayaran pertama berhasil -> aktifkan Pro.
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        if (!userId || !session.subscription) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)

        const { error } = await admin.rpc('activate_pro_subscription', {
          p_user_id: userId,
          p_customer_id: session.customer as string,
          p_period_end: new Date(sub.items.data[0].current_period_end * 1000).toISOString(),
          p_credit_refill: CREDIT_REFILL,
          p_event_id: event.id,          // <- kunci idempotency
        })
        if (error) throw error
        break
      }

      // Perpanjangan bulanan berhasil -> isi ulang kredit.
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as any).subscription
        if (!subId || invoice.billing_reason === 'subscription_create') break // sudah ditangani di atas

        const sub = await stripe.subscriptions.retrieve(subId as string)
        const userId = sub.metadata?.user_id
        if (!userId) break

        const { error } = await admin.rpc('activate_pro_subscription', {
          p_user_id: userId,
          p_customer_id: invoice.customer as string,
          p_period_end: new Date(sub.items.data[0].current_period_end * 1000).toISOString(),
          p_credit_refill: CREDIT_REFILL,
          p_event_id: event.id,
        })
        if (error) throw error
        break
      }

      // Kartu gagal ditagih -> tandai past_due (akses dicabut).
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const { error } = await admin.rpc('update_subscription_status', {
          p_customer_id: invoice.customer as string,
          p_status: 'past_due',
        })
        if (error) throw error
        break
      }

      // Langganan dibatalkan -> kembali ke free.
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { error } = await admin.rpc('update_subscription_status', {
          p_customer_id: sub.customer as string,
          p_status: 'canceled',
        })
        if (error) throw error
        break
      }
    }
  } catch (err) {
    console.error(`[stripe] gagal memproses ${event.type}:`, err)
    // 500 -> Stripe akan mencoba lagi. Idempotency menjaga agar aman.
    return NextResponse.json({ error: 'PROCESSING_FAILED' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}