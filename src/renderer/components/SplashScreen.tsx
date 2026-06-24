import { useEffect, useState } from 'react'
import { useUIStore } from '../store/uiStore'
import logoUrl from '../../../img/tiktok.jpeg'

export function SplashScreen({ forceVisible }: { forceVisible?: boolean } = {}) {
  const { splashVisible } = useUIStore()
  const visible = forceVisible || splashVisible
  const [phase, setPhase] = useState<'logo' | 'name' | 'done'>('logo')

  useEffect(() => {
    if (!visible) {
      setPhase('logo')
      return
    }
    const t1 = setTimeout(() => setPhase('name'), 400)
    return () => clearTimeout(t1)
  }, [splashVisible])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: '#010101',
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,255,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative blurred circles — TikTok red & cyan accents */}
      <div style={{
        position: 'absolute', width: 240, height: 240,
        borderRadius: '50%', top: '-60px', right: '-60px',
        background: 'rgba(254,44,85,0.35)', filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 200, height: 200,
        borderRadius: '50%', bottom: '-40px', left: '-40px',
        background: 'rgba(37,244,238,0.30)', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div
        style={{
          transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease',
          transform: phase === 'logo' ? 'scale(0.6)' : 'scale(1)',
          opacity: phase === 'logo' ? 0 : 1,
          marginBottom: '28px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Drop shadow ring */}
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            filter: 'blur(10px)',
          }}
        />
        <img
          src={logoUrl}
          alt="Apps for TikTok"
          style={{
            width: 96,
            height: 96,
            borderRadius: '22px',
            objectFit: 'cover',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            position: 'relative',
          }}
        />
      </div>

      {/* App name — slides up + fades in after logo appears */}
      <div
        style={{
          transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease',
          transform: phase === 'name' || phase === 'done' ? 'translateY(0)' : 'translateY(18px)',
          opacity: phase === 'name' || phase === 'done' ? 1 : 0,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
            marginBottom: '6px',
            fontFamily: 'Inter, sans-serif',
            textShadow: '0 1px 8px rgba(0,0,0,0.25)',
          }}
        >
          Apps for TikTok
        </h1>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.75)',
            letterSpacing: '0.2px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Multi-account TikTok workspace
        </p>
      </div>

      {/* Loading bar */}
      <div
        style={{
          marginTop: '40px',
          width: '160px',
          height: '3px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '99px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          transition: 'opacity 0.5s ease',
          opacity: phase === 'name' || phase === 'done' ? 1 : 0,
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '99px',
            animation: 'splashProgress 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes splashProgress {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 70%;  margin-left: 15%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}
