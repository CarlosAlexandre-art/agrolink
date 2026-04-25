const investors = [
  {
    nome: 'Mariana Araujo',
    status: 'ACTIVE',
    email: 'mariana@exemplo.com',
    alocacoes: '3 alocacoes',
  },
  {
    nome: 'Ricardo Nogueira',
    status: 'IN_REVIEW',
    email: 'ricardo@exemplo.com',
    alocacoes: '1 alocacao',
  },
  {
    nome: 'Helena Costa',
    status: 'LEAD',
    email: 'helena@exemplo.com',
    alocacoes: 'sem alocacao',
  },
]

export default function TokenizationInvestorsPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Investidores
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Base monitorada e pronta para portal white-label
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Aqui o sistema comeca a mostrar valor claro para o parceiro: quem esta ativo, quem ainda
          precisa concluir onboarding e qual o estado das participacoes.
        </p>
      </section>

      <section className="grid gap-5">
        {investors.map((investor) => (
          <article
            key={investor.email}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  {investor.status}
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-950">{investor.nome}</h3>
                <p className="mt-2 text-sm text-slate-500">{investor.email}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-800">Historico</div>
                <div className="mt-1">{investor.alocacoes}</div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
