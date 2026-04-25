const offerings = [
  {
    nome: 'Alto das Palmeiras',
    status: 'UNDER_REVIEW',
    parceiro: 'Vértice Estruturadora',
    ticket: 'R$ 5.000',
    progresso: '14/18 documentos',
  },
  {
    nome: 'Nova Renda I',
    status: 'ACTIVE',
    parceiro: 'Ponte Capital',
    ticket: 'R$ 1.000',
    progresso: 'Data room aprovado',
  },
  {
    nome: 'Recebiveis Prime II',
    status: 'READY',
    parceiro: 'Atto Securitizadora',
    ticket: 'R$ 10.000',
    progresso: 'Aguardando publicacao com parceiro',
  },
]

export default function TokenizationOperationsPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Operacoes
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Mesa de acompanhamento das ofertas
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Esta tela representa o coracao do MVP: uma visao clara das operacoes, parceiro
          responsavel, ticket base e maturidade documental.
        </p>
      </section>

      <section className="grid gap-5">
        {offerings.map((offering) => (
          <article
            key={offering.nome}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                  {offering.status}
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-950">{offering.nome}</h3>
                <p className="mt-2 text-sm text-slate-500">{offering.parceiro}</p>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 lg:min-w-[360px]">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="font-semibold text-slate-800">Ticket minimo</div>
                  <div className="mt-1">{offering.ticket}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="font-semibold text-slate-800">Progresso</div>
                  <div className="mt-1">{offering.progresso}</div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
