import Link from 'next/link'
import AgroCoreLogo from '@/components/AgroCoreLogo'

export const metadata = {
  title: 'Transparência de Preços — AgroCore',
  description: 'Tudo que é gratuito, o que é premium e como funciona cada cobrança do AgroCore.',
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="bg-green-50 border-b border-green-100 px-6 py-4">
        <h2 className="font-bold text-green-800 text-lg">{titulo}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Item({ ok, label, detalhe }: { ok: boolean; label: string; detalhe?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className={`text-lg flex-shrink-0 mt-0.5 ${ok ? 'text-green-500' : 'text-amber-500'}`}>
        {ok ? '✅' : '⚡'}
      </span>
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {detalhe && <div className="text-xs text-gray-400 mt-0.5">{detalhe}</div>}
      </div>
    </div>
  )
}

function Taxa({ label, valor, detalhe }: { label: string; valor: string; detalhe?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {detalhe && <div className="text-xs text-gray-400 mt-0.5">{detalhe}</div>}
      </div>
      <div className="text-green-700 font-black text-lg flex-shrink-0 ml-4">{valor}</div>
    </div>
  )
}

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/"><AgroCoreLogo size={28} /></Link>
          <Link href="/planos" className="text-green-200 text-sm hover:text-white">Ver planos →</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-green-700 text-white px-4 pt-8 pb-14 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-3xl mb-3">🔍</div>
          <h1 className="text-3xl font-black mb-3">Transparência total de preços</h1>
          <p className="text-green-100 text-base">
            Sem letras miúdas. Sem surpresas. Veja exatamente o que você paga e o que é gratuito no AgroCore.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 -mt-6">

        {/* Gratuito para sempre */}
        <Secao titulo="✅ Gratuito para sempre — para todos os usuários">
          <Item ok label="Criar conta e configurar perfil" />
          <Item ok label="Solicitar serviços (produtor)" />
          <Item ok label="Receber chamados e enviar propostas (prestador)" />
          <Item ok label="Chat integrado com produtor e prestador" />
          <Item ok label="Rastreamento GPS em tempo real" />
          <Item ok label="Contrato digital automático" detalhe="Gerado a cada serviço contratado, com validade jurídica" />
          <Item ok label="ORYON ID — histórico operacional verificado" />
          <Item ok label="Avaliações e sistema de reputação" />
          <Item ok label="Sistema de disputas" detalhe="Em caso de problema, a equipe AgroCore analisa em até 5 dias úteis" />
          <Item ok label="AgroBot — assistente com IA" />
          <Item ok label="Exportação de dados (CSV e PDF)" />
          <Item ok label="Modo simples — interface de 3 botões" />
        </Secao>

        {/* Taxas e comissões */}
        <Secao titulo="💳 Taxas e comissões">
          <Taxa
            label="Comissão AgroCore por serviço concluído"
            valor="5%"
            detalhe="Descontado automaticamente do valor pago pelo produtor ao prestador. Cobre: plataforma, suporte, contratos, segurança e rastreamento."
          />
          <Taxa
            label="Pagamento com cartão de crédito"
            valor="0%"
            detalhe="Sem taxa adicional sobre a comissão. O processamento é feito pelo Stripe (parceiro de pagamento)."
          />
          <Taxa
            label="Cancelamento antes do início"
            valor="Gratuito"
            detalhe="Sem custo para cancelar antes do prestador iniciar o deslocamento."
          />
          <Taxa
            label="Cancelamento após início"
            valor="Consulte"
            detalhe="Sujeito à política de cancelamento definida no contrato digital do serviço."
          />
          <Taxa
            label="Prazo para recebimento (prestador)"
            valor="2 dias úteis"
            detalhe="Após a confirmação de conclusão pelo produtor, o valor é liberado em até 2 dias úteis."
          />
        </Secao>

        {/* Planos premium */}
        <Secao titulo="⚡ Funcionalidades premium — planos pagos">
          <Item ok={false} label="Destaque nas buscas" detalhe="Prestadores PRO aparecem primeiro nos resultados para produtores" />
          <Item ok={false} label="Análise de propostas com IA" detalhe="A IA sugere a melhor proposta comparando preço, avaliação e histórico" />
          <Item ok={false} label="Equipe IA — agentes especializados" detalhe="Agentes de negociação, análise de mercado e estratégia" />
          <Item ok={false} label="Relatórios mensais personalizados com IA" detalhe="Análise completa do mês: desempenho, receita e sugestões" />
          <Item ok={false} label="Selo PRO ou ENTERPRISE no perfil" detalhe="Maior credibilidade com produtores" />
          <Item ok={false} label="Suporte prioritário" detalhe="Atendimento em até 4h úteis (vs 48h no plano gratuito)" />
          <div className="mt-4 text-center">
            <Link
              href="/planos"
              className="inline-block px-8 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition text-sm"
            >
              Ver planos e preços completos →
            </Link>
          </div>
        </Secao>

        {/* Compromissos */}
        <Secao titulo="🤝 Nossos compromissos com você">
          <Item ok label="Nunca aumentamos taxas sem aviso prévio de 30 dias" />
          <Item ok label="Você pode exportar todos os seus dados a qualquer momento" />
          <Item ok label="Você pode cancelar seu plano sem multa" detalhe="Planos mensais cancelados até o próximo vencimento" />
          <Item ok label="Seus dados nunca são vendidos para terceiros" detalhe="Política de privacidade completa em agrocore.live/privacidade" />
          <Item ok label="Sem cobrança surpresa ou taxa oculta" />
        </Secao>

        {/* Dúvidas */}
        <div className="bg-green-700 text-white rounded-2xl p-8 text-center">
          <h2 className="font-bold text-xl mb-2">Ficou com dúvida?</h2>
          <p className="text-green-100 text-sm mb-6">Nossa equipe responde em até 48h. Pode perguntar — sem enrolação.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/5585986027333?text=Olá, tenho uma dúvida sobre preços do AgroCore"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition text-sm"
            >
              💬 WhatsApp
            </a>
            <a
              href="mailto:suporte@oryonag.com.br"
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl border border-green-400 hover:bg-green-500 transition text-sm"
            >
              📧 E-mail
            </a>
          </div>
        </div>

      </div>

      <footer className="text-center py-8 text-sm text-gray-400">
        <Link href="/" className="hover:text-green-700">← Voltar para o início</Link>
        <span className="mx-3">·</span>
        <Link href="/termos" className="hover:text-green-700">Termos de Uso</Link>
        <span className="mx-3">·</span>
        <Link href="/privacidade" className="hover:text-green-700">Privacidade</Link>
      </footer>
    </div>
  )
}
