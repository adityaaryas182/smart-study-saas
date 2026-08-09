// src/app/materials/AddMaterialForm.tsx
'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createMaterial } from './actions'

export default function AddMaterialForm() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-8 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
      >
        <Plus size={15} strokeWidth={2.5} />
        Tambah Materi
      </button>
    )
  }

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800">
          Materi Baru
        </h2>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 transition hover:text-slate-900"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>
      </div>

      <form action={createMaterial} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Judul
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="Bab 3 — Fotosintesis"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Isi Materi
          </label>
          <textarea
            name="content"
            required
            rows={7}
            placeholder="Tempel teks materi di sini. AI akan membuat soal dari teks ini."
            className="w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Semakin lengkap materinya, semakin baik kualitas soal yang dihasilkan.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Simpan Materi
          </button>
        </div>
      </form>
    </div>
  )
}