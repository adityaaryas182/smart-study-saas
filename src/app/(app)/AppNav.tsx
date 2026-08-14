// src/app/(app)/AppNav.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Coins,
  LogOut,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'

import { signOut } from '../(auth)/actions'

const navItems = [
  {
    href: '/',
    label: 'Beranda',
  },
  {
    href: '/materials',
    label: 'Materi',
  },
  {
    href: '/study',
    label: 'Belajar',
  },
  {
    href: '/dashboard',
    label: 'Progres',
  },
  {
    href: '/billing',
    label: 'Langganan',
  },
]

export default function AppNav({
  credits,
}: {
  credits?: number | null
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] =
    useState(false)

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
            <Sparkles
              size={15}
              strokeWidth={2.2}
            />
          </span>

          <span className="text-sm font-bold tracking-tight text-slate-900">
            Smart Study
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navigasi utama"
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
        >
          {navItems.map((item) => {
            const active = isActive(
              item.href
            )

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="ml-auto hidden items-center gap-2.5 md:flex">
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          >
            <Coins size={13} />

            {typeof credits === 'number'
              ? `${credits} kredit`
              : 'Kredit'}
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            >
              <LogOut size={13} />
              Keluar
            </button>
          </form>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          aria-label={
            mobileOpen
              ? 'Tutup menu'
              : 'Buka menu'
          }
          aria-expanded={mobileOpen}
          aria-controls="mobile-app-menu"
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 md:hidden"
        >
          {mobileOpen ? (
            <X size={17} />
          ) : (
            <Menu size={17} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-app-menu"
          className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 shadow-lg md:hidden"
        >
          <nav
            aria-label="Navigasi mobile"
            className="space-y-1"
          >
            {navItems.map((item) => {
              const active = isActive(
                item.href
              )

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-4">
            <Link
              href="/billing"
              onClick={() =>
                setMobileOpen(false)
              }
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
            >
              <Coins size={13} />

              {typeof credits === 'number'
                ? `${credits} kredit`
                : 'Kredit'}
            </Link>

            <form
              action={signOut}
              className="flex-1"
            >
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
              >
                <LogOut size={13} />
                Keluar
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}