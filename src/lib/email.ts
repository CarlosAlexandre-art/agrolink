import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrocore.live'
const FROM = 'AgroCore <noreply@parceirosdeproposito.com>'

function baseTemplate(conteudo: string) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:sans-serif">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <div style="background:#104e27;padding:24px 32px;text-align:center">
          <div style="color:#fff;font-size:22px;font-weight:bold;letter-spacing:-0.5px">AgroCore</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:4px;letter-spacing:2px;text-transform:uppercase">Soluções Sustentáveis do Campo</div>
        </div>
        <div style="padding:32px">
          ${conteudo}
        </div>
        <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="color:#9ca3af;font-size:12px;margin:0">
            Você está recebendo este email porque tem uma conta no AgroCore.<br>
            <a href="${APP_URL}/perfil" style="color:#15803d">Gerenciar preferências</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const emails = {

  // Usuário inativo
  async inativo(to: string, nome: string, tipo: 'PRODUTOR' | 'PRESTADOR') {
    const isProd = tipo === 'PRODUTOR'
    const conteudo = `
      <h2 style="color:#1f2937;margin-top:0">Sentimos sua falta, ${nome.split(' ')[0]}! 👋</h2>
      <p style="color:#4b5563;line-height:1.6">
        Faz alguns dias que você não acessa o AgroCore. ${isProd
          ? 'Novos prestadores de serviço estão disponíveis na sua região!'
          : 'Novos chamados de serviço podem estar esperando por você!'
        }
      </p>
      <div style="text-align:center;margin:28px 0">
        <a href="${APP_URL}/dashboard" style="background:#15803d;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">
          ${isProd ? '🌱 Ver serviços disponíveis' : '🔔 Ver novos chamados'}
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px">O AgroCore conecta produtores rurais com os melhores prestadores de serviço do Brasil.</p>
    `
    return resend.emails.send({ from: FROM, to, subject: `${nome.split(' ')[0]}, sentimos sua falta no AgroCore!`, html: baseTemplate(conteudo) })
  },

  // Novo prestador na região
  async novoPrestadorNaRegiao(to: string, nome: string, servicoLabel: string) {
    const conteudo = `
      <h2 style="color:#1f2937;margin-top:0">Novo prestador disponível! 🎉</h2>
      <p style="color:#4b5563;line-height:1.6">
        Olá, ${nome.split(' ')[0]}! Um novo prestador de <strong>${servicoLabel}</strong> está disponível na sua região.
      </p>
      <div style="text-align:center;margin:28px 0">
        <a href="${APP_URL}/solicitar" style="background:#15803d;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">
          🚜 Solicitar serviço agora
        </a>
      </div>
    `
    return resend.emails.send({ from: FROM, to, subject: `Novo prestador de ${servicoLabel} na sua região! 🌱`, html: baseTemplate(conteudo) })
  },

  // Serviço sem proposta há 48h
  async servicoSemProposta(to: string, nome: string, servicoLabel: string, serviceId: string) {
    const conteudo = `
      <h2 style="color:#1f2937;margin-top:0">Seu serviço ainda está aguardando 🔍</h2>
      <p style="color:#4b5563;line-height:1.6">
        Olá, ${nome.split(' ')[0]}! Seu pedido de <strong>${servicoLabel}</strong> ainda não recebeu propostas.
        Isso pode acontecer quando a área de cobertura do prestador não inclui sua localização.
      </p>
      <div style="text-align:center;margin:28px 0">
        <a href="${APP_URL}/servico/${serviceId}" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">
          📋 Ver meu serviço
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px">Dica: tente ampliar a descrição do serviço para atrair mais prestadores.</p>
    `
    return resend.emails.send({ from: FROM, to, subject: `Seu pedido de ${servicoLabel} ainda aguarda prestador`, html: baseTemplate(conteudo) })
  },

  // Promoção / lançamento (envio manual para todos)
  async promocao(to: string, nome: string, assunto: string, mensagem: string, ctaTexto: string, ctaUrl: string) {
    const conteudo = `
      <h2 style="color:#1f2937;margin-top:0">${assunto}</h2>
      <p style="color:#4b5563;line-height:1.6">Olá, ${nome.split(' ')[0]}!</p>
      <p style="color:#4b5563;line-height:1.6">${mensagem}</p>
      <div style="text-align:center;margin:28px 0">
        <a href="${ctaUrl}" style="background:#15803d;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">
          ${ctaTexto}
        </a>
      </div>
    `
    return resend.emails.send({ from: FROM, to, subject: assunto, html: baseTemplate(conteudo) })
  },

  // Lançamento AgroOS
  async lancamentoAgroOS(to: string, nome: string) {
    const conteudo = `
      <h2 style="color:#1f2937;margin-top:0">🚀 AgroOS está chegando!</h2>
      <p style="color:#4b5563;line-height:1.6">
        Olá, ${nome.split(' ')[0]}! Estamos desenvolvendo o <strong>AgroOS</strong> — o sistema operacional da sua fazenda.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0">
        <p style="margin:0 0 8px;color:#15803d;font-weight:bold">O que vem por aí:</p>
        <p style="margin:4px 0;color:#374151">✓ Gestão de operações em tempo real</p>
        <p style="margin:4px 0;color:#374151">✓ IA operacional para decisões</p>
        <p style="margin:4px 0;color:#374151">✓ Integrado ao AgroCore</p>
        <p style="margin:4px 0;color:#374151">✓ Controle completo da sua fazenda</p>
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="${APP_URL}" style="background:#15803d;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">
          Quero ser o primeiro a saber
        </a>
      </div>
    `
    return resend.emails.send({ from: FROM, to, subject: '🚀 AgroOS está chegando — seja o primeiro a saber!', html: baseTemplate(conteudo) })
  },

  async contratoGerado(to: string, nome: string, tipoServico: string, valor: number, contratoUrl: string) {
    const valorFmt = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const conteudo = `
      <h2 style="color:#1f2937;margin-top:0">📄 Seu contrato está pronto</h2>
      <p style="color:#4b5563;line-height:1.6">Olá, ${nome.split(' ')[0]}! O contrato referente ao serviço de <strong>${tipoServico}</strong> foi gerado com sucesso.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0">
        <p style="margin:0 0 4px;color:#15803d;font-weight:bold">Resumo do contrato</p>
        <p style="margin:4px 0;color:#374151">✓ Serviço: <strong>${tipoServico}</strong></p>
        <p style="margin:4px 0;color:#374151">✓ Valor: <strong>${valorFmt}</strong></p>
        <p style="margin:4px 0;color:#374151">✓ Aceite eletrônico registrado</p>
        <p style="margin:4px 0;color:#374151">✓ Válido conforme Lei nº 14.063/2020</p>
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="${contratoUrl}" style="background:#15803d;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">
          📄 Ver Contrato
        </a>
      </div>
      <p style="color:#6b7280;font-size:12px;text-align:center">O contrato também está disponível no seu painel em <a href="${APP_URL}/servicos" style="color:#15803d">agrocore.live/servicos</a></p>
    `
    return resend.emails.send({ from: FROM, to, subject: `📄 Contrato gerado — ${tipoServico}`, html: baseTemplate(conteudo) })
  },
}
