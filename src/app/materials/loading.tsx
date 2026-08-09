// src/app/materials/loading.tsx
export default function MaterialsLoading() {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-3xl px-6 py-12">
          <div className="mb-10">
            <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded bg-slate-100" />
          </div>
  
          <div className="mb-6 h-12 animate-pulse rounded-lg border border-slate-200 bg-white" />
  
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="mt-5 h-7 w-28 animate-pulse rounded-md bg-slate-100" />
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }