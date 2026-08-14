// src/app/(app)/AppShell.tsx

import AppFooter from './AppFooter'
import AppNav from './AppNav'

export default function AppShell({
  children,
  credits,
}: {
  children: React.ReactNode
  credits?: number | null
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppNav credits={credits} />

      <div className="flex-1">
        {children}
      </div>

      <AppFooter />
    </div>
  )
}