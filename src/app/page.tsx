import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'

export default function Home() {
  const servicosDestaque = SERVICOS.slice(0, 6)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">🌿 AgroLink</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-white border border-white rounded-lg hover:bg-green-600 transition"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="px-4 py-2 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-green-700 to-green-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Serviços rurais na palma da mão
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Conectamos produtores rurais a prestadores de serviços confiáveis em todo o Brasil.
            Rápido, seguro e com pagamento garantido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cadastro?tipo=PRODUTOR"
              className="px-8 py-4 bg-white text-green-700 font-bold text-lg rounded-xl hover:bg-green-50 transition shadow-lg"
            >
              🌾 Sou Produtor
            </Link>
            <Link
              href="/cadastro?tipo=PRESTADOR"
              className="px-8 py-4 bg-green-800 text-white font-bold text-lg rounded-xl hover:bg-green-900 transition shadow-lg border border-green-500"
            >
              🔧 Sou Prestador de Serviço
            </Link>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', icon: '📋', titulo: 'Solicite o serviço', desc: 'Descreva o que precisa, informe a localização e urgência. Leva menos de 30 segundos.' },
              { num: '2', icon: '🤝', titulo: 'Match automático', desc: 'Conectamos você ao prestador mais próximo, disponível e bem avaliado.' },
              { num: '3', icon: '✅', titulo: 'Serviço garantido', desc: 'Acompanhe em tempo real. O pagamento só é liberado após a conclusão.' },
            ].map((item) => (
              <div key={item.num} className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.titulo}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Serviços disponíveis</h2>
          <p className="text-center text-gray-500 mb-10">+18 categorias de serviços rurais em todo o Brasil</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {servicosDestaque.map((s) => (
              <div
                key={s.value}
                className="p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:shadow-md transition cursor-pointer bg-white"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="font-semibold text-gray-800">{s.label}</div>
                <div className="text-sm text-gray-500 mt-1">{s.descricao}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/servicos"
              className="text-green-700 font-semibold hover:underline"
            >
              Ver todos os serviços →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-green-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Comece agora, é gratuito</h2>
        <p className="text-green-100 text-lg mb-8">
          Produtores não pagam nada. Prestadores só pagam comissão quando fecham serviços.
        </p>
        <Link
          href="/cadastro"
          className="px-10 py-4 bg-white text-green-700 font-bold text-lg rounded-xl hover:bg-green-50 transition shadow-lg inline-block"
        >
          Criar conta gratuita
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-gray-400 text-center">
        <p>© 2025 AgroLink · Serviços Rurais em todo o Brasil</p>
      </footer>
    </div>
  )
}
