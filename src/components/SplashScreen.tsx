'use client'

import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────
   3 variantes visuais — sorteadas por sessão
   A: Verde escuro  — glow esmeralda clássico
   B: Amanhecer     — gradiente âmbar/dourado
   C: Noite rural   — deep navy + azul prata
───────────────────────────────────────────── */
const VARIANTS = [
  {
    id: 'a',
    bg: '#000',
    beamColor: 'rgba(141,198,63,.28)',
    beamEcho: 'rgba(141,198,63,.12)',
    starHue: ['103,157,63', '141,198,63'],
    glowColor: 'rgba(103,157,63,.9)',
    glowFar: 'rgba(103,157,63,.35)',
    wordGrad: 'linear-gradient(140deg,#f0fdf4 0%,#8dc63f 55%,#679d3f 100%)',
    tagColor: 'rgba(141,198,63,.60)',
    subColor: 'rgba(103,157,63,.50)',
    dotColor: 'rgba(103,157,63,.38)',
    strokeG: ['#104e27','#679d3f','#679d3f','#8dc63f'],
  },
  {
    id: 'b',
    bg: '#04080a',
    beamColor: 'rgba(251,191,36,.22)',
    beamEcho: 'rgba(251,191,36,.08)',
    starHue: ['180,130,40', '251,191,36'],
    glowColor: 'rgba(180,130,40,.85)',
    glowFar: 'rgba(251,191,36,.3)',
    wordGrad: 'linear-gradient(140deg,#fefce8 0%,#fde68a 50%,#8dc63f 100%)',
    tagColor: 'rgba(251,191,36,.55)',
    subColor: 'rgba(180,130,40,.50)',
    dotColor: 'rgba(180,130,40,.38)',
    strokeG: ['#78350f','#d97706','#d97706','#8dc63f'],
  },
  {
    id: 'c',
    bg: '#03050c',
    beamColor: 'rgba(148,163,184,.20)',
    beamEcho: 'rgba(148,163,184,.08)',
    starHue: ['100,130,160', '148,163,184'],
    glowColor: 'rgba(100,130,160,.85)',
    glowFar: 'rgba(148,163,184,.30)',
    wordGrad: 'linear-gradient(140deg,#f8fafc 0%,#93c5fd 50%,#22c55e 100%)',
    tagColor: 'rgba(148,163,184,.55)',
    subColor: 'rgba(100,130,160,.50)',
    dotColor: 'rgba(100,130,160,.38)',
    strokeG: ['#1e3a5f','#4a7fa5','#4a7fa5','#8dc63f'],
  },
]

function buildCSS(v: typeof VARIANTS[0]) {
  return `
#agc-splash{
  position:fixed;inset:0;z-index:99999;
  background:${v.bg};
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
  /* safe area para notch/home-bar */
  padding-top:env(safe-area-inset-top);
  padding-bottom:env(safe-area-inset-bottom);
}
#agc-splash.sp-exit{animation:agcOut .9s ease-in-out forwards}
#agc-splash.sp-gone{display:none!important}
@keyframes agcOut{to{opacity:0}}

#agc-stars{position:absolute;inset:0;pointer-events:none}

.agc-beam{position:absolute;inset-block:0;pointer-events:none}
#agc-beam-a{
  width:45%;left:-45%;
  background:linear-gradient(90deg,transparent 0%,${v.beamColor.replace('.28',',.06')} 20%,${v.beamColor} 50%,${v.beamColor.replace('.28',',.06')} 80%,transparent 100%);
}
#agc-beam-a.run{animation:agcBeamA 1.2s cubic-bezier(.4,0,.3,1) forwards}
#agc-beam-b{
  width:22%;left:-22%;
  background:linear-gradient(90deg,transparent,${v.beamEcho} 50%,transparent);
}
#agc-beam-b.run{animation:agcBeamB 1.0s cubic-bezier(.4,0,.3,1) forwards}
@keyframes agcBeamA{to{left:160%}}
@keyframes agcBeamB{to{left:160%}}

#agc-logo{
  width:clamp(100px,20vmin,148px);
  height:clamp(100px,20vmin,148px);
  opacity:0;
  filter:drop-shadow(0 0 28px ${v.glowColor}) drop-shadow(0 0 60px ${v.glowFar});
}
#agc-logo.in{animation:agcLogoIn .95s cubic-bezier(.2,0,.1,1) forwards}
@keyframes agcLogoIn{
  0%  {opacity:0;transform:scale(.65)}
  55% {opacity:1;transform:scale(1.06)}
  100%{opacity:1;transform:scale(1);filter:drop-shadow(0 0 28px ${v.glowColor}) drop-shadow(0 0 60px ${v.glowFar})}
}

.agc-circle{stroke-dasharray:132;stroke-dashoffset:132;transition:stroke-dashoffset .85s ease-out}
.agc-circle.in{stroke-dashoffset:0}
.agc-leaf{clip-path:inset(100% 0 0 0);transition:clip-path .65s ease-out}
.agc-leaf.in{clip-path:inset(0% 0 0 0)}
.agc-bar{transform:scaleY(0);transform-origin:bottom;transition:transform .4s ease-out}
.agc-bar.in{transform:scaleY(1)}
.agc-arrow{opacity:0;transition:opacity .35s ease-out}
.agc-arrow.in{opacity:1}

#agc-word{
  font-family:'Montserrat',system-ui,sans-serif;
  font-size:clamp(2.4rem,9vmin,4.4rem);font-weight:900;line-height:1;
  background:${v.wordGrad};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-top:clamp(14px,4vmin,26px);
  opacity:0;letter-spacing:-.01em;
}
#agc-word.in{animation:agcWordIn .75s ease-out forwards}
@keyframes agcWordIn{
  from{opacity:0;transform:translateY(14px)}
  to  {opacity:1;transform:translateY(0)}
}

#agc-tag{
  font-family:'Montserrat',system-ui,sans-serif;
  font-size:clamp(.55rem,2vmin,.72rem);letter-spacing:.18em;text-transform:uppercase;
  color:${v.tagColor};margin-top:10px;text-align:center;padding:0 20px;
  opacity:0;
}
#agc-tag.in{animation:agcFadeUp .6s ease-out forwards}

#agc-sub{
  font-family:'Montserrat',system-ui,sans-serif;
  font-size:clamp(.5rem,1.6vmin,.62rem);letter-spacing:.1em;text-transform:uppercase;
  color:${v.subColor};margin-top:clamp(14px,4vmin,22px);
  display:flex;flex-wrap:wrap;gap:clamp(8px,3vmin,18px);justify-content:center;
  padding:0 16px;opacity:0;
}
#agc-sub.in{animation:agcFadeUp .55s ease-out forwards}
@keyframes agcFadeUp{
  from{opacity:0;transform:translateY(6px)}
  to  {opacity:1;transform:translateY(0)}
}
.agc-dot{
  display:inline-block;width:3px;height:3px;border-radius:50%;
  background:${v.dotColor};margin-right:5px;vertical-align:middle;
}
`
}

function addCls(id: string, c: string) {
  document.getElementById(id)?.classList.add(c)
}
function addClsAll(q: string, c: string) {
  document.querySelectorAll(q).forEach(el => el.classList.add(c))
}

export default function SplashScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [variant] = useState(() => {
    try {
      const last = localStorage.getItem('agc_splash_last') ?? ''
      const pool = VARIANTS.filter(v => v.id !== last)
      const pick = pool[Math.floor(Math.random() * pool.length)]
      localStorage.setItem('agc_splash_last', pick.id)
      return pick
    } catch {
      return VARIANTS[0]
    }
  })

  // Mostrar splash apenas uma vez por sessão de login
  const [gone, setGone] = useState(() => {
    try {
      return localStorage.getItem('agc_splash_shown') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    // Marca como visto imediatamente para que recarregamentos durante a animação não bloqueiem
    try { localStorage.setItem('agc_splash_shown', '1') } catch {}

    /* ── star field ── */
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      dl: Math.random() * 1.8, a: 0,
      hue: variant.starHue[Math.random() > 0.55 ? 0 : 1],
    }))

    let t0: number | null = null
    function draw(ts: number) {
      if (!t0) t0 = ts
      const e = (ts - t0) / 1000
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      stars.forEach(s => {
        if (e > s.dl) {
          s.a = Math.min(1, (e - s.dl) * 2.2)
          const p = (Math.sin((e - s.dl) * 2.4 + s.x * 10) + 1) / 2
          ctx.beginPath()
          ctx.arc(s.x * canvas!.width, s.y * canvas!.height, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${s.hue},${s.a * (0.15 + p * 0.35)})`
          ctx.fill()
        }
      })
      if (e < 6) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    /* ── sequence ── */
    const T = [
      setTimeout(() => addCls('agc-logo', 'in'), 600),
      setTimeout(() => { addClsAll('.agc-circle', 'in'); addClsAll('.agc-leaf', 'in') }, 700),
      setTimeout(() => addClsAll('.agc-bar', 'in'), 900),
      setTimeout(() => addClsAll('.agc-arrow', 'in'), 1060),
      setTimeout(() => addCls('agc-beam-a', 'run'), 1500),
      setTimeout(() => addCls('agc-beam-b', 'run'), 1860),
      setTimeout(() => addCls('agc-word', 'in'), 1760),
      setTimeout(() => addCls('agc-tag', 'in'), 2500),
      setTimeout(() => addCls('agc-sub', 'in'), 3060),
      setTimeout(() => {
        addCls('agc-splash', 'sp-exit')
        setTimeout(() => {
          try {
            localStorage.setItem('agc_splash_shown', '1')
            document.getElementById('agc-hide')?.remove()
            document.documentElement.style.background = ''
          } catch {}
          setGone(true)
        }, 950)
      }, 4200),
    ]

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      T.forEach(clearTimeout)
      // Remove o bloqueio de visibilidade mesmo se a animação foi interrompida
      try {
        document.getElementById('agc-hide')?.remove()
        document.documentElement.style.background = ''
      } catch {}
    }
  }, [variant])

  if (gone) return null

  const [c0, c1, c2, c3] = variant.strokeG

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: buildCSS(variant) }} />
      <div id="agc-splash">
        <canvas id="agc-stars" ref={canvasRef} />
        <div id="agc-beam-a" className="agc-beam" />
        <div id="agc-beam-b" className="agc-beam" />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Logo SVG */}
          <svg id="agc-logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`agcg1-${variant.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c0} />
                <stop offset="100%" stopColor={c1} />
              </linearGradient>
              <linearGradient id={`agcg2-${variant.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={c2} />
                <stop offset="100%" stopColor={c3} />
              </linearGradient>
            </defs>
            <circle className="agc-circle" cx="24" cy="24" r="21"
              stroke={`url(#agcg1-${variant.id})`} strokeWidth="2.5" fill="none" />
            <path className="agc-leaf"
              d="M10 32 C10 16 18 8 24 8 C21 14 17 21 17 28 C17 32 14 36 10 36 Z"
              fill={`url(#agcg1-${variant.id})`} />
            <rect className="agc-bar" x="24" y="27" width="4" height="9" rx="1.5"
              fill={`url(#agcg1-${variant.id})`} />
            <rect className="agc-bar" x="30" y="22" width="4" height="14" rx="1.5"
              fill={`url(#agcg1-${variant.id})`} style={{ transitionDelay: '.1s' }} />
            <rect className="agc-bar" x="36" y="16" width="4" height="20" rx="1.5"
              fill={`url(#agcg2-${variant.id})`} style={{ transitionDelay: '.2s' }} />
            <path className="agc-arrow"
              d="M38 14 L38 10 M36 12 L38 9 L40 12"
              stroke={c2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div id="agc-word">AgroCore</div>
          <div id="agc-tag">Soluções Sustentáveis do Campo</div>

          <div id="agc-sub">
            <span><span className="agc-dot" />Marketplace Rural</span>
            <span><span className="agc-dot" />Escrow Seguro</span>
            <span><span className="agc-dot" />IA Agrícola</span>
            <span><span className="agc-dot" />Score AgroRate</span>
          </div>
        </div>
      </div>
    </>
  )
}
