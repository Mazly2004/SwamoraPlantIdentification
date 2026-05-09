import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Camera, Upload, RefreshCcw, LogOut, SwitchCamera } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

type FacingMode = 'environment' | 'user'

function HomePage() {
  const { user, token, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Auth check on mount
  useEffect(() => {
    if (!token) {
      navigate({ to: '/login' })
      return
    }
    authApi.me(token)
      .then((fetchedUser) => {
        setAuth(fetchedUser, token)
        setReady(true)
      })
      .catch(() => {
        clearAuth()
        navigate({ to: '/login' })
      })
  }, [])

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

      // Check for multiple cameras after permission is granted (browsers reveal device list post-permission)
      const devices = await navigator.mediaDevices.enumerateDevices()
      setHasMultipleCameras(devices.filter((d) => d.kind === 'videoinput').length > 1)
    } catch {
      setMessage({ type: 'error', text: 'Could not access camera.' })
    }
  }

  // Start/restart camera when ready or when facing mode flips
  useEffect(() => {
    if (!ready) return
    startCamera()
    return () => stopCamera()
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
    canvas.toBlob((blob) => {
      if (!blob) return
      setPhotoBlob(blob)
      setPhotoUrl(URL.createObjectURL(blob))
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const retakePhoto = () => {
    setPhotoBlob(null)
    setPhotoUrl(null)
    setMessage(null)
    startCamera()
  }

  const uploadPhoto = async () => {
    if (!photoBlob) return
    setUploading(true)
    setMessage(null)
    const formData = new FormData()
    formData.append('image', photoBlob, `plant_${Date.now()}.jpg`)
    try {
      const res = await api.post('/api/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Image sent for processing.' })
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setMessage({ type: 'error', text: axiosErr.response?.data?.error || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    stopCamera()
    clearAuth()
    navigate({ to: '/login' })
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
            <path
              d="M16 5C9 7 7 13 5.5 18l1.2.4.6-1.4a3 3 0 0 0 1.7.5C15 17.5 18 6 18 6c-.5 1-4 1-4 1l2.5-3L16 5z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
          <span className="text-sm font-semibold tracking-tight">SwamoraPlant</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-xs">Sign out</span>
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 gap-5 max-w-lg mx-auto w-full">
        <div className="w-full text-left">
          <h2 className="text-base font-medium text-foreground">
            Hello, {user?.name || user?.email}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Point your camera at a plant to identify it.
          </p>
        </div>

        {/* Viewfinder */}
        <div className="w-full rounded-lg border border-border bg-card overflow-hidden shadow-paper aspect-[4/3] flex items-center justify-center relative">
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

              {/* Camera flip button — top-right, only when multiple cameras detected */}
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

              {/* Capture button — bottom center */}
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
                <Button variant="secondary" size="sm" onClick={retakePhoto} className="gap-1.5 shadow-sm">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Retake
                </Button>
                <Button size="sm" onClick={uploadPhoto} disabled={uploading} className="gap-1.5 shadow-sm">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Status */}
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
      </main>
    </div>
  )
}
