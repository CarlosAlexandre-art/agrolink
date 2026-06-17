export type AuditEventType =
  | 'LOGIN_FAILED'
  | 'RATE_LIMIT_HIT'
  | 'UNAUTHORIZED_ACCESS'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'SERVICE_CREATED'
  | 'SERVICE_STATUS_CHANGED'
  | 'MATCH_ACCEPTED'
  | 'MATCH_REJECTED'
  | 'DISPUTE_OPENED'
  | 'DENUNCIA_SUBMITTED'
  | 'LGPD_DELETION_REQUESTED'

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface AuditLogParams {
  type: AuditEventType
  severity: AuditSeverity
  userId?: string
  ip?: string
  details?: Record<string, unknown>
}

export async function auditLog(params: AuditLogParams): Promise<void> {
  // Log estruturado capturado pelo Vercel Logs
  console.log(JSON.stringify({
    audit: true,
    timestamp: new Date().toISOString(),
    type: params.type,
    severity: params.severity,
    userId: params.userId,
    ip: params.ip,
    details: params.details,
  }))

  if (params.severity === 'CRITICAL' || params.severity === 'HIGH') {
    await notifyAdmin(params).catch(() => {})
  }
}

async function notifyAdmin(params: AuditLogParams): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  if (!resendKey || !adminEmail) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'AgroCore Security <noreply@oryonag.com.br>',
      to: adminEmail,
      subject: `🚨 [${params.severity}] AgroCore — ${params.type}`,
      html: `
        <h2>Evento de Segurança — AgroCore</h2>
        <p><b>Tipo:</b> ${params.type}</p>
        <p><b>Severidade:</b> ${params.severity}</p>
        ${params.userId ? `<p><b>Usuário:</b> ${params.userId}</p>` : ''}
        ${params.ip ? `<p><b>IP:</b> ${params.ip}</p>` : ''}
        <p><b>Data:</b> ${new Date().toLocaleString('pt-BR')}</p>
        <pre>${JSON.stringify(params.details, null, 2)}</pre>
      `,
    }),
  })
}
