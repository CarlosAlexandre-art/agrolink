import Link from 'next/link'

const navItems = [
  { href: '/tokenization-os/app', label: 'Resumo' },
  { href: '/tokenization-os/app/operacoes', label: 'Operacoes' },
  { href: '/tokenization-os/app/investidores', label: 'Investidores' },
]

export default function TokenizationWorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0%,#f8fafc_45%,#eef2ff_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Prototype Workspace
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">
              Tokenization OS Brasil
            </h1>
          </div>

          <nav className="flex flex-wrap gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  )
}
