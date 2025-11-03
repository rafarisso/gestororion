import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
export default function UploadCard({ bucket, title }: { bucket: 'invoices'|'pos_reports', title: string }) {
  const [file, setFile] = useState<File | null>(null); const [msg, setMsg] = useState<string>('')
  async function upload() {
    if (!file) return
    const path = `${bucket}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
    if (error) { setMsg('Erro no upload: ' + error.message); return }
    setMsg('Arquivo enviado! A função de leitura automática processará em seguida.')
    setFile(null)
  }
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
      <div className="font-semibold mb-2">{title}</div>
      <input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <button onClick={upload} className="mt-3 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white">Enviar</button>
      {!!msg && <div className="text-sm mt-2 text-neutral-300">{msg}</div>}
    </div>
  )
}
