// src/app/dashboard/loading.tsx
export default function DashboardLoading() {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-5xl px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <div className="h-8 w-40 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
          </div>
  
          {/* Grid kartu metrik */}
          <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-5">
                <div className="mb-4 h-3 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-9 w-12 animate-pulse rounded-md bg-slate-200" />
              </div>
            ))}
          </div>
  
          {/* Dua panel */}
          <div className="mb-6 h-32 animate-pulse rounded-lg border border-slate-200 bg-white" />
          <div className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white" />
        </main>
      </div>
    )
  }