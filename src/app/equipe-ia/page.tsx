'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import BottomNav from '@/components/BottomNav'

type AgentRun = { id: string; status: string; startedAt: string; finishedAt?: string; resultado?: string; erro?: string | null }
type Agent = { id: string; nome: string; role: string; tipo: string; ativo: boolean; trigger: string; tools: string[]; runs: AgentRun[]; createdAt: string }

const TEMPLATES = [
  {
    tipo: 'CACADOR_OPORTUNIDADES',
    nome: 'Caçador de Oportunidades',
    role: 'busca de serviços disponíveis e oportunidades de negócio no AgroCore',
    icon: '🔍',
    desc: 'Vasculha o marketplace e encontra serviços disponíveis compatíveis com suas especialidades e região.',
    tools: ['buscar_servicos_disponiveis', 'buscar_demanda_mercado', 'criar_notificacao'],
    color: 'bg-green-600',
    light: 'bg-green-100 text-green-800',
  },
  {
    tipo: 'ASSISTENTE_PROPOSTA',
    nome: 'Assistente de Proposta',
    role: 'elaboração de propostas competitivas e estratégia de precificação',
    icon: '✍️',
    desc: 'Analisa seu histórico de propostas, avaliações e mercado para sugerir o preço ideal e argumentos vencedores.',
    tools: ['buscar_historico_matches', 'buscar_avaliacoes_recebidas', 'buscar_demanda_mercado'],
    color: 'bg-blue-600',
    light: 'bg-blue-100 text-blue-800',
  },
  {
    tipo: 'MONITOR_CONTRATOS',
    nome: 'Monitor de Contratos',
    role: 'acompanhamento de serviços em andamento e gestão de contratos',
    icon: '📝',
    desc: 'Monitora seus contratos ativos, verifica prazos, identifica riscos e alerta sobre situações críticas.',
    tools: ['buscar_historico_matches', 'buscar_perfil_usuario', 'criar_notificacao'],
    color: 'bg-orange-600',
    light: 'bg-orange-100 text-orange-800',
  },
  {
    tipo: 'ANALISTA_REPUTACAO',
    nome: 'Analista de Reputação',
    role: 'análise de avaliações e melhoria da reputação no marketplace',
    icon: '⭐',
    desc: 'Analisa todas as suas avaliações, identifica padrões de satisfação e pontos de melhoria para crescer no ranking.',
    tools: ['buscar_avaliacoes_recebidas', 'buscar_perfil_usuario', 'criar_notificacao'],
    color: 'bg-yellow-600',
    light: 'bg-yellow-100 text-yellow-800',
  },
  {
    tipo: 'RADAR_MERCADO',
    nome: 'Radar de Mercado',
    role: 'análise de tendências e demanda regional por serviços agrícolas',
    icon: '📡',
    desc: 'Analisa tendências de demanda na sua região, identifica serviços em alta e oportunidades de especialização.',
    tools: ['buscar_demanda_mercado', 'buscar_servicos_disponiveis', 'buscar_perfil_usuario'],
    color: 'bg-purple-600',
    light: 'bg-purple-100 text-purple-800',
  },
  {
    tipo: 'NEGOCIADOR',
    nome: 'Negociador Inteligente',
    role: 'estratégia de negociação e fechamento de contratos no marketplace',
    icon: '🤝',
    desc: 'Analisa matches pendentes e histórico de aceites para sugerir a melhor estratégia de negociação e fechamento.',
    tools: ['buscar_historico_matches', 'buscar_avaliacoes_recebidas', 'buscar_demanda_mercado', 'criar_notificacao'],
    color: 'bg-teal-600',
    light: 'bg-teal-100 text-teal-800',
  },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETED') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Concluído</span>
  if (status === 'RUNNING')   return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 animate-pulse">Executando…</span>
  if (status === 'FAILED')    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Falhou</span>
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{status}</span>
}

function AgentCard({ agent, onRun, onDelete }: { agent: Agent; onRun: (a: Agent) => void; onDelete: (id: string) => void }) {
  const lastRun = agent.runs[0]
  const tmpl = TEMPLATES.find(t => t.tipo === agent.tipo)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-1.5 ${tmpl?.color ?? 'bg-gray-400'}`} />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">
            {tmpl?.icon ?? '🤖'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 text-sm truncate">{agent.nome}</div>
            <div className="text-xs text-gray-400 truncate">{agent.role}</div>
          </div>
          {agent.trigger === 'CRON' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 shrink-0">Auto</span>
          )}
        </div>

        {lastRun && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <StatusBadge status={lastRun.status} />
              <span className="text-[10px] text-gray-400">{new Date(lastRun.startedAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {lastRun.status === 'COMPLETED' && lastRun.resultado && (
              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{lastRun.resultado}</p>
            )}
            {lastRun.status === 'FAILED' && (
              <p className="text-xs text-red-500 line-clamp-2">{lastRun.erro ?? 'Erro desconhecido'}</p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => onRun(agent)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors active:scale-95">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
            </svg>
            Executar
          </button>
          <button onClick={() => onDelete(agent.id)}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultModal({ agent, onClose }: { agent: Agent | null; onClose: () => void }) {
  const [state, setState] = useState<'loading' | 'done' | 'error' | 'rate_limit'>('loading')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  const doRun = useCallback(async (a: Agent) => {
    setState('loading'); setResult(null); setError(null); setCountdown(0)
    try {
      const r = await fetch(`/api/agents/${a.id}/run`, { method: 'POST' })
      const d = await r.json()
      if (d.ok) { setState('done'); setResult(d.resultado) }
      else if (d.error === 'RATE_LIMIT') { setState('rate_limit'); setCountdown(d.retryAfter ?? 15) }
      else { setState('error'); setError(d.error ?? 'Erro') }
    } catch (e: any) { setState('error'); setError(e.message) }
  }, [])

  useEffect(() => { if (agent) doRun(agent) }, [agent, doRun])

  useEffect(() => {
    if (countdown <= 0) {
      if (state === 'rate_limit' && agent) doRun(agent)
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, state, agent, doRun])

  if (!agent) return null
  const tmpl = TEMPLATES.find(t => t.tipo === agent.tipo)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-green-700 text-white px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">{tmpl?.icon ?? '🤖'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold">{agent.nome}</div>
            <div className="text-xs text-green-200">
              {state === 'loading' ? 'Executando análise' : state === 'done' ? 'Concluído' : state === 'rate_limit' ? 'Alta demanda' : 'Erro'}
            </div>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5">
          {state === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"/>
              <p className="text-sm text-gray-500 text-center">Agente coletando dados e analisando…</p>
            </div>
          )}
          {state === 'rate_limit' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="text-4xl">⏳</div>
              <div className="text-center">
                <p className="font-bold text-gray-800 mb-1">Alta demanda dos agentes autônomos</p>
                <p className="text-sm text-gray-500">Aguarde a recuperação — retentando em</p>
                <p className="text-3xl font-black text-amber-500 mt-2">{countdown}s</p>
              </div>
            </div>
          )}
          {state === 'error' && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-600">{error}</p></div>}
          {state === 'done' && result && (
            <div className="bg-gray-50 rounded-xl p-4 max-h-72 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
        {(state === 'done' || state === 'error') && (
          <div className="px-5 pb-5">
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EquipeIAPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tab, setTab] = useState<'especialistas' | 'minha-equipe' | 'criar'>('especialistas')
  const [running, setRunning] = useState<Agent | null>(null)
  const [newAgent, setNewAgent] = useState({ nome: '', role: '', trigger: 'MANUAL' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const loadAgents = useCallback(async () => {
    try {
      const r = await fetch('/api/agents')
      if (r.ok) setAgents(await r.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAgents() }, [loadAgents])

  async function addFromTemplate(tmpl: typeof TEMPLATES[0]) {
    setAddError(null)
    const r = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: tmpl.nome, role: tmpl.role, tipo: tmpl.tipo, tools: tmpl.tools, trigger: 'MANUAL' }),
    })
    if (r.ok) {
      await loadAgents()
      setTab('minha-equipe')
    } else {
      const body = await r.json().catch(() => ({}))
      setAddError(body.error ?? `Erro ${r.status} ao adicionar agente`)
    }
  }

  async function addCustom() {
    if (!newAgent.nome.trim() || !newAgent.role.trim()) return
    setSaving(true)
    try {
      const r = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAgent, tipo: 'CUSTOMIZADO', tools: [] }),
      })
      if (r.ok) { await loadAgents(); setTab('minha-equipe'); setNewAgent({ nome: '', role: '', trigger: 'MANUAL' }) }
    } finally {
      setSaving(false)
    }
  }

  async function deleteAgent(id: string) {
    await fetch(`/api/agents/${id}`, { method: 'DELETE' })
    setAgents(a => a.filter(x => x.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-green-200 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </Link>
            <div>
              <AgroCoreLogo size={24} />
              <div className="text-green-200 text-xs">Equipe IA</div>
            </div>
          </div>
          <div className="text-xs text-green-200 bg-green-800/50 px-3 py-1 rounded-full">
            {agents.length} agente{agents.length !== 1 ? 's' : ''}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { key: 'especialistas', label: 'Especialistas' },
            { key: 'minha-equipe', label: 'Minha Equipe' },
            { key: 'criar', label: 'Criar' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === t.key ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-green-600'}`}>
              {t.label}
              {t.key === 'minha-equipe' && agents.length > 0 && (
                <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                  {agents.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Specialists Tab */}
        {tab === 'especialistas' && (
          <div className="space-y-3">
            {addError && (
              <div className="rounded-xl px-4 py-3 text-sm text-red-700 border border-red-200 bg-red-50">
                {addError}
              </div>
            )}
            <p className="text-xs text-gray-500">Agentes pré-configurados para o marketplace agrícola:</p>
            {TEMPLATES.map(tmpl => {
              const already = agents.find(a => a.tipo === tmpl.tipo)
              return (
                <div key={tmpl.tipo} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`h-1 ${tmpl.color}`}/>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0">
                      {tmpl.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-gray-800 text-sm">{tmpl.nome}</div>
                        {already && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Ativo</span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">{tmpl.desc}</p>
                      {!already && (
                        <button onClick={() => addFromTemplate(tmpl)}
                          className="text-xs font-bold px-4 py-1.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors active:scale-95">
                          Adicionar à equipe
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* My Team Tab */}
        {tab === 'minha-equipe' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"/>
              </div>
            ) : agents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">🤖</div>
                <p className="font-bold text-gray-700 mb-1">Nenhum agente na equipe</p>
                <p className="text-xs text-gray-400 mb-4">Adicione especialistas pré-configurados ou crie um personalizado.</p>
                <button onClick={() => setTab('especialistas')} className="text-sm font-bold text-green-600 hover:underline">
                  Ver especialistas →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {agents.map(a => (
                  <AgentCard key={a.id} agent={a} onRun={setRunning} onDelete={deleteAgent} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {tab === 'criar' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <div className="font-bold text-gray-800 mb-0.5">Agente personalizado</div>
              <div className="text-xs text-gray-400">Crie um agente com especialidade específica para seu negócio</div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome do agente</label>
                <input value={newAgent.nome} onChange={e => setNewAgent(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Monitor de Oportunidades PRONAF"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Especialidade</label>
                <input value={newAgent.role} onChange={e => setNewAgent(p => ({ ...p, role: e.target.value }))}
                  placeholder="Ex: busca de serviços de pulverização urgentes na região"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Frequência</label>
                <select value={newAgent.trigger} onChange={e => setNewAgent(p => ({ ...p, trigger: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400">
                  <option value="MANUAL">Execução manual</option>
                  <option value="CRON">Automático (diário às 8h)</option>
                </select>
              </div>
            </div>
            <button onClick={addCustom} disabled={saving || !newAgent.nome.trim() || !newAgent.role.trim()}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
              {saving ? 'Criando…' : 'Criar agente'}
            </button>
          </div>
        )}
      </div>

      <BottomNav tipo="PRODUTOR" />
      <div className="h-16"/>

      <ResultModal agent={running} onClose={async () => { setRunning(null); await loadAgents() }} />
    </div>
  )
}
