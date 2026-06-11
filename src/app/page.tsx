'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import GarantiaOryon from '@/components/GarantiaOryon'
import { useRouter } from 'next/navigation'
import { SERVICOS } from '@/lib/constants'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const { t } = useI18n()
  const router = useRouter()

  const [videoError, setVideoError] = useState(false)
  const servicosDestaque = SERVICOS.slice(0, 6)

  // Se já está logado, vai direto pro dashboard
  useEffect(() => {
    // Fallback: se o Supabase redirecionou o OAuth para a home (redirect URL
    // fora da allowlist), encaminha o code para o callback completar o login
    const params = new URLSearchParams(window.location.search)
    if (params.get('code')) {
      window.location.replace(`/api/auth/callback?${params.toString()}`)
      return
    }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  const heroImages = [
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85&auto=format&fit=crop',
  ]
  const [heroIdx, setHeroIdx] = useState(0)

  useEffect(() => {
    if (!videoError) return
    const interval = setInterval(() => {
      setHeroIdx(i => (i + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [videoError])


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-700 text-white relative z-[60]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <AgroCoreLogo size={32} showSubtitle subtitleColor="text-green-300" />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-2.5 py-1.5 text-xs sm:text-sm text-white border border-white/60 rounded-lg hover:bg-green-600 transition whitespace-nowrap"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/cadastro"
              className="px-2.5 py-1.5 text-xs sm:text-sm bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition whitespace-nowrap"
            >
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero com vídeo */}
      <section className="relative text-white py-24 px-4 overflow-hidden min-h-[520px] flex items-center">
        {/* Vídeo de fundo — coloque hero.mp4 na pasta /public */}
        {!videoError && (
          <video
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        )}

        {/* Fallback: carrossel de imagens (quando vídeo não carrega) */}
        {videoError && heroImages.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 w-full h-full transition-opacity duration-1000"
            style={{ opacity: i === heroIdx ? 1 : 0 }}
          >
            <Image
              src={src}
              alt="AgroCore"
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative max-w-4xl mx-auto text-center w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto drop-shadow">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cadastro?tipo=PRODUTOR"
              className="px-8 py-4 bg-white text-green-700 font-bold text-lg rounded-xl shadow-lg hover:scale-105 hover:brightness-105 active:scale-95 transition-all duration-200"
            >
              {t('hero.ctaProdutor')}
            </Link>
            <Link
              href="/cadastro?tipo=PRESTADOR"
              className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg border border-green-400 hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              {t('hero.ctaPrestador')}
            </Link>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{t('howItWorks.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📋', titulo: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
              { icon: '🤝', titulo: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
              { icon: '✅', titulo: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
            ].map((item) => (
              <div key={item.titulo} className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.titulo}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">{t('nav.services')}</h2>
          <p className="text-center text-gray-500 mb-10">+18 {t('nav.services').toLowerCase()}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {servicosDestaque.map((s) => (
              <div
                key={s.value}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={s.imagem}
                    alt={s.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-800 text-sm leading-tight">{s.label}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">{s.descricao}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/servicos" className="text-green-700 font-semibold hover:underline">
              Ver todos os serviços →
            </Link>
          </div>
        </div>
      </section>

      {/* Cases de Sucesso */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-green-600 text-center mb-2">Cases reais</div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Quem já usa o AgroCore</h2>
          <p className="text-center text-gray-500 mb-10">Resultados reais de produtores e prestadores em todo o Brasil</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { inicial: 'J', nome: 'João Alves', estado: 'CE', resultado: 'Economizou R$ 12.000 em uma safra', depoimento: 'Encontrei um prestador verificado em menos de 2 horas. O contrato digital me deu segurança que nunca tive.' },
              { inicial: 'M', nome: 'Marcos Ferreira', estado: 'GO', resultado: 'Triplicou a carteira de clientes em 6 meses', depoimento: 'Passei de 2 para 8 clientes fixos. Hoje tenho previsibilidade de renda que nunca tive na vida.' },
              { inicial: 'A', nome: 'Ana Lima', estado: 'BA', resultado: 'Reduziu perda de colheita em 40%', depoimento: 'Filtrei por tipo de serviço e encontrei um especialista em café. O resultado foi extraordinário.' },
            ].map(c => (
              <div key={c.nome} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-black text-green-700">{c.inicial}</div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{c.nome}</div>
                    <div className="text-xs text-gray-400">📍 {c.estado}</div>
                  </div>
                </div>
                <div className="text-green-700 font-bold text-sm mb-2">{c.resultado}</div>
                <p className="text-gray-500 text-xs leading-relaxed italic">"{c.depoimento}"</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/cases" className="text-green-700 font-semibold text-sm hover:underline">
              Ver todos os cases →
            </Link>
          </div>
        </div>
      </section>

      {/* Garantia ORYON */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <GarantiaOryon variant="banner" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-green-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Comece agora, é gratuito</h2>
        <p className="mb-2 text-sm font-semibold tracking-widest uppercase opacity-70">Soluções Sustentáveis do Campo</p>
        <p className="text-green-200 text-lg mb-8">
          Cadastre-se em menos de 1 minuto e conecte-se com prestadores de serviço rurais em todo o Brasil.
        </p>
        <Link
          href="/cadastro"
          className="px-10 py-4 bg-white text-green-700 font-bold text-lg rounded-xl hover:bg-green-50 transition shadow-lg inline-block"
        >
          Criar conta gratuita
        </Link>
      </section>


      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-gray-400 text-center">
        <p>© 2025 AgroCore · {t('footer.rights')}</p>
        <div className="mt-3 flex justify-center gap-6 text-sm flex-wrap">
          <Link href="/cases" className="hover:text-white transition">Cases</Link>
          <Link href="/transparencia" className="hover:text-white transition">Preços</Link>
          <Link href="/ajuda" className="hover:text-white transition">{t('footer.help')}</Link>
          <Link href="/termos" className="hover:text-white transition">{t('footer.terms')}</Link>
          <Link href="/privacidade" className="hover:text-white transition">{t('footer.privacy')}</Link>
          <Link href="/denunciar" className="hover:text-white transition">{t('footer.report')}</Link>
        </div>
      </footer>
    </div>
  )
}
