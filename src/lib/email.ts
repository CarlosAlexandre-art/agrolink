import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrocore.live'
const FROM = 'AgroCore <noreply@parceirosdeproposito.com>'

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="40" height="40" style="display:block">
  <circle cx="24" cy="24" r="21" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"/>
  <path d="M10 32 C10 16 18 8 24 8 C21 14 17 21 17 28 C17 32 14 36 10 36 Z" fill="white"/>
  <rect x="24" y="27" width="4" height="9" rx="1.5" fill="white"/>
  <rect x="30" y="22" width="4" height="14" rx="1.5" fill="white"/>
  <rect x="36" y="16" width="4" height="20" rx="1.5" fill="rgba(255,255,255,0.85)"/>
  <path d="M38 14 L38 10 M36 12 L38 9 L40 12" stroke="rgba(255,255,255,0.85)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

function baseTemplate(conteudo: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f0;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(16,78,39,0.10)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#104e27 0%,#1a7a3f 60%,#679d3f 100%);padding:28px 40px;text-align:center">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:10px">${LOGO_SVG}</td>
              </tr>
              <tr>
                <td align="center">
                  <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">AgroCore</span>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <span style="color:rgba(255,255,255,0.55);font-size:10px;letter-spacing:2.5px;text-transform:uppercase">Soluções Sustentáveis do Campo</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:36px 40px">
            ${conteudo}
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px">
            <div style="height:1px;background:linear-gradient(90deg,transparent,#d1fae5,transparent)"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fdf9;padding:20px 40px;text-align:center;border-top:1px solid #ecfdf5">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 6px">
              Você recebe este e-mail por ter uma conta no AgroCore.
            </p>
            <p style="margin:0">
              <a href="${APP_URL}/perfil" style="color:#15803d;font-size:12px;text-decoration:none">Gerenciar preferências</a>
              &nbsp;·&nbsp;
              <a href="${APP_URL}" style="color:#15803d;font-size:12px;text-decoration:none">agrocore.live</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export const emails = {

  // Confirmação de cadastro
  async confirmarCadastro(to: string, nome: string, tipo: 'PRODUTOR' | 'PRESTADOR', confirmLink: string) {
    const isProd = tipo === 'PRODUTOR'
    const primeiroNome = nome.split(' ')[0]
    const tipoLabel = isProd ? 'Produtor Rural' : 'Prestador de Serviço'
    const tipoIcon = isProd ? '🌾' : '🔧'
    const tipoDescricao = isProd
      ? 'contratar os melhores prestadores de serviço para sua propriedade'
      : 'receber chamados de produtores rurais e expandir seus negócios'

    const conteudo = `
      <!-- Hero -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
        <tr>
          <td align="center" style="padding-bottom:12px">
            <div style="display:inline-block;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #bbf7d0;border-radius:20px;padding:18px 24px;text-align:center">
              <div style="font-size:48px;line-height:1;margin-bottom:8px">${tipoIcon}</div>
              <div style="color:#15803d;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase">${tipoLabel}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td align="center">
            <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 8px;line-height:1.3">
              Olá, ${primeiroNome}! Quase lá 🎉
            </h1>
            <p style="color:#6b7280;font-size:15px;margin:0;line-height:1.5">
              Confirme seu e-mail para começar a<br>${tipoDescricao}.
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA principal -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
        <tr>
          <td align="center">
            <a href="${confirmLink}"
               style="display:inline-block;background:linear-gradient(135deg,#15803d,#679d3f);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:14px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(21,128,61,0.35)">
              ✅ &nbsp;Confirmar meu e-mail
            </a>
          </td>
        </tr>
      </table>

      <!-- Info box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>
          <td style="background:#f8fdf9;border:1px solid #d1fae5;border-radius:14px;padding:20px 24px">
            <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 12px">O que te espera no AgroCore:</p>
            ${isProd ? `
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">🚜 &nbsp;+18 tipos de serviço rural</p>
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">🛡️ &nbsp;Prestadores verificados e avaliados</p>
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">📄 &nbsp;Contratos digitais automáticos</p>
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">💳 &nbsp;Pagamento seguro em custódia</p>
            ` : `
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">🔔 &nbsp;Receba chamados de produtores próximos</p>
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">📄 &nbsp;Contratos digitais em cada serviço</p>
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">💰 &nbsp;Pagamento garantido, sem inadimplência</p>
            <p style="color:#374151;font-size:13px;margin:4px 0;line-height:1.5">⭐ &nbsp;Construa seu ORYON ID e cresça</p>
            `}
          </td>
        </tr>
      </table>

      <!-- Fallback link -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-top:1px dashed #e5e7eb;padding-top:20px">
            <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0 0 8px">
              Se o botão não funcionar, copie e cole este link no navegador:
            </p>
            <p style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;font-size:11px;color:#6b7280;word-break:break-all;text-align:center;margin:0 0 14px">
              ${confirmLink}
            </p>
            <p style="color:#d1d5db;font-size:11px;text-align:center;margin:0">
              ⏱️ &nbsp;Este link expira em 24 horas &nbsp;·&nbsp; Ignore se não foi você
            </p>
          </td>
        </tr>
      </table>
    `

    return resend.emails.send({
      from: FROM,
      to,
      subject: `✅ Confirme seu e-mail — AgroCore`,
      html: baseTemplate(conteudo),
    })
  },

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
