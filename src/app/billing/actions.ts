// src/app/billing/actions.ts
'use server'

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// TIDAK ADA lagi `const stripe = new Stripe(...)` di sini (level atas).

export async function createCheckoutSession() {
  // Inisialisasi di dalam fungsi -> jalan saat runtime, bukan saat build.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    ...(profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: profile?.email ?? user.email }),
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } },
    success_url: `${siteUrl}/billing?status=success`,
    cancel_url: `${siteUrl}/billing?status=cancelled`,
  })

  if (session.url) redirect(session.url)
}

export async function openCustomerPortal() {
  // Inisialisasi di dalam fungsi juga.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) redirect('/billing?status=no_subscription')

  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
  })

  redirect(portal.url)
}