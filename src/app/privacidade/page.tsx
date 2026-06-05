import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — AgroCore',
  description: 'Como o AgroCore coleta, usa e protege seus dados pessoais.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Política de Privacidade</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700">
        <div>
          <p className="text-sm text-gray-400">Última atualização: abril de 2025</p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Introdução</h2>
          <p className="text-sm leading-relaxed">
            O AgroCore respeita sua privacidade e está comprometido com a proteção dos seus dados pessoais. Esta política descreve como coletamos, usamos, armazenamos e compartilhamos suas informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Dados que Coletamos</h2>
          <p className="text-sm leading-relaxed mb-2 font-medium">Dados fornecidos por você:</p>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 mb-4">
            <li>Nome completo e e-mail (cadastro)</li>
            <li>Número de telefone/WhatsApp (opcional)</li>
            <li>Localização geográfica (para encontrar prestadores próximos)</li>
            <li>Fotos de comprovação de serviço (enviadas pelo prestador)</li>
            <li>Dados de pagamento (processados diretamente pelo Stripe — não armazenamos dados de cartão)</li>
          </ul>
          <p className="text-sm leading-relaxed mb-2 font-medium">Dados coletados automaticamente:</p>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Endereço IP e tipo de navegador</li>
            <li>Páginas acessadas e tempo de uso</li>
            <li>Preferências de tema (armazenadas localmente no seu dispositivo)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Como Usamos seus Dados</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Criar e gerenciar sua conta na plataforma</li>
            <li>Conectar produtores e prestadores de forma eficiente</li>
            <li>Processar pagamentos com segurança</li>
            <li>Enviar notificações sobre seus serviços via e-mail e WhatsApp</li>
            <li>Melhorar a experiência da plataforma</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Compartilhamento de Dados</h2>
          <p className="text-sm leading-relaxed mb-2">
            Seus dados são compartilhados apenas com:
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li><strong>Stripe</strong> — processamento seguro de pagamentos</li>
            <li><strong>Supabase</strong> — armazenamento seguro de dados</li>
            <li><strong>Z-API</strong> — envio de notificações via WhatsApp</li>
            <li><strong>Outros usuários</strong> — somente as informações necessárias para a prestação do serviço (nome, avaliação, localização aproximada)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            Não vendemos seus dados pessoais a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Armazenamento e Segurança</h2>
          <p className="text-sm leading-relaxed">
            Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS) e em repouso. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou destruição.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Seus Direitos (LGPD)</h2>
          <p className="text-sm leading-relaxed mb-2">Você tem direito a:</p>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
            <li>Solicitar a portabilidade dos dados</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            Para exercer esses direitos, entre em contato: <strong>suporte@oryonag.com.br</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Cookies</h2>
          <p className="text-sm leading-relaxed">
            Utilizamos cookies essenciais para manter sua sessão ativa e cookies de preferência para lembrar suas configurações (como o tema da interface). Não utilizamos cookies de rastreamento publicitário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Retenção de Dados</h2>
          <p className="text-sm leading-relaxed">
            Mantemos seus dados pelo tempo necessário para a prestação dos serviços ou conforme exigido por lei. Após o encerramento da conta, os dados são eliminados em até 90 dias, exceto quando a retenção for obrigatória por legislação.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. Alterações nesta Política</h2>
          <p className="text-sm leading-relaxed">
            Esta política pode ser atualizada periodicamente. Notificaremos você sobre mudanças significativas por e-mail. Recomendamos revisitar esta página regularmente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">10. Contato</h2>
          <p className="text-sm leading-relaxed">
            Dúvidas sobre privacidade: <strong>suporte@oryonag.com.br</strong><br />
            Encarregado de Dados (DPO): disponível mediante solicitação.
          </p>
        </section>

        <div className="border-t border-gray-200 pt-6 text-center">
          <Link href="/termos" className="text-green-700 text-sm hover:underline">
            Ver Termos de Uso →
          </Link>
        </div>
      </div>
    </div>
  )
}
