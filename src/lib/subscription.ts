// src/lib/subscription.ts

// Satu-satunya definisi "Pro" di seluruh aplikasi.
// User dianggap Pro HANYA jika plan pro DAN langganan benar-benar aktif.
// User 'past_due' (nunggak) atau 'canceled' otomatis diperlakukan sebagai Free.
type ProfileTier = {
    plan?: string | null
    subscription_status?: string | null
  }
  
  export function isProUser(profile: ProfileTier | null | undefined): boolean {
    return profile?.plan === 'pro' && profile?.subscription_status === 'active'
  }
  
  // Batas materi per tier. Ubah di sini, berlaku ke seluruh app.
  export const MATERIAL_LIMITS = { free: 3, pro: 50 } as const
  
  export function materialLimit(profile: ProfileTier | null | undefined): number {
    return isProUser(profile) ? MATERIAL_LIMITS.pro : MATERIAL_LIMITS.free
  }