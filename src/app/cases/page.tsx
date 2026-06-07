import Link from 'next/link'
import AgroCoreLogo from '@/components/AgroCoreLogo'

export const metadata = {
  title: 'Cases de Sucesso — AgroCore',
  description: 'Histórias reais de produtores e prestadores que transformaram suas operações com o AgroCore.',
}

const CASES = [
  {
    id: 'joao-ceara',
    produtor: 'João Alves',
    cargo: 'Produtor de soja e milho',
    estado: 'Ceará',
    foto: null,
    inicial: 'J',
    servico: 'Pulverização Aérea',
    resultado: 'Economizou R$ 12.000 em uma safra',
    depoimento: 'Antes eu ficava ligando para conhecidos tentando encontrar alguém de confiança para pulverizar. Com o AgroCore encontrei um prestador verificado em menos de 2 horas, com histórico completo e avaliações reais. O contrato digital me deu segurança que nunca tive.',
    metricas: [
      { label: 'Tempo para encontrar prestador', antes: '3-5 dias', depois: '2 horas' },
      { label: 'Economia na safra', antes: 'R$ 0', depois: 'R$ 12.000' },
      { label: 'Serviços contratados', antes: '—', depois: '4 serviços' },
    ],
    destaque: true,
  },
  {
    id: 'marcos-goias',
    produtor: 'Marcos Ferreira',
    cargo: 'Prestador de serviços agrícolas',
    estado: 'Goiás',
    foto: null,
    inicial: 'M',
    servico: 'Aplicação de defensivos',
    resultado: 'Triplicou a carteira de clientes em 6 meses',
    depoimento: 'Minha agenda estava sempre vazia fora de indicação. Depois do AgroCore passei de 2 para 8 clientes fixos. O sistema me avisava em tempo real de novos serviços na minha região. Hoje tenho previsibilidade de renda que nunca tive na vida.',
    metricas: [
      { label: 'Clientes fixos', antes: '2', depois: '8' },
      { label: 'Renda mensal', antes: 'R$ 3.500', depois: 'R$ 11.000' },
      { label: 'Taxa de recontratação', antes: '20%', depois: '85%' },
    ],
    destaque: false,
  },
  {
    id: 'ana-bahia',
    produtor: 'Ana Lima',
    cargo: 'Produtora de café',
    estado: 'Bahia',
    foto: null,
    inicial: 'A',
    servico: 'Colheita mecanizada',
    resultado: 'Reduziu perda de colheita em 40%',
    depoimento: 'Nunca tinha conseguido mecanizar minha colheita porque não sabia onde encontrar alguém de confiança com a máquina certa. Pelo AgroCore filtrei por tipo de serviço e encontrei um prestador especializado em café. O resultado foi extraordinário.',
    metricas: [
      { label: 'Perda na colheita', antes: '18%', depois: '11%' },
      { label: 'Tempo de colheita', antes: '22 dias', depois: '9 dias' },
      { label: 'Custo por tonelada', antes: 'R$ 280', depois: 'R$ 195' },
    ],
    destaque: false,
  },
]

function Metrica({ label, antes, depois }: { label: string; antes: string; depois: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 line-through">{antes}</span>
        <span>→</span>
        <span className="font-bold text-green-700">{depois}</span>
      </div>
    </div>
  )
}

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/"><AgroCoreLogo size={28} /></Link>
          <Link href="/cadastro" className="px-4 py-2 bg-white text-green-700 font-bold rounded-xl text-sm hover:bg-green-50 transition">
            Começar grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-green-700 text-white px-4 pt-8 pb-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-3">Cases de Sucesso</div>
          <h1 className="text-3xl font-black mb-4 leading-tight">
            Histórias reais de quem já transformou sua operação
          </h1>
          <p className="text-green-100 text-base">
            Produtores e prestadores de todo o Brasil usando o AgroCore para conectar, contratar e crescer com segurança.
          </p>
        </div>
      </section>

      {/* Cases */}
      <section className="max-w-4xl mx-auto px-4 py-12 -mt-8">
        <div className="space-y-8">
          {CASES.map(c => (
            <div key={c.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden ${c.destaque ? 'ring-2 ring-green-500' : ''}`}>
              {c.destaque && (
                <div className="bg-green-600 text-white text-center text-xs font-bold py-2 tracking-wider uppercase">
                  ⭐ Case em Destaque
                </div>
              )}
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl font-black text-green-700 flex-shrink-0">
                    {c.inicial}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{c.produtor}</div>
                    <div className="text-sm text-gray-500">{c.cargo}</div>
                    <div className="text-xs text-gray-400 mt-0.5">📍 {c.estado}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-gray-400">Serviço</div>
                    <div className="text-sm font-semibold text-green-700">{c.servico}</div>
                  </div>
                </div>

                {/* Resultado em destaque */}
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-5">
                  <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Resultado</div>
                  <div className="text-xl font-black text-green-800">{c.resultado}</div>
                </div>

                {/* Depoimento */}
                <blockquote className="text-gray-600 text-sm leading-relaxed italic mb-6 border-l-4 border-green-300 pl-4">
                  "{c.depoimento}"
                </blockquote>

                {/* Métricas */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Comparativo Antes × Depois</div>
                  {c.metricas.map(m => (
                    <Metrica key={m.label} {...m} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-green-700 text-white px-4 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-black mb-3">Sua história pode ser a próxima</h2>
          <p className="text-green-100 mb-8">Comece gratuitamente e veja os resultados na primeira contratação.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cadastro?tipo=PRODUTOR"
              className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition"
            >
              Sou Produtor
            </Link>
            <Link
              href="/cadastro?tipo=PRESTADOR"
              className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl border border-green-400 hover:bg-green-500 transition"
            >
              Sou Prestador
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-gray-400">
        <Link href="/" className="hover:text-green-700">← Voltar para o início</Link>
        <span className="mx-3">·</span>
        <Link href="/login" className="hover:text-green-700">Entrar</Link>
      </footer>
    </div>
  )
}
