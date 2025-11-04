import { useEffect, useRef, useState } from 'react'
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
  const [usingCamera, setUsingCamera] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    setCameraSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia)
    return () => {
      stopCamera()
    }
  }, [])

  function handleFileSelected(selected: File | null) {
    setMsg('')
    setError('')
    setFile(selected)
    if (selected) {
      setUsingCamera(false)
      stopCamera()
    }
  }

  function openFileDialog() {
    fileInputRef.current?.click()
  }

  function openCameraDialog() {
    cameraInputRef.current?.click()
  }

  async function startCamera() {
    if (!cameraSupported) {
      setCameraError('Este dispositivo/navegador não permite capturar fotos direto pela câmera.')
      return
    }
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setUsingCamera(true)
      setMsg('')
      setError('')
      setFile(null)
    } catch (err: any) {
      console.error(err)
      setCameraError('Não foi possível abrir a câmera. Libere o acesso e tente novamente.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
  }

  function cancelCamera() {
    stopCamera()
    setUsingCamera(false)
    setCameraError(null)
  }

  async function capturePhoto() {
    if (!videoRef.current) return
    const video = videoRef.current
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) {
      setCameraError('A câmera ainda está inicializando, aguarde um instante e tente novamente.')
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, width, height)
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Não foi possível capturar a foto. Tente novamente.')
        return
      }
      const captured = new File([blob], `captura-${Date.now()}.jpg`, { type: 'image/jpeg' })
      handleFileSelected(captured)
      setMsg('Foto capturada! Revise e clique em enviar para salvar.')
    }, 'image/jpeg', 0.92)
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
      cancelCamera()
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
          Fazer upload rápido
        </button>
        <button
          type="button"
          onClick={startCamera}
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
      {usingCamera && (
        <div className="space-y-3 border border-neutral-800 rounded-xl p-3">
          <div className="text-sm text-neutral-300">Aponte a câmera para a nota ou relatório e clique em “Capturar”.</div>
          <video ref={videoRef} className="w-full rounded-lg bg-black" playsInline muted />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-sm font-medium"
            >
              Capturar foto
            </button>
            <button
              type="button"
              onClick={cancelCamera}
              className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-sm"
            >
              Cancelar câmera
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      {file && (
        <div className="text-xs text-neutral-400">
          Arquivo selecionado: <span className="text-neutral-200">{file.name}</span>
        </div>
      )}
      {!!msg && <div className="text-sm text-emerald-400">{msg}</div>}
      {!!error && <div className="text-sm text-red-400">{error}</div>}
      {!!cameraError && <div className="text-sm text-red-400">{cameraError}</div>}
    </div>
  )
}
