const kpis = [
  { label: 'Operacoes ativas', value: '03', detail: '2 em diligencia e 1 em pos-oferta' },
  { label: 'Investidores monitorados', value: '148', detail: 'base ativa do prototipo white-label' },
  { label: 'Documentos organizados', value: '92', detail: 'com visibilidade e trilha por perfil' },
  { label: 'Eventos registrados', value: '317', detail: 'timeline operacional completa' },
]

const timeline = [
  'Operacao Alto das Palmeiras criada e movida para UNDER_REVIEW.',
  'Data room da operacao Nova Renda I recebeu 12 documentos aprovados.',
  'Distribuicao de abril registrada para 43 alocacoes confirmadas.',
]

export default function TokenizationWorkspaceHome() {
  return (
    <main className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Resumo do prototipo
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            O produto comeca como camada de operacao, nao como mercado.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Esta area simula a experiencia do software que vamos construir. O foco inicial e dar
            visibilidade para operacoes, investidores, documentos, eventos e pos-oferta, com base
            preparada para white-label e integracao com parceiros regulados.
          </p>
        </article>

        <article className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
            Status da fase
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">Sprint de fundacao</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Dominio, backlog, PRD e visualizacao inicial ja estao organizados. O proximo salto e
            ligar isso ao schema, ao dashboard autenticado e ao CRUD das operacoes.
          </p>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
          >
            <p className="text-sm font-semibold text-slate-500">{kpi.label}</p>
            <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{kpi.value}</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{kpi.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Modulos do MVP
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              'Operacoes',
              'Data room',
              'Investidores',
              'Participacoes',
              'Eventos',
              'Compliance trail',
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Timeline de operacao
          </p>
          <div className="mt-5 space-y-4">
            {timeline.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 px-5 py-4 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
