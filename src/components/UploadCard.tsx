import { useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'

type Props = {
  bucket: 'invoices' | 'pos_reports'
  title: string
}

export default function UploadCard({ bucket, title }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  function handleFileSelected(selected: File | null) {
    setMsg('')
    setError('')
    setFile(selected)
  }

  function openFileDialog() {
    fileInputRef.current?.click()
  }

  function openCameraDialog() {
    cameraInputRef.current?.click()
  }

  async function upload() {
    if (!file) {
      setError('Selecione ou fotografe um arquivo antes de enviar.')
      return
    }
    const path = `${bucket}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name}`
    try {
      setUploading(true)
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
      if (uploadError) {
        setError('Erro no upload: ' + uploadError.message)
        return
      }
      setMsg(
        bucket === 'pos_reports'
          ? 'Relatório enviado! Quando processado, os valores serão somados automaticamente ignorando o campo “Crediário”.'
          : 'Arquivo enviado! A leitura automática entrará na fila de processamento.',
      )
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-neutral-400">
        Você pode escolher um arquivo existente ou abrir a câmera do celular/computador para fotografar o comprovante.
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openFileDialog}
          className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-sm"
        >
          Escolher arquivo
        </button>
        <button
          type="button"
          onClick={openCameraDialog}
          className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-sm"
        >
          Tirar foto agora
        </button>
        <button
          onClick={upload}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white"
        >
          {uploading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={bucket === 'pos_reports' ? '.pdf,.csv,image/*' : '.pdf,.xml,image/*'}
        onChange={(event: any) => handleFileSelected(event.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(event: any) => handleFileSelected(event.target.files?.[0] ?? null)}
      />
      {file && (
        <div className="text-xs text-neutral-400">
          Arquivo selecionado: <span className="text-neutral-200">{file.name}</span>
        </div>
      )}
      {!!msg && <div className="text-sm text-emerald-400">{msg}</div>}
      {!!error && <div className="text-sm text-red-400">{error}</div>}
    </div>
  )
}
