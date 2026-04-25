import Link from 'next/link'

const productModules = [
  {
    title: 'Asset Intake',
    text: 'Qualificacao do ativo, documentos, checklist juridico e status da operacao.',
  },
  {
    title: 'Data Room',
    text: 'Sala do ativo com trilha de acesso, versionamento e pacotes para diligencia.',
  },
  {
    title: 'Structuring Desk',
    text: 'Parametros da emissao, classes, tickets, cap table e regras de distribuicao.',
  },
  {
    title: 'Investor Portal',
    text: 'Area white-label para onboarding, acompanhamento e historico do investidor.',
  },
  {
    title: 'Post-Offer Ops',
    text: 'Registro de titulares, eventos, rendimentos, comunicados e operacao recorrente.',
  },
  {
    title: 'Compliance Trail',
    text: 'Logs, aprovacoes, aceites e rastreabilidade para auditoria e governanca.',
  },
]

const operatingMatrix = [
  {
    zone: 'Faixa verde',
    accent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    title: 'Podemos fazer sozinhos',
    items: [
      'software white-label',
      'data room e onboarding',
      'workflow operacional',
      'cap table interno',
      'portal do investidor',
      'relatorios e trilha de compliance',
    ],
  },
  {
    zone: 'Faixa amarela',
    accent: 'bg-amber-100 text-amber-900 border-amber-200',
    title: 'Fazemos com parceiro CVM',
    items: [
      'oferta publica via plataforma registrada',
      'jornada de distribuicao conectada ao parceiro',
      'piloto de captacao estruturado',
      'pos-oferta em operacao regulada',
    ],
  },
  {
    zone: 'Faixa vermelha',
    accent: 'bg-rose-100 text-rose-900 border-rose-200',
    title: 'Nao comecar assim',
    items: [
      'exchange aberta',
      'custodia propria sem enquadramento',
      'liquidez instantanea prometida',
      'recomendacao personalizada de investimento',
    ],
  },
]

const phases = [
  'Fase 1: Operation OS com onboarding, data room e pos-oferta.',
  'Fase 2: Distribution OS com portal white-label e jornada comercial.',
  'Fase 3: Registry OS com ledger interno e espelhamento on-chain opcional.',
  'Fase 4: Market OS com integracoes mais profundas e infraestrutura secundaria.',
]

export default function TokenizationOsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f0e8_0%,#f7f7f5_45%,#ffffff_100%)] text-slate-900">
      <section className="border-b border-slate-200/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
              Tokenization OS Brasil
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Infraestrutura para ofertas tokenizadas sem nascer do lado errado da mesa.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              A tese inicial e vender sistema, operacao e white-label para emissores,
              estruturadores e parceiros regulados. O token entra como camada de registro,
              nao como desculpa para pular governanca.
            </p>
          </div>

          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Primeira oferta
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              Setup + white-label + pos-oferta
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Implantamos a esteira digital da operacao, a sala do ativo, o portal do investidor e o
              controle de pos-oferta para parceiros que nao querem montar software do zero.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">B2B SaaS</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">White-label</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Parceiro regulado</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Produto
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
            O MVP nao e uma exchange. E um sistema operacional de emissao e operacao.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {productModules.map((module) => (
            <article
              key={module.title}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <h3 className="text-xl font-bold text-slate-950">{module.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{module.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Mapa operacional
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              A fronteira entre o que podemos operar, o que precisa de parceiro e o que nao devemos vender no inicio.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {operatingMatrix.map((block) => (
              <article key={block.zone} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${block.accent}`}>
                  {block.zone}
                </span>
                <h3 className="mt-4 text-2xl font-bold">{block.title}</h3>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
                  {block.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Roadmap
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Sequencia recomendada
            </h2>
            <div className="mt-6 space-y-4">
              {phases.map((phase) => (
                <div key={phase} className="rounded-2xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
                  {phase}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
              Decisao de negocio
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              O que vendemos primeiro
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-700">
              Uma oferta de implantacao para parceiros que precisam organizar uma operacao tokenizada
              com rapidez, mais governanca e melhor apresentacao para o investidor.
            </p>
            <div className="mt-6 rounded-2xl bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm">
              &quot;Implantamos sua esteira digital de emissao, portal do investidor, sala do ativo e
              rotina de pos-oferta sem voce precisar construir tecnologia do zero.&quot;
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Voltar ao projeto atual
              </Link>
              <Link
                href="/ajuda"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Evoluir para prototipo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
