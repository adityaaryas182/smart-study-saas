// src/app/materials/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createMaterial, deleteMaterial } from './actions'
import GenerateQuizButton from './GenerateQuizButton' // Import tombol Generate AI

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams
  const supabase = await createClient()

  // Proteksi: hanya user login yang boleh masuk.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS otomatis memfilter -> hanya materi milik user ini yang kembali.
  const { data: materials } = await supabase
    .from('materials')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Materi Belajar</h1>
        <Link href="/" className="text-sm underline">← Beranda</Link>
      </div>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Form tambah materi */}
      <form action={createMaterial} className="mb-10 space-y-3 rounded-lg border p-4">
        <input
          name="title"
          type="text"
          required
          placeholder="Judul materi (mis. Bab 3 - Fotosintesis)"
          className="w-full rounded border px-3 py-2"
        />
        <textarea
          name="content"
          required
          rows={6}
          placeholder="Tempel teks materi di sini. Nanti AI akan membuat kuis dari teks ini."
          className="w-full rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Simpan Materi
        </button>
      </form>

      {/* Daftar materi */}
      <div className="space-y-3">
        {(!materials || materials.length === 0) && (
          <p className="text-center text-sm text-gray-400">
            Belum ada materi. Tambahkan yang pertama di atas.
          </p>
        )}

        {materials?.map((m) => (
          <div key={m.id} className="rounded-lg border p-4 shadow-sm">
            {/* Bagian atas: Info Materi & Tombol Hapus */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-semibold text-lg">{m.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{m.content}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(m.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <form action={deleteMaterial}>
                <input type="hidden" name="id" value={m.id} />
                <button
                  type="submit"
                  className="shrink-0 rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Hapus
                </button>
              </form>
            </div>

            {/* Bagian bawah: Tombol Generate Quiz (Client Component) */}
            <div className="mt-4 pt-4 border-t">
              <GenerateQuizButton materialId={m.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}