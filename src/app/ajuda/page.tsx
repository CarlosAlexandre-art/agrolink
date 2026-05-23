import Link from 'next/link'
import AjudaInterativo from './AjudaInterativo'

const SECOES = [
  {
    id: 'como-funciona',
    titulo: '📖 Como funciona o AgroCore',
    conteudo: [
      {
        subtitulo: 'Para Produtores Rurais',
        itens: [
          'Cadastre-se gratuitamente como Produtor',
          'Solicite o serviço que precisa em menos de 1 minuto',
          'O sistema encontra automaticamente prestadores disponíveis próximos',
          'Acompanhe o serviço em tempo real pelo app',
          'Pague com segurança — o dinheiro só é liberado após a conclusão',
          'Avalie o prestador ao final',
        ]
      },
      {
        subtitulo: 'Para Prestadores de Serviço',
        itens: [
          'Cadastre-se informando os serviços que oferece',
          'Mantenha o status "Disponível" ativado para receber chamados',
          'Aceite ou recuse chamados conforme sua agenda',
          'Atualize o status do serviço pelo app: A caminho → Executando → Concluído',
          'Receba o pagamento automaticamente após a conclusão',
          'Construa sua reputação através das avaliações',
        ]
      }
    ]
  },
  {
    id: 'pagamentos',
    titulo: '💳 Regras de Pagamento',
    conteudo: [
      {
        subtitulo: 'Como funciona o pagamento',
        itens: [
          'O produtor paga pelo serviço antes do início',
          'O valor fica retido em custódia segura (escrow)',
          'O dinheiro é liberado ao prestador somente após a conclusão do serviço',
          'O AgroCore retém apenas 5% de comissão sobre o valor total',
          'O prestador recebe 95% do valor acordado',
          'Pagamentos são processados em até 2 dias úteis',
        ]
      },
      {
        subtitulo: 'Disputas e reembolsos',
        itens: [
          'Em caso de serviço não realizado, o produtor pode solicitar reembolso',
          'Disputas são analisadas pela equipe AgroCore em até 48h',
          'Comprovantes e fotos do serviço são aceitos como evidência',
          'Nunca realize pagamentos fora da plataforma — sem garantia',
          'Combine o preço dentro do app para ter proteção',
        ]
      }
    ]
  },
  {
    id: 'regras',
    titulo: '📋 Diretrizes de Uso',
    conteudo: [
      {
        subtitulo: 'O que é permitido',
        itens: [
          'Solicitar e oferecer serviços rurais legítimos',
          'Negociar detalhes do serviço via chat dentro do app',
          'Cancelar um serviço com aviso prévio razoável',
          'Avaliar prestadores e produtores honestamente',
          'Reportar problemas e irregularidades',
        ]
      },
      {
        subtitulo: 'O que não é permitido',
        itens: [
          'Combinar pagamentos fora da plataforma',
          'Criar perfis falsos ou usar dados de terceiros',
          'Declarar serviço concluído sem ter executado',
          'Assediar, ameaçar ou ofender outros usuários',
          'Usar o app para atividades ilegais',
          'Manipular avaliações ou criar contas falsas',
        ]
      }
    ]
  },
  {
    id: 'seguranca',
    titulo: '🔒 Segurança e Verificação',
    conteudo: [
      {
        subtitulo: 'Como protegemos você',
        itens: [
          'Todos os pagamentos passam por sistema antifraude',
          'Prestadores são avaliados pela comunidade',
          'Contas suspeitas são bloqueadas automaticamente',
          'Seus dados são criptografados e protegidos',
          'Nunca compartilhamos seus dados com terceiros',
        ]
      },
      {
        subtitulo: 'Dicas de segurança',
        itens: [
          'Sempre verifique a avaliação e histórico do prestador',
          'Documente o serviço com fotos antes e depois',
          'Só marque como concluído quando estiver satisfeito',
          'Desconfie de preços muito abaixo do mercado',
          'Em caso de dúvida, entre em contato com o suporte',
        ]
      }
    ]
  },
]

export default function AjudaPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/perfil" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Central de Ajuda</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Suporte */}
        <div className="bg-green-700 rounded-2xl p-5 text-white">
          <div className="font-bold text-lg mb-1">Precisa de ajuda?</div>
          <p className="text-green-100 text-sm mb-4">Nossa equipe está disponível para te atender.</p>
          <div className="flex gap-3">
            <a
              href="https://wa.me/5585986027333?text=Olá, preciso de ajuda com o AgroCore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-white/20 text-white font-bold rounded-xl text-center text-sm hover:bg-white/30 transition border border-white/30"
            >
              📱 WhatsApp
            </a>
            <a
              href="mailto:suporte@oryonag.com.br"
              className="flex-1 py-3 bg-white/20 text-white font-bold rounded-xl text-center text-sm hover:bg-white/30 transition border border-white/30"
            >
              ✉️ Email
            </a>
          </div>
        </div>

        {/* Denúncia */}
        <Link
          href="/denunciar"
          className="block bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-bold text-red-700">Fazer uma denúncia</div>
              <div className="text-sm text-red-500">Reporte fraudes, golpes ou comportamento inadequado</div>
            </div>
            <span className="ml-auto text-red-400">→</span>
          </div>
        </Link>

        {/* Componente interativo (tema, acessibilidade, FAQ, tour) */}
        <AjudaInterativo />

        {/* Seções estáticas */}
        {SECOES.map(secao => (
          <div key={secao.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg">{secao.titulo}</h2>
            </div>
            {secao.conteudo.map((bloco, i) => (
              <div key={i} className="p-5 border-b border-gray-50 last:border-0">
                <h3 className="font-semibold text-green-700 mb-3">{bloco.subtitulo}</h3>
                <ul className="space-y-2">
                  {bloco.itens.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  )
}
