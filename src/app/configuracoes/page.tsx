'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

const TEMAS = [
  { value: 'auto',   icon: '🌗', label: 'Automático', desc: 'Segue o sistema' },
  { value: 'claro',  icon: '☀️', label: 'Claro',      desc: 'Fundo branco' },
  { value: 'escuro', icon: '🌙', label: 'Escuro',     desc: 'Fundo escuro' },
]

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{titulo}</h2>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-700">{children}</div>
    </div>
  )
}

function Item({ icon, label, desc, children }: { icon: string; label: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</div>
          {desc && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}

export default function ConfiguracoesPage() {
  const { tema, setTema } = useTheme()
  const [agrobotAtivo, setAgrobotAtivo] = useState(true)
  const [modoSimples, setModoSimples] = useState(false)
  const [notificacoesPush, setNotificacoesPush] = useState(false)

  useEffect(() => {
    setAgrobotAtivo(localStorage.getItem('agrobot_visivel') !== 'false')
    setModoSimples(localStorage.getItem('agrocore_modo_simples') === '1')
    setNotificacoesPush(Notification?.permission === 'granted')
  }, [])

  function toggleAgrobot() {
    const novo = !agrobotAtivo
    setAgrobotAtivo(novo)
    localStorage.setItem('agrobot_visivel', novo ? 'true' : 'false')
    window.dispatchEvent(new Event('storage'))
  }

  function toggleModoSimples() {
    const novo = !modoSimples
    setModoSimples(novo)
    localStorage.setItem('agrocore_modo_simples', novo ? '1' : '0')
  }

  async function solicitarNotificacoes() {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotificacoesPush(perm === 'granted')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-10">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/perfil" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">⚙️ Configurações</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Aparência */}
        <Secao titulo="🎨 Aparência">
          <div className="px-5 py-4">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Tema do aplicativo</div>
            <div className="grid grid-cols-3 gap-3">
              {TEMAS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTema(t.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition ${
                    tema === t.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{t.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </Secao>

        {/* Interface */}
        <Secao titulo="📱 Interface">
          <Item icon="⚡" label="Modo Simples" desc="Exibe apenas 3 botões principais no dashboard">
            <button
              onClick={toggleModoSimples}
              className={`relative w-12 h-6 rounded-full transition-colors ${modoSimples ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${modoSimples ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </Item>
        </Secao>

        {/* Assistente IA */}
        <Secao titulo="🤖 Assistente IA">
          <Item
            icon="🌿"
            label="AgroBot"
            desc={agrobotAtivo ? 'Assistente virtual ativo' : 'AgroBot desativado'}
          >
            <button
              onClick={toggleAgrobot}
              className={`relative w-12 h-6 rounded-full transition-colors ${agrobotAtivo ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${agrobotAtivo ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </Item>
        </Secao>

        {/* Notificações */}
        <Secao titulo="🔔 Notificações">
          <Item
            icon="🔔"
            label="Notificações push"
            desc={notificacoesPush ? 'Ativadas — você recebe alertas de chamados e serviços' : 'Desativadas'}
          >
            {notificacoesPush ? (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Ativo</span>
            ) : (
              <button
                onClick={solicitarNotificacoes}
                className="text-xs bg-green-700 text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-green-800 transition"
              >
                Ativar
              </button>
            )}
          </Item>
        </Secao>

        {/* Localização */}
        <Secao titulo="📍 Localização">
          <Item icon="📍" label="Permissão de GPS" desc="Necessária para receber chamados próximos e calcular rotas">
            <span className="text-xs text-gray-400">→</span>
          </Item>
          <div className="px-5 pb-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 space-y-2">
              <p className="font-semibold">Como liberar a localização:</p>
              <p>📱 <strong>Android:</strong> Configurações → Apps → AgroCore → Permissões → Localização → Permitir</p>
              <p>🌐 <strong>Navegador:</strong> Clique no cadeado na barra de endereço → Localização → Permitir</p>
              <p>🍎 <strong>iPhone:</strong> Ajustes → Privacidade → Localização → AgroCore → Ao usar</p>
            </div>
          </div>
        </Secao>

        {/* Dados */}
        <Secao titulo="📤 Dados e privacidade">
          <Item icon="📊" label="Exportar meus dados" desc="Baixe seu histórico completo em CSV ou PDF">
            <Link href="/perfil" className="text-xs text-green-700 font-semibold hover:underline">
              Ver no perfil →
            </Link>
          </Item>
          <Item icon="🔒" label="Política de privacidade" desc="Como seus dados são usados">
            <Link href="/privacidade" className="text-xs text-green-700 font-semibold hover:underline">
              Ver →
            </Link>
          </Item>
          <Item icon="💳" label="Plano e assinatura" desc="Gerencie ou cancele sua assinatura">
            <Link href="/planos" className="text-xs text-green-700 font-semibold hover:underline">
              Ver →
            </Link>
          </Item>
        </Secao>

        {/* Suporte */}
        <Secao titulo="💬 Suporte">
          <Item icon="💬" label="WhatsApp" desc="Atendimento em até 48h">
            <a
              href="https://wa.me/5585986027333?text=Olá, preciso de ajuda com o AgroCore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-green-700 text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-green-800 transition"
            >
              Abrir
            </a>
          </Item>
          <Item icon="📧" label="E-mail" desc="suporte@oryonag.com.br">
            <a
              href="mailto:suporte@oryonag.com.br"
              className="text-xs text-green-700 font-semibold hover:underline"
            >
              Enviar →
            </a>
          </Item>
          <Item icon="📄" label="Transparência de preços" desc="Taxas, comissões e o que é gratuito">
            <Link href="/transparencia" className="text-xs text-green-700 font-semibold hover:underline">
              Ver →
            </Link>
          </Item>
        </Secao>

        <div className="text-center text-xs text-gray-400 pt-2">
          AgroCore v1.0 · <Link href="/termos" className="hover:text-green-700">Termos</Link> · <Link href="/privacidade" className="hover:text-green-700">Privacidade</Link>
        </div>
      </div>
    </div>
  )
}
