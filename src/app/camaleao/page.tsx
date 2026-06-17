'use client'

import {
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

type ProfileKey = 'tdah' | 'autismo' | 'down' | 'familia'

type Profile = {
  key: ProfileKey
  label: string
  tone: string
  language: string
  interface: string
  focus: string
}

const profiles: Profile[] = [
  {
    key: 'tdah',
    label: 'Começar tarefas',
    tone: 'Objetivo',
    language: 'Frases curtas, próximos passos e recompensas rápidas.',
    interface: 'Poucas escolhas por vez, timers visíveis e botões de ação direta.',
    focus: 'Microtarefas, desbloqueio e ritmo.',
  },
  {
    key: 'autismo',
    label: 'Previsibilidade',
    tone: 'Calmo',
    language: 'Detalhes claros, rotina visual e mudanças avisadas antes.',
    interface: 'Layout limpo, ordem fixa, baixa surpresa e controle sensorial.',
    focus: 'Rotina, segurança e contexto.',
  },
  {
    key: 'down',
    label: 'Visual simples',
    tone: 'Afetivo',
    language: 'Texto simples, apoio visual e confirmação positiva.',
    interface: 'Blocos grandes, leitura fácil e uma decisão por tela.',
    focus: 'Autonomia guiada e repetição saudável.',
  },
  {
    key: 'familia',
    label: 'Acompanhar alguém',
    tone: 'Cuidadoso',
    language: 'Resumo prático, sinais de atenção e próximos combinados.',
    interface: 'Painel de evolução, registros rápidos e relatórios compartilháveis.',
    focus: 'Família, terapeuta e escola.',
  },
]

const routineItems = [
  { time: '08:00', title: 'Checar energia do dia', tag: '2 min' },
  { time: '08:10', title: 'Escolher uma tarefa principal', tag: 'foco' },
  { time: '10:30', title: 'Pausa sensorial', tag: 'regular' },
  { time: '16:00', title: 'Registrar vitória pequena', tag: 'mochila' },
]

const sensoryItems = ['Luz baixa', 'Avisar mudanças', 'Pausa sem perguntas', 'Fone permitido']

const modules = [
  { icon: Timer, title: 'Rotina', text: 'Agenda visual, timers e microtarefas ativas.' },
  { icon: MessageCircle, title: 'Comunicação', text: 'Pranchas, frases prontas e apoio AAC quando necessário.' },
  { icon: Users, title: 'Social', text: 'Conexões seguras, grupos pequenos e mediação de contexto.' },
  { icon: GraduationCap, title: 'Desenvolvimento', text: 'Jogos, habilidades práticas e educação aplicável.' },
  { icon: HeartPulse, title: 'Família e terapia', text: 'Relatórios, sinais de crise e acompanhamento longitudinal.' },
]

function buildSteps(task: string, profile: ProfileKey) {
  const cleanTask = task.trim() || 'Organizar meu dia'
  const base = [
    `Definir o resultado de "${cleanTask}"`,
    'Separar o primeiro passo pequeno',
    'Rodar por 10 minutos',
    'Marcar o que avançou',
  ]

  if (profile === 'tdah') return ['Abrir só a primeira parte', 'Colocar timer de 10 minutos', ...base.slice(2)]
  if (profile === 'autismo') return ['Confirmar o contexto', 'Ver a sequência completa', ...base.slice(1)]
  if (profile === 'down') return ['Ver o exemplo visual', 'Fazer junto uma vez', 'Repetir sozinho com apoio', 'Comemorar conclusão']
  return ['Registrar objetivo', 'Combinar apoio necessário', 'Acompanhar execução', 'Salvar observação para relatório']
}

export default function CamaleaoPage() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileKey>('tdah')
  const [task, setTask] = useState('Ligar para a escola e resolver pendência')
  const [completed, setCompleted] = useState<string[]>([])

  const profile = profiles.find((item) => item.key === selectedProfile) ?? profiles[0]
  const steps = useMemo(() => buildSteps(task, selectedProfile), [task, selectedProfile])
  const completion = Math.round((completed.length / steps.length) * 100)

  function toggleStep(step: string) {
    setCompleted((current) =>
      current.includes(step) ? current.filter((item) => item !== step) : [...current, step],
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-800 text-white">
              <Brain size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Modo Camaleão</p>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">Sistema adaptativo de vida funcional</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profiles.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setSelectedProfile(item.key)
                  setCompleted([])
                }}
                className={`min-h-11 rounded-lg border px-4 text-sm font-bold transition ${
                  selectedProfile === item.key
                    ? 'border-emerald-800 bg-emerald-800 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef3ea]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-[460px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-emerald-800">
                <Sparkles size={18} aria-hidden="true" />
                <span>O que você precisa hoje?</span>
              </div>
              <h2 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
                Um núcleo que mostra só o próximo passo certo.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                O app começa simples, observa comportamento real e libera módulos quando eles fazem sentido para a
                pessoa, família, escola ou terapeuta.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-[#fafbf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Linguagem</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{profile.tone}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#fafbf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Foco ativo</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{profile.focus}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#fafbf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Progresso</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{completion}% da tarefa</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Engine ativa</p>
                  <h2 className="mt-2 text-xl font-bold">Perfil: {profile.label}</h2>
                </div>
                <ShieldCheck className="text-emerald-200" size={28} aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-200">{profile.language}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{profile.interface}</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <ClipboardList size={18} aria-hidden="true" />
                <span>Micro-agente</span>
              </div>
              <label htmlFor="task" className="sr-only">
                Tarefa
              </label>
              <input
                id="task"
                value={task}
                onChange={(event) => {
                  setTask(event.target.value)
                  setCompleted([])
                }}
                className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
                placeholder="Digite uma tarefa que está travando"
              />
              <div className="mt-4 grid gap-2">
                {steps.map((step) => {
                  const done = completed.includes(step)
                  return (
                    <button
                      key={step}
                      onClick={() => toggleStep(step)}
                      className={`flex min-h-12 items-center justify-between gap-3 rounded-lg border px-4 text-left text-sm font-semibold transition ${
                        done
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <span>{step}</span>
                      {done ? <Check size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays size={20} className="text-emerald-800" aria-hidden="true" />
            <h2 className="text-xl font-bold">Rotina de hoje</h2>
          </div>
          <div className="grid gap-3">
            {routineItems.map((item) => (
              <div key={item.time} className="grid min-h-16 grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 px-4">
                <span className="text-sm font-bold text-emerald-800">{item.time}</span>
                <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <UserRound size={20} className="text-emerald-800" aria-hidden="true" />
              <h2 className="text-xl font-bold">Mochila digital</h2>
            </div>
            <div className="space-y-4 text-sm leading-6 text-slate-600">
              <p>
                Guarda preferências, conquistas, crises, acomodações e histórico de evolução da infância até a vida
                adulta.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#f1f5f0] p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Registros</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">128</p>
                </div>
                <div className="rounded-lg bg-[#f1f5f0] p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Fases</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">4</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-800" aria-hidden="true" />
              <h2 className="text-xl font-bold">Passaporte sensorial</h2>
            </div>
            <div className="grid gap-2">
              {sensoryItems.map((item) => (
                <div key={item} className="flex min-h-11 items-center gap-3 rounded-lg bg-[#f1f5f0] px-3 text-sm font-semibold text-slate-700">
                  <Check size={16} className="text-emerald-800" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Módulos plugáveis</p>
              <h2 className="mt-2 text-2xl font-bold">O core libera só o que ajuda agora</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              A experiência cresce por necessidade, não por menu cheio. Cada módulo pode virar produto B2C, B2B ou B2G.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <div key={module.title} className="min-h-48 rounded-lg border border-slate-200 bg-[#fafbf8] p-4">
                  <Icon size={24} className="text-emerald-800" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold text-slate-950">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{module.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <GraduationCap size={24} className="text-emerald-800" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">Entrada</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">ONGs, escolas e comunidades validam o uso real.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <HeartPulse size={24} className="text-emerald-800" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">Credibilidade</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Clínicas e terapeutas usam relatórios e acompanhamento.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <BriefcaseBusiness size={24} className="text-emerald-800" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">Escala</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Empresas e governo contratam inclusão, onboarding e dados funcionais.</p>
        </div>
      </section>
    </main>
  )
}
