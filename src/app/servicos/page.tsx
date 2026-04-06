import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'

export default function ServicosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white hover:text-green-200">← Voltar</Link>
            <h1 className="font-bold text-lg">Todos os Serviços</h1>
          </div>
          <Link href="/cadastro" className="px-3 py-1.5 bg-white text-green-700 font-semibold rounded-lg text-sm hover:bg-green-50 transition">
            Começar grátis
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-gray-600 text-sm mb-6 text-center">
          Conectamos você com prestadores qualificados para qualquer serviço rural no Brasil.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {SERVICOS.map(s => (
            <div
              key={s.value}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-semibold text-gray-800 text-sm">{s.label}</div>
              <div className="text-xs text-gray-500 mt-1">{s.descricao}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-green-700 rounded-2xl p-6 text-white text-center">
          <div className="font-bold text-xl mb-2">Precisa de algum desses serviços?</div>
          <p className="text-green-100 text-sm mb-4">Cadastre-se grátis e encontre prestadores próximos de você em minutos.</p>
          <Link
            href="/cadastro"
            className="inline-block px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition"
          >
            Criar conta gratuita →
          </Link>
        </div>
      </div>
    </div>
  )
}
