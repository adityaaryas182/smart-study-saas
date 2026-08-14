# PROGRESS.md — AI-Powered Smart Study & Quiz Generator

> Dokumen onboarding & konteks. Tempel ini di awal chat baru (atau untuk kontributor
> baru) supaya langsung paham proyek tanpa mengulang dari nol.

---

## 0. Cara Pakai (untuk kontributor / AI baru)

Tempel dokumen ini, lalu beri instruksi:

> "Bertindaklah sebagai Senior Full Stack/Backend engineer di proyek ini. Gaya:
> teknis, jujur, jelaskan *why* di balik keputusan, step-by-step. Untuk diagram,
> beri **script mentah** (Mermaid/PlantUML) — bukan file. Baca PROGRESS.md untuk
> konteks, lalu lanjutkan dari bagian 'Status Saat Ini'. Sebelum menyarankan library
> atau API baru, verifikasi versi terkini dulu (jangan pakai memori yang bisa usang).
> Selalu ingatkan `npm run build` sebelum push."

Aturan kerja penting yang sudah terbukti di proyek ini:
- **`npm run build` sebelum SETIAP push.** `next dev` longgar, `next build` type-check ketat. Sudah 3x build Vercel gagal karena ini.
- **Env hanya dibaca saat server START.** Ubah `.env.local` → wajib restart `npm run dev`.
- **Env Vercel butuh REDEPLOY** untuk aktif (bukan cuma save).
- **File di VS Code belum tersimpan sampai Ctrl+S.** Nyalakan Auto Save. Sudah 2x bug karena file belum di-save (terlihat di editor tapi tidak ada di disk).
- User pakai **Windows PowerShell** — beri perintah PowerShell (`Remove-Item -Recurse -Force`, `curl.exe`, `Test-Path`), bukan gaya Linux.

---

## 1. Ringkasan Proyek

SaaS belajar cerdas untuk portofolio. User input materi (paste teks ATAU upload PDF)
→ AI (Gemini) generate kuis → user mengerjakan → sistem menjadwalkan pengulangan via
Spaced Repetition (SM-2), dengan soal yang sering salah diprioritaskan. Ada tier
Free/Pro dengan billing Stripe. **Constraint: zero-cost, semua free tier.**

**LIVE:** https://smart-study-saas-jdc4.vercel.app
**Repo:** https://github.com/adityaaryas182/smart-study-saas

---

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind, src-dir)
- **DB + Auth:** Supabase (PostgreSQL + RLS + plpgsql RPC functions)
- **AI:** Google Gemini via `@google/genai`. Model: **`gemini-3.5-flash`**
- **PDF:** `unpdf` (serverless-safe; JANGAN pakai pdf-parse — crash di Vercel)
- **Validasi:** Zod
- **Billing:** Stripe (Checkout + Webhooks), Test/Sandbox mode
- **Charts:** Recharts
- **Hosting:** Vercel (auto-deploy tiap push ke main)

---

## 3. Keputusan Arsitektur (DIKUNCI)

- **Billing HYBRID:** credit-based (tiap generate potong 1 kredit) + langganan Pro
  = refill 100 kredit/bulan. Kredit yang sudah dimiliki TIDAK hilang saat turun tier.
- **Semua logika multi-langkah = plpgsql RPC function** (dipanggil `.rpc()`), bukan
  JS terpisah — supaya atomik (1 transaksi, tak bisa partial write).
- **Kredit dipotong PALING AKHIR**, di transaksi yang sama dengan simpan soal.
- **Definisi "Pro" terpusat** di `isProUser()` (`lib/subscription.ts`): butuh
  `plan='pro'` DAN `subscription_status='active'`. past_due = diperlakukan Free.
- **correct_answer TIDAK dikirim ke client** saat study session (anti-contek);
  penilaian di server.
- **Penegakan (tier limit, grading) di SERVER**, UI hanya mirror.
- **SM-2 gotchas:** EF dihitung tanpa syarat & tidak reset saat lapse (hanya reps &
  interval yang reset); EF floor 1.3; quality 0-5 (benar=3/4/5 dari rating user, salah=2).

---

## 4. Database (6 tabel)

`users` (id→auth.users, credits, role, plan, subscription_status, stripe_customer_id,
current_period_end), `materials` (user_id FK, title, content), `questions`
(material_id FK, question_text, options jsonb, correct_answer), `user_progress`
(junction user×question + state SM-2, UNIQUE(user_id,question_id), index next_review_date),
`credit_transactions` (ledger append-only), `stripe_events` (PK event_id = idempotency).

Migrasi: `supabase/migrations/0001`–`0006`.
- 0001 skema awal · 0002 generate_and_persist · 0003 submit_answer (SM-2)
- 0004 get_study_session (weighted) · 0005 get_dashboard · 0006 stripe billing

RPC functions: `generate_and_persist`, `submit_answer`, `get_study_session`,
`get_dashboard`, `activate_pro_subscription`, `update_subscription_status`.
Semua di-`revoke` dari anon/authenticated, hanya `service_role` (backend).

---

## 5. Struktur Kode

```
src/
├── app/
│   ├── page.tsx                    beranda (hub: kredit + 3 kartu aksi)
│   ├── (auth)/                     login, signup, actions (email + Google OAuth)
│   ├── auth/callback/route.ts      OAuth callback
│   ├── materials/                  page, actions, AddMaterialForm, GenerateQuizButton
│   ├── study/page.tsx              sesi belajar (rating Susah/Sedang/Mudah)
│   ├── dashboard/                  page, ReviewChart, loading
│   ├── billing/                    page, actions (Stripe checkout + portal)
│   ├── api/
│   │   ├── generate-quiz/          Gemini + Zod + retry + RPC atomik
│   │   ├── materials/upload-pdf/   unpdf ekstraksi → simpan materi
│   │   ├── quiz/study-session/     weighted selection
│   │   ├── quiz/submit-answer/     grading server + SM-2
│   │   ├── analytics/dashboard/    agregat statistik
│   │   └── webhooks/stripe/        webhook idempoten
│   ├── error.tsx, not-found.tsx    error states
│   └── layout.tsx (suppressHydrationWarning di body — ekstensi browser)
├── lib/
│   ├── supabase/ (client, server, admin)  admin = service role, SERVER ONLY
│   ├── gemini.ts, validation.ts, subscription.ts
└── proxy.ts                        (Next 16: bukan middleware.ts)
```

---

## 6. Status Saat Ini

### ✅ LENGKAP & LIVE DI PRODUKSI
- Auth (email + Google OAuth), profil auto via trigger handle_new_user
- CRUD materi + upload PDF (unpdf, dengan guard scan/ukuran/tipe)
- Generate kuis (Gemini + Zod + retry + transaksi atomik)
- Study session (weighted selection) + rating SM-2 halus (Susah/Sedang/Mudah)
- Dashboard analitik (Recharts)
- Stripe billing (checkout + webhook idempoten + customer portal + refill)
- Tier-gating (Free 3 / Pro 50 materi, terpusat via isProUser)
- Cegah duplikat generate (konfirmasi + badge jumlah soal)
- Error/loading/404 states
- README lengkap dengan diagram

### ⏳ ROADMAP TERSISA (opsional)
1. **Upload DOCX** — tambahan cepat. Pakai `mammoth` untuk ekstraksi, sisanya
   IDENTIK dengan pipeline PDF (`upload-pdf/route.ts` sebagai template).
2. **OCR fallback** untuk PDF scan (kompleks — butuh Tesseract/API OCR).
3. Cleanup data testing sebelum demo (soal duplikat di materi SRS).

---

## 7. Gotchas / Learnings (jangan terulang)

- **Next.js 16:** middleware.ts → proxy.ts; Route Handler wajib named export per
  metode HTTP (`export async function POST`); `next build` type-check ketat.
- **Supabase:** project baru pakai key `sb_publishable_`/`sb_secret_` (bukan legacy JWT).
- **Gemini:** pakai `@google/genai` (bukan deprecated `@google/generative-ai`); key
  format `AQ.` valid tapi butuh SDK terbaru; model `gemini-3.5-flash`.
- **unpdf:** dengan `mergePages:true`, `text` dijamin string — pakai `text.trim()`
  langsung (jangan handle array, bikin TS error). Registrasi di `serverExternalPackages`.
- **Stripe:** init `new Stripe()` di DALAM fungsi handler (bukan level modul) — kalau
  di modul, build gagal karena env belum ada saat "collect page data". `STRIPE_PRICE_ID`
  = `price_...` BUKAN `prod_...`. Webhook produksi harus didaftarkan terpisah dari
  `stripe listen` lokal (whsec berbeda).
- **Vercel:** URL ber-hash = deployment beku lama; pakai URL bersih untuk produksi.
  OAuth redirect diatur oleh Site URL di Supabase (bukan env Vercel).