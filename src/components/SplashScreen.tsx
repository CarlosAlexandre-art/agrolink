'use client'

import { useEffect, useRef, useState } from 'react'

const CSS = `
#agc-splash{
  position:fixed;inset:0;z-index:99999;
  background:#000;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
#agc-splash.sp-exit{animation:agcOut .9s ease-in-out forwards}
#agc-splash.sp-gone{display:none!important}
@keyframes agcOut{to{opacity:0}}

#agc-stars{position:absolute;inset:0;pointer-events:none}

.agc-beam{
  position:absolute;inset-block:0;pointer-events:none;
}
.agc-beam-a{
  width:45%;left:-45%;
  background:linear-gradient(90deg,transparent 0%,rgba(103,157,63,.08) 25%,rgba(141,198,63,.28) 50%,rgba(103,157,63,.08) 75%,transparent 100%);
}
.agc-beam-a.run{animation:agcBeamA 1.2s cubic-bezier(.4,0,.3,1) forwards}
.agc-beam-b{
  width:22%;left:-22%;
  background:linear-gradient(90deg,transparent,rgba(141,198,63,.12) 50%,transparent);
}
.agc-beam-b.run{animation:agcBeamB 1.0s cubic-bezier(.4,0,.3,1) forwards}
@keyframes agcBeamA{to{left:160%}}
@keyframes agcBeamB{to{left:160%}}

#agc-logo{
  width:clamp(110px,16vw,150px);height:clamp(110px,16vw,150px);
  opacity:0;
  filter:drop-shadow(0 0 28px rgba(103,157,63,.9)) drop-shadow(0 0 60px rgba(103,157,63,.35));
}
#agc-logo.in{animation:agcLogoIn .95s cubic-bezier(.2,0,.1,1) forwards}
@keyframes agcLogoIn{
  0%  {opacity:0;transform:scale(.65);filter:drop-shadow(0 0 0 transparent)}
  55% {opacity:1;transform:scale(1.06)}
  100%{opacity:1;transform:scale(1);filter:drop-shadow(0 0 28px rgba(103,157,63,.9)) drop-shadow(0 0 60px rgba(103,157,63,.35))}
}

/* SVG parts drawn in */
.agc-circle{stroke-dasharray:132;stroke-dashoffset:132;transition:stroke-dashoffset .8s ease-out}
.agc-circle.in{stroke-dashoffset:0}
.agc-leaf{clip-path:inset(100% 0 0 0);transition:clip-path .6s ease-out}
.agc-leaf.in{clip-path:inset(0% 0 0 0)}
.agc-bar{transform:scaleY(0);transform-origin:bottom;transition:transform .4s ease-out}
.agc-bar.in{transform:scaleY(1)}
.agc-arrow{opacity:0;transition:opacity .3s ease-out}
.agc-arrow.in{opacity:1}

#agc-word{
  font-family:'Montserrat',sans-serif;
  font-size:clamp(2.8rem,7vw,4.5rem);font-weight:900;line-height:1;
  background:linear-gradient(140deg,#f0fdf4 0%,#8dc63f 55%,#679d3f 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-top:clamp(16px,3vw,26px);
  opacity:0;
}
#agc-word.in{animation:agcWordIn .75s ease-out forwards}
@keyframes agcWordIn{
  from{opacity:0;transform:translateY(14px)}
  to  {opacity:1;transform:translateY(0)}
}

#agc-tag{
  font-family:'Montserrat',sans-serif;
  font-size:clamp(.6rem,.85vw,.72rem);letter-spacing:.18em;text-transform:uppercase;
  color:rgba(141,198,63,.6);margin-top:11px;text-align:center;
  opacity:0;
}
#agc-tag.in{animation:agcFadeUp .6s ease-out forwards}

#agc-sub{
  font-family:'Montserrat',sans-serif;
  font-size:clamp(.55rem,.72vw,.65rem);letter-spacing:.1em;text-transform:uppercase;
  color:rgba(103,157,63,.5);margin-top:18px;
  display:flex;flex-wrap:wrap;gap:clamp(10px,2.5vw,20px);justify-content:center;
  opacity:0;
}
#agc-sub.in{animation:agcFadeUp .55s ease-out forwards}
@keyframes agcFadeUp{
  from{opacity:0;transform:translateY(6px)}
  to  {opacity:1;transform:translateY(0)}
}
.agc-dot{display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(103,157,63,.4);margin-right:5px;vertical-align:middle}
`

function cls(id: string, c: string) {
  document.getElementById(id)?.classList.add(c)
}
function clsQ(q: string, c: string) {
  document.querySelectorAll(q).forEach(el => el.classList.add(c))
}

export default function SplashScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    /* ── stars ── */
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      dl: Math.random() * 1.8, a: 0,
      hue: Math.random() > 0.6 ? '103,157,63' : '141,198,63',
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
          ctx.fillStyle = `rgba(${s.hue},${s.a * (0.18 + p * 0.38)})`
          ctx.fill()
        }
      })
      if (e < 6) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    /* ── sequence ── */
    const timers = [
      setTimeout(() => cls('agc-logo', 'in'), 600),
      setTimeout(() => { clsQ('.agc-circle', 'in'); clsQ('.agc-leaf', 'in') }, 700),
      setTimeout(() => clsQ('.agc-bar', 'in'), 900),
      setTimeout(() => clsQ('.agc-arrow', 'in'), 1050),
      setTimeout(() => { cls('agc-beam-a', 'run') }, 1500),
      setTimeout(() => { cls('agc-beam-b', 'run') }, 1850),
      setTimeout(() => cls('agc-word', 'in'), 1750),
      setTimeout(() => cls('agc-tag', 'in'), 2500),
      setTimeout(() => cls('agc-sub', 'in'), 3050),
      /* exit */
      setTimeout(() => {
        cls('agc-splash', 'sp-exit')
        setTimeout(() => setGone(true), 950)
      }, 4200),
    ]

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [])

  if (gone) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div id="agc-splash">
        <canvas id="agc-stars" ref={canvasRef} />
        <div className="agc-beam agc-beam-a" id="agc-beam-a" />
        <div className="agc-beam agc-beam-b" id="agc-beam-b" />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Logo */}
          <svg id="agc-logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="agcg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#104e27" />
                <stop offset="100%" stopColor="#679d3f" />
              </linearGradient>
              <linearGradient id="agcg2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#679d3f" />
                <stop offset="100%" stopColor="#8dc63f" />
              </linearGradient>
            </defs>
            <circle className="agc-circle" cx="24" cy="24" r="21" stroke="url(#agcg1)" strokeWidth="2.5" fill="none" />
            <path className="agc-leaf" d="M10 32 C10 16 18 8 24 8 C21 14 17 21 17 28 C17 32 14 36 10 36 Z" fill="url(#agcg1)" />
            <rect className="agc-bar" x="24" y="27" width="4" height="9" rx="1.5" fill="url(#agcg1)" />
            <rect className="agc-bar" x="30" y="22" width="4" height="14" rx="1.5" fill="url(#agcg1)" style={{ transitionDelay: '.1s' }} />
            <rect className="agc-bar" x="36" y="16" width="4" height="20" rx="1.5" fill="url(#agcg2)" style={{ transitionDelay: '.2s' }} />
            <path className="agc-arrow" d="M38 14 L38 10 M36 12 L38 9 L40 12" stroke="#679d3f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
