import { useEffect, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

/**
 * Full-screen plant-themed transition overlay. Watches the router location
 * and shows a polished leaf-drawing animation on every pathname change.
 *
 * - A leaf outline strokes itself in via SVG dash-offset animation
 * - Then it fills with a green gradient
 * - Veins fan out from the midrib
 * - Ambient pollen particles drift upward across the backdrop
 * - A thin progress bar tracks the minimum duration along the bottom
 */
export function PlantLoader({
  minDurationMs = 850,
}: {
  minDurationMs?: number
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [visible, setVisible] = useState(true)
  const [animKey, setAnimKey] = useState(0)
  const isFirstRender = useRef(true)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setVisible(true)
      setAnimKey((k) => k + 1) // force-restart the animations on each nav
    }
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setVisible(false)
      timer.current = null
    }, minDurationMs)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [pathname, minDurationMs])

  return (
    <div
      aria-hidden={!visible}
      className={
        'fixed inset-0 z-[100] pointer-events-none transition-opacity duration-500 ease-out ' +
        (visible ? 'opacity-100' : 'opacity-0')
      }
    >
      {/* Backdrop — soft cream + sun glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 25%, rgba(202,242,107,0.45) 0%, rgba(202,242,107,0) 60%),' +
            'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(238,246,224,0.92) 60%, rgba(220,238,200,0.95) 100%)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 25%, rgba(124,208,106,0.30) 0%, rgba(124,208,106,0) 60%),' +
            'linear-gradient(180deg, rgba(8,16,12,0.88) 0%, rgba(12,28,20,0.94) 100%)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        }}
      />

      <Particles count={9} animKey={animKey} />

      <div className="relative h-full w-full flex flex-col items-center justify-center gap-6 px-6">
        <LeafSvg key={animKey} />

        <div className="flex flex-col items-center gap-2">
          <div className="text-base font-semibold tracking-tight text-[#1f4f10] dark:text-[#caf26b]">
            FarmSight
          </div>
          <div className="text-xs text-[#3a7d1f]/80 dark:text-[#caf26b]/70 tracking-wide inline-flex items-center">
            Cultivating your view
            <DotPulse />
          </div>
        </div>

        {/* Minimum-duration progress bar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-56 h-1 rounded-full bg-[#3a7d1f]/10 dark:bg-[#caf26b]/15 overflow-hidden">
          <div
            key={animKey}
            className="h-full rounded-full bg-gradient-to-r from-[#caf26b] via-[#7cd06a] to-[#3a7d1f]"
            style={{
              animation: `pl-progress ${minDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pl-progress {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes pl-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
          40%           { opacity: 1;   transform: translateY(-2px); }
        }
      `}</style>
    </div>
  )
}

function DotPulse() {
  return (
    <span className="inline-flex items-end gap-0.5 ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-current"
          style={{
            animation: 'pl-dot-pulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </span>
  )
}

function LeafSvg() {
  return (
    <>
      <style>{`
        @keyframes pl-leaf-outline {
          0%   { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pl-leaf-fill {
          0%, 30%  { opacity: 0; }
          100%     { opacity: 1; }
        }
        @keyframes pl-vein {
          0%   { stroke-dashoffset: 80; opacity: 0; }
          30%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes pl-leaf-float {
          0%, 100% { transform: rotate(-4deg) translateY(0); }
          50%      { transform: rotate(2deg)  translateY(-3px); }
        }
        @keyframes pl-glow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.08); }
        }
        .pl-leaf-wrap {
          transform-origin: 50% 100%;
          animation: pl-leaf-float 3.6s ease-in-out 1.1s infinite;
        }
        .pl-leaf-body {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: pl-leaf-outline 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .pl-leaf-fill {
          opacity: 0;
          animation: pl-leaf-fill 1.1s ease-out 0.35s forwards;
        }
        .pl-leaf-midrib {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: pl-vein 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }
        .pl-vein {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
        }
        .pl-vein-1 { animation: pl-vein 0.6s ease-out 0.85s both; }
        .pl-vein-2 { animation: pl-vein 0.6s ease-out 0.95s both; }
        .pl-vein-3 { animation: pl-vein 0.6s ease-out 1.05s both; }
        .pl-vein-4 { animation: pl-vein 0.6s ease-out 0.90s both; }
        .pl-vein-5 { animation: pl-vein 0.6s ease-out 1.00s both; }
        .pl-vein-6 { animation: pl-vein 0.6s ease-out 1.10s both; }
        .pl-leaf-glow {
          transform-origin: 50% 50%;
          animation: pl-glow 2.4s ease-in-out 0.8s infinite;
        }
      `}</style>

      <div className="relative">
        {/* Soft halo behind the leaf */}
        <div
          className="pl-leaf-glow absolute inset-0 -m-6 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(124,208,106,0.55) 0%, rgba(124,208,106,0) 65%)',
            filter: 'blur(10px)',
          }}
        />

        <svg
          viewBox="0 0 160 160"
          width="148"
          height="148"
          className="relative drop-shadow-[0_12px_32px_rgba(58,125,31,0.28)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pl-leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dfff8f" />
              <stop offset="55%" stopColor="#7cd06a" />
              <stop offset="100%" stopColor="#2c6814" />
            </linearGradient>
            <linearGradient id="pl-leaf-shine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          <g className="pl-leaf-wrap">
            <path
              className="pl-leaf-fill"
              d="M80 18 C 118 32, 140 64, 132 102 C 124 138, 88 146, 60 132 C 30 116, 22 76, 38 50 C 50 30, 64 22, 80 18 Z"
              fill="url(#pl-leaf-grad)"
            />
            <path
              className="pl-leaf-fill"
              d="M62 38 C 80 28, 96 30, 110 42 C 92 38, 76 42, 64 56 Z"
              fill="url(#pl-leaf-shine)"
              opacity="0.7"
            />
            <path
              className="pl-leaf-body"
              d="M80 18 C 118 32, 140 64, 132 102 C 124 138, 88 146, 60 132 C 30 116, 22 76, 38 50 C 50 30, 64 22, 80 18 Z"
              fill="none"
              stroke="#2c6814"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="pl-leaf-midrib"
              d="M80 18 C 78 50, 76 90, 72 132"
              fill="none"
              stroke="#2c6814"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path className="pl-vein pl-vein-1" d="M78 42 C 92 46, 104 56, 112 66"
              stroke="#2c6814" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path className="pl-vein pl-vein-2" d="M76 70 C 94 74, 110 84, 122 96"
              stroke="#2c6814" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path className="pl-vein pl-vein-3" d="M74 100 C 90 104, 104 114, 116 124"
              stroke="#2c6814" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path className="pl-vein pl-vein-4" d="M78 42 C 64 48, 52 58, 44 68"
              stroke="#2c6814" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path className="pl-vein pl-vein-5" d="M76 70 C 60 76, 46 86, 38 100"
              stroke="#2c6814" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path className="pl-vein pl-vein-6" d="M74 100 C 60 106, 50 118, 42 128"
              stroke="#2c6814" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Dew drop */}
            <circle className="pl-leaf-fill" cx="98" cy="64" r="3" fill="rgba(255,255,255,0.85)" />
            <circle className="pl-leaf-fill" cx="97" cy="63" r="1" fill="white" />
          </g>
        </svg>
      </div>
    </>
  )
}

function Particles({ count, animKey }: { count: number; animKey: number }) {
  // Drifting pollen / spore particles. Positions and durations are seeded
  // from the index so they look organic without random number generation.
  const particles = Array.from({ length: count }).map((_, i) => {
    const left = (i * 97) % 100
    const delay = (i * 0.23) % 2
    const duration = 4 + ((i * 7) % 5)
    const size = 3 + (i % 3)
    return { left, delay, duration, size, i }
  })
  return (
    <div key={animKey} className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes pl-particle {
          0%   { transform: translateY(110vh) translateX(0)    scale(0.6); opacity: 0; }
          15%  { opacity: 0.6; }
          50%  { transform: translateY(50vh)  translateX(20px) scale(1);   opacity: 0.8; }
          100% { transform: translateY(-10vh) translateX(-10px) scale(0.4); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.i}
          className="absolute rounded-full bg-[#caf26b] dark:bg-[#7cd06a]"
          style={{
            left: `${p.left}%`,
            bottom: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: '0 0 8px rgba(124,208,106,0.65)',
            animation: `pl-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
