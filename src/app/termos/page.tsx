import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso — AgroCore',
  description: 'Termos e condições de uso da plataforma AgroCore.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Termos de Uso</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700">
        <div>
          <p className="text-sm text-gray-400">Última atualização: abril de 2025</p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Aceitação dos Termos</h2>
          <p className="text-sm leading-relaxed">
            Ao acessar ou usar a plataforma AgroCore, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Sobre a Plataforma</h2>
          <p className="text-sm leading-relaxed">
            O AgroCore é um marketplace digital que conecta produtores rurais a prestadores de serviços agrícolas. Atuamos como intermediário tecnológico, facilitando a conexão entre as partes, mas não somos responsáveis pela execução dos serviços contratados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Cadastro e Conta</h2>
          <p className="text-sm leading-relaxed mb-2">
            Para utilizar a plataforma, você deve criar uma conta com informações verdadeiras e atualizadas. É de sua responsabilidade manter a confidencialidade de suas credenciais de acesso.
          </p>
          <p className="text-sm leading-relaxed">
            Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos ou que apresentem atividade suspeita.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Responsabilidades do Produtor</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Fornecer informações precisas sobre os serviços solicitados</li>
            <li>Realizar o pagamento conforme acordado com o prestador</li>
            <li>Garantir acesso seguro à propriedade para execução do serviço</li>
            <li>Avaliar o serviço prestado de forma honesta</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Responsabilidades do Prestador</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Executar os serviços com qualidade e dentro do prazo acordado</li>
            <li>Possuir habilitação e equipamentos adequados para os serviços oferecidos</li>
            <li>Cumprir todas as normas de segurança e legislação aplicável</li>
            <li>Manter os dados do perfil atualizados e verídicos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Pagamentos e Taxas</h2>
          <p className="text-sm leading-relaxed mb-2">
            Os pagamentos são processados de forma segura via Stripe. O AgroCore retém uma taxa de 5% sobre o valor de cada serviço concluído para manutenção e melhoria da plataforma.
          </p>
          <p className="text-sm leading-relaxed">
            O valor é mantido em custódia e liberado ao prestador somente após a conclusão do serviço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Cancelamentos</h2>
          <p className="text-sm leading-relaxed">
            Cancelamentos devem ser comunicados com antecedência mínima de 24 horas. Cancelamentos realizados após o início do serviço podem estar sujeitos a cobranças parciais, a serem acordadas entre as partes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Conduta Proibida</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Usar a plataforma para atividades ilegais ou fraudulentas</li>
            <li>Publicar informações falsas ou enganosas</li>
            <li>Assediar ou ameaçar outros usuários</li>
            <li>Tentar contornar o sistema de pagamento da plataforma</li>
            <li>Criar múltiplas contas para obter vantagens indevidas</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. Limitação de Responsabilidade</h2>
          <p className="text-sm leading-relaxed">
            O AgroCore não se responsabiliza por danos causados pela execução dos serviços, disputas entre usuários, falhas de conexão à internet ou eventos de força maior. Nossa responsabilidade é limitada ao valor das taxas pagas à plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">10. Alterações nos Termos</h2>
          <p className="text-sm leading-relaxed">
            Podemos atualizar estes Termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas por e-mail ou notificação na plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">11. Contato</h2>
          <p className="text-sm leading-relaxed">
            Para dúvidas sobre estes Termos, entre em contato pelo e-mail: <strong>contato@agrocore.com.br</strong>
          </p>
        </section>

        <div className="border-t border-gray-200 pt-6 text-center">
          <Link href="/privacidade" className="text-green-700 text-sm hover:underline">
            Ver Política de Privacidade →
          </Link>
        </div>
      </div>
    </div>
  )
}
