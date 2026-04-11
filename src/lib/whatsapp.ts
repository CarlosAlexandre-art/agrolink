/**
 * Z-API — Notificações via WhatsApp
 * Docs: https://developer.z-api.io/
 *
 * Env vars necessárias (adicionar no Vercel):
 *   ZAPI_INSTANCE_ID   — ID da instância no Z-API
 *   ZAPI_TOKEN         — Token da instância
 *   ZAPI_CLIENT_TOKEN  — Client-Token (header de segurança)
 */

const ZAPI_BASE = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`

function limparTelefone(tel: string): string {
  // Remove tudo que não é dígito e garante código do país 55
  const digits = tel.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

export async function enviarWhatsApp(telefone: string, mensagem: string): Promise<void> {
  // Silencia sem lançar exceção se não configurado
  if (!process.env.ZAPI_INSTANCE_ID || !process.env.ZAPI_TOKEN) return

  const phone = limparTelefone(telefone)
  if (phone.length < 12) return // número inválido

  try {
    await fetch(`${ZAPI_BASE}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': process.env.ZAPI_CLIENT_TOKEN || '',
      },
      body: JSON.stringify({ phone, message: mensagem }),
    })
  } catch (e) {
    // Nunca deixar falha de WhatsApp quebrar o fluxo principal
    console.error('WhatsApp notification error:', e)
  }
}

// ── Mensagens padronizadas ───────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrocore.com.br'

export const wpp = {
  novoChamado(prestadorNome: string, servicoLabel: string, serviceId: string) {
    return `🌿 *AgroCore* — Novo chamado!\n\nOlá, ${prestadorNome.split(' ')[0]}! Um novo serviço está disponível para você:\n\n📋 *${servicoLabel}*\n\nAcesse o app para aceitar ou recusar:\n${APP_URL}/servico/${serviceId}`
  },

  propostaRecebida(produtorNome: string, prestadorNome: string, valor: number, serviceId: string) {
    return `🌿 *AgroCore* — Nova proposta!\n\nOlá, ${produtorNome.split(' ')[0]}! ${prestadorNome.split(' ')[0]} enviou uma proposta de *R$ ${valor.toFixed(2)}* para seu serviço.\n\nAcesse o app para revisar e decidir:\n${APP_URL}/servico/${serviceId}`
  },

  propostaAceita(prestadorNome: string, servicoLabel: string, valor: number, serviceId: string) {
    return `🌿 *AgroCore* — Proposta aceita!\n\nParabéns, ${prestadorNome.split(' ')[0]}! O produtor aceitou sua proposta de *R$ ${valor.toFixed(2)}* para:\n\n📋 *${servicoLabel}*\n\nAcesse o app para acompanhar:\n${APP_URL}/servico/${serviceId}`
  },

  servicoConcluido(produtorNome: string, servicoLabel: string, serviceId: string) {
    return `🌿 *AgroCore* — Serviço concluído!\n\nOlá, ${produtorNome.split(' ')[0]}! O serviço *${servicoLabel}* foi marcado como concluído.\n\nAvalie o prestador e confirme a conclusão:\n${APP_URL}/servico/${serviceId}`
  },

  statusAtualizado(produtorNome: string, servicoLabel: string, novoStatus: string, serviceId: string) {
    const statusLabel: Record<string, string> = {
      EM_ROTA: '🚗 O prestador está a caminho!',
      EXECUTANDO: '⚙️ O serviço está sendo executado!',
      CONCLUIDO: '✅ O serviço foi concluído!',
    }
    const label = statusLabel[novoStatus] || `Status: ${novoStatus}`
    return `🌿 *AgroCore* — Atualização do serviço\n\nOlá, ${produtorNome.split(' ')[0]}!\n${label}\n\n📋 *${servicoLabel}*\n\nAcompanhe em tempo real:\n${APP_URL}/servico/${serviceId}`
  },

  propostaRecusada(prestadorNome: string, servicoLabel: string) {
    return `🌿 *AgroCore* — Proposta recusada\n\nOlá, ${prestadorNome.split(' ')[0]}. O produtor recusou sua proposta para o serviço:\n\n📋 *${servicoLabel}*\n\nFique disponível para receber novos chamados!\n${APP_URL}/dashboard`
  },

  pagamentoConfirmado(prestadorNome: string, servicoLabel: string, valor: number, serviceId: string) {
    return `🌿 *AgroCore* — Pagamento confirmado! 💰\n\nOlá, ${prestadorNome.split(' ')[0]}! O produtor pagou *R$ ${valor.toFixed(2)}* pelo serviço:\n\n📋 *${servicoLabel}*\n\nO valor ficará em custódia e será liberado após a conclusão. Acesse o app para iniciar:\n${APP_URL}/servico/${serviceId}`
  },

  avaliacaoRecebida(prestadorNome: string, nota: number, comentario: string | null, servicoLabel: string) {
    const estrelas = '⭐'.repeat(nota)
    const msg = comentario ? `\n\n💬 "${comentario}"` : ''
    return `🌿 *AgroCore* — Nova avaliação!\n\nParabéns, ${prestadorNome.split(' ')[0]}! Você recebeu uma avaliação por *${servicoLabel}*:\n\n${estrelas} (${nota}/5)${msg}\n\nVeja seu perfil:\n${APP_URL}/dashboard`
  },

  novaMensagemChat(destinatarioNome: string, remetenteNome: string, trecho: string, serviceId: string) {
    const preview = trecho.length > 80 ? trecho.slice(0, 80) + '...' : trecho
    return `🌿 *AgroCore* — Nova mensagem 💬\n\nOlá, ${destinatarioNome.split(' ')[0]}! ${remetenteNome.split(' ')[0]} enviou uma mensagem:\n\n"${preview}"\n\nResponda pelo chat do serviço:\n${APP_URL}/servico/${serviceId}/chat`
  },
}
