import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Camera, Upload, RefreshCcw, SwitchCamera } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { AppShell } from '@/components/AppShell'
import { PlantTypePicker } from '@/components/PlantTypePicker'
import { DiagnosisResultCard } from '@/components/DiagnosisResultCard'
import { Button } from '@/components/ui/button'
import {
  diagnoseApi,
  getBrowserLocation,
  type DiagnosisResult,
  type PlantType,
} from '@/lib/diagnose'

export const Route = createFileRoute('/diagnose')({
  component: DiagnosePage,
})

type FacingMode = 'environment' | 'user'

function DiagnosePage() {
  const ready = useAuthGuard()

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [plantType, setPlantType] = useState<PlantType>('potato')
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStream(null)
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      })
      streamRef.current = mediaStream
      setStream(mediaStream)
      if (videoRef.current) videoRef.current.srcObject = mediaStream
      const devices = await navigator.mediaDevices.enumerateDevices()
      setHasMultipleCameras(devices.filter((d) => d.kind === 'videoinput').length > 1)
    } catch {
      setMessage({ type: 'error', text: 'Could not access camera.' })
    }
  }

  useEffect(() => {
    if (!ready) return
    startCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, facingMode])

  const flipCamera = () => {
    stopCamera()
    setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        setPhotoBlob(blob)
        setPhotoUrl(URL.createObjectURL(blob))
        stopCamera()
      },
      'image/jpeg',
      0.9,
    )
  }

  const retakePhoto = () => {
    setPhotoBlob(null)
    setPhotoUrl(null)
    setMessage(null)
    setResult(null)
    startCamera()
  }

  const uploadPhoto = async () => {
    if (!photoBlob) return
    setUploading(true)
    setMessage(null)
    setResult(null)
    try {
      const location = (await getBrowserLocation()) ?? undefined
      const diagnosis = await diagnoseApi.diagnose({
        image: photoBlob,
        plantType,
        location,
      })
      setResult(diagnosis)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setMessage({
        type: 'error',
        text: axiosErr.response?.data?.error || 'Diagnosis failed.',
      })
    } finally {
      setUploading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  return (
    <AppShell
      title="Diagnose a plant"
      subtitle="Capture a leaf — we'll route it to the right model."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-6xl">
        {/* Capture column */}
        <div className="lg:col-span-3 space-y-4">
          <PlantTypePicker
            value={plantType}
            onChange={setPlantType}
            disabled={uploading}
          />

          <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-paper aspect-[4/3] flex items-center justify-center relative">
            {!photoUrl ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {stream && hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={flipCamera}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                    aria-label="Switch camera"
                  >
                    <SwitchCamera className="h-4 w-4 text-foreground/70" />
                  </button>
                )}

                {stream && (
                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="h-14 w-14 rounded-full bg-card border-2 border-primary shadow-md flex items-center justify-center hover:bg-primary/10 transition-colors"
                      aria-label="Capture photo"
                    >
                      <Camera className="h-6 w-6 text-primary" />
                    </button>
                  </div>
                )}

                {!stream && (
                  <span className="text-sm text-muted-foreground">Starting camera…</span>
                )}
              </>
            ) : (
              <>
                <img src={photoUrl} alt="Captured plant" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={retakePhoto}
                    className="gap-1.5 shadow-sm"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Retake
                  </Button>
                  <Button
                    size="sm"
                    onClick={uploadPhoto}
                    disabled={uploading}
                    className="gap-1.5 shadow-sm"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? 'Analyzing…' : 'Diagnose'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {message && (
            <div
              className={`w-full px-4 py-3 rounded-md border text-sm text-center ${
                message.type === 'success'
                  ? 'bg-primary/8 border-primary/20 text-primary'
                  : 'bg-destructive/8 border-destructive/20 text-destructive'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Result column */}
        <div className="lg:col-span-2">
          {result ? (
            <DiagnosisResultCard result={result} />
          ) : (
            <div className="h-full min-h-[200px] rounded-xl border border-dashed border-border bg-card/40 flex items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Capture a photo and tap <span className="font-medium">Diagnose</span> to see
                results here.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
