// src/app/materials/AddMaterialForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  X,
  FileText,
  Type,
  Loader2,
  FileArchive,
} from 'lucide-react'

import { createMaterial } from './actions'

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function AddMaterialForm() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'text' | 'pdf' | 'docx'>('text')

  // state khusus upload PDF
  const [file, setFile] = useState<File | null>(null)
  const [pdfTitle, setPdfTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pdfError, setPdfError] = useState('')

  // state khusus upload DOCX
  const [docxFile, setDocxFile] = useState<File | null>(null)
  const [docxTitle, setDocxTitle] = useState('')
  const [docxUploading, setDocxUploading] = useState(false)
  const [docxError, setDocxError] = useState('')

  async function handlePdfUpload() {
    if (!file) return

    setUploading(true)
    setPdfError('')

    try {
      const fd = new FormData()

      fd.append('file', file)
      fd.append('title', pdfTitle)

      const res = await fetch('/api/materials/upload-pdf', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      if (data.ok) {
        setOpen(false)
        setFile(null)
        setPdfTitle('')
        router.refresh()
      } else {
        setPdfError(data.message ?? 'Gagal mengunggah PDF.')
      }
    } catch {
      setPdfError('Gagal terhubung ke server.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDocxUpload() {
    if (!docxFile) return

    setDocxUploading(true)
    setDocxError('')

    try {
      const fd = new FormData()

      fd.append('file', docxFile)
      fd.append('title', docxTitle)

      const res = await fetch('/api/materials/upload-docx', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      if (data.ok) {
        setOpen(false)
        setDocxFile(null)
        setDocxTitle('')
        router.refresh()
      } else {
        setDocxError(data.message ?? 'Gagal mengunggah DOCX.')
      }
    } catch {
      setDocxError('Gagal terhubung ke server.')
    } finally {
      setDocxUploading(false)
    }
  }

  function handleDocxFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0] ?? null

    setDocxError('')

    if (!selectedFile) {
      setDocxFile(null)
      return
    }

    const hasDocxExtension = /\.docx$/i.test(selectedFile.name)

    const hasValidMime =
      selectedFile.type === DOCX_MIME ||
      selectedFile.type === ''

    if (!hasDocxExtension || !hasValidMime) {
      setDocxFile(null)
      setDocxError('File harus berformat DOCX.')
      event.target.value = ''
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setDocxFile(null)
      setDocxError('Ukuran maksimal 10 MB.')
      event.target.value = ''
      return
    }

    setDocxFile(selectedFile)
  }

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

      {/* Tab pemilih mode */}
      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => setMode('text')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition ${
            mode === 'text'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Type size={14} />
          Tempel Teks
        </button>

        <button
          onClick={() => setMode('pdf')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition ${
            mode === 'pdf'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText size={14} />
          Upload PDF
        </button>

        <button
          onClick={() => setMode('docx')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition ${
            mode === 'docx'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileArchive size={14} />
          Upload DOCX
        </button>
      </div>

      {mode === 'text' ? (
        // --- MODE TEKS ---
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
              placeholder="Tempel teks materi di sini."
              className="w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
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
      ) : mode === 'pdf' ? (
        // --- MODE PDF ---
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Judul{' '}
              <span className="text-slate-400">(opsional)</span>
            </label>

            <input
              type="text"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              placeholder="Kosongkan untuk pakai nama file"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              File PDF
            </label>

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-slate-400">
              <FileText
                size={22}
                className="text-slate-400"
              />

              {file ? (
                <span className="text-sm font-medium text-slate-900">
                  {file.name}
                </span>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">
                    Klik untuk pilih PDF
                  </span>

                  <span className="text-xs text-slate-400">
                    Maksimal 10 MB · PDF berbasis teks
                  </span>
                </>
              )}

              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null)
                  setPdfError('')
                }}
              />
            </label>
          </div>

          {pdfError && (
            <p className="text-sm text-red-600">
              {pdfError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Batal
            </button>

            <button
              onClick={handlePdfUpload}
              disabled={!file || uploading}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Memproses…
                </>
              ) : (
                'Upload & Simpan'
              )}
            </button>
          </div>
        </div>
      ) : (
        // --- MODE DOCX ---
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Judul{' '}
              <span className="text-slate-400">(opsional)</span>
            </label>

            <input
              type="text"
              value={docxTitle}
              onChange={(e) => setDocxTitle(e.target.value)}
              placeholder="Kosongkan untuk pakai nama file"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              File DOCX
            </label>

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-slate-400">
              <FileArchive
                size={22}
                className="text-slate-400"
              />

              {docxFile ? (
                <span className="text-sm font-medium text-slate-900">
                  {docxFile.name}
                </span>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">
                    Klik untuk pilih DOCX
                  </span>

                  <span className="text-xs text-slate-400">
                    Maksimal 10 MB · Microsoft Word DOCX
                  </span>
                </>
              )}

              <input
                type="file"
                accept={`.docx,${DOCX_MIME}`}
                className="hidden"
                onChange={handleDocxFileChange}
              />
            </label>
          </div>

          {docxError && (
            <p className="text-sm text-red-600">
              {docxError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Batal
            </button>

            <button
              onClick={handleDocxUpload}
              disabled={!docxFile || docxUploading}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40"
            >
              {docxUploading ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Memproses…
                </>
              ) : (
                'Upload & Simpan'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}