/**
 * Geração e armazenamento de contratos digitais AgroCore
 * O contrato é gerado como HTML, convertido para PDF via API
 * e armazenado no Supabase Storage bucket 'contratos'
 */
import { createClient as createAdminClient } from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrocore.live'

export interface DadosContrato {
  serviceId: string
  tipo: string
  descricao?: string | null
  valor: number
  endereco?: string | null
  agendadoPara?: Date | null
  produtor: {
    nome: string
    email: string
    cpf?: string | null
    telefone?: string | null
    cidade?: string | null
    estado?: string | null
  }
  prestador: {
    nome: string
    email: string
    cpf?: string | null
    telefone?: string | null
    cidade?: string | null
    estado?: string | null
  }
  ipProdutor?: string
  dataAceite: Date
}

export function gerarHtmlContrato(d: DadosContrato): string {
  const dataFmt = d.dataAceite.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const valorFmt = d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const agendadoFmt = d.agendadoPara
    ? d.agendadoPara.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'A combinar entre as partes'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 48px; font-size: 13px; line-height: 1.7; }
  .header { text-align: center; border-bottom: 3px solid #15803d; padding-bottom: 24px; margin-bottom: 32px; }
  .logo { font-size: 28px; font-weight: 900; color: #15803d; letter-spacing: -1px; }
  .logo span { color: #1a1a1a; }
  .subtitle { font-size: 11px; color: #6b7280; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
  h1 { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #111; }
  .numero { text-align: center; color: #6b7280; font-size: 11px; margin-bottom: 32px; }
  h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #15803d; border-bottom: 1px solid #d1fae5; padding-bottom: 6px; margin: 28px 0 14px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .field label { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; display: block; }
  .field span { font-weight: 600; color: #111; font-size: 13px; }
  .valor-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px 24px; text-align: center; margin: 20px 0; }
  .valor-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #15803d; }
  .valor-box .valor { font-size: 32px; font-weight: 900; color: #15803d; }
  .clausula { margin-bottom: 14px; }
  .clausula strong { display: block; margin-bottom: 4px; }
  .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
  .assinatura { border-top: 1px solid #374151; padding-top: 12px; text-align: center; }
  .assinatura .nome { font-weight: 700; margin-bottom: 4px; }
  .assinatura .papel { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
  .rodape { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; }
  .aceite-eletronico { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-top: 24px; font-size: 11px; color: #1d4ed8; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">AGRO<span>CORE</span></div>
    <div class="subtitle">Conecta · Gestão · Resultados</div>
  </div>

  <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇO AGRÍCOLA</h1>
  <div class="numero">Nº ${d.serviceId.slice(-8).toUpperCase()} · ${dataFmt}</div>

  <h2>1. Partes Contratantes</h2>
  <div class="grid">
    <div>
      <h2 style="font-size:11px;margin-top:0">Contratante (Produtor)</h2>
      <div class="field"><label>Nome</label><span>${d.produtor.nome}</span></div>
      ${d.produtor.cpf ? `<div class="field"><label>CPF/CNPJ</label><span>${d.produtor.cpf}</span></div>` : ''}
      ${d.produtor.telefone ? `<div class="field"><label>Telefone</label><span>${d.produtor.telefone}</span></div>` : ''}
      <div class="field"><label>E-mail</label><span>${d.produtor.email}</span></div>
      ${d.produtor.cidade ? `<div class="field"><label>Cidade/Estado</label><span>${d.produtor.cidade}${d.produtor.estado ? ` - ${d.produtor.estado}` : ''}</span></div>` : ''}
    </div>
    <div>
      <h2 style="font-size:11px;margin-top:0">Contratado (Prestador)</h2>
      <div class="field"><label>Nome</label><span>${d.prestador.nome}</span></div>
      ${d.prestador.cpf ? `<div class="field"><label>CPF/CNPJ</label><span>${d.prestador.cpf}</span></div>` : ''}
      ${d.prestador.telefone ? `<div class="field"><label>Telefone</label><span>${d.prestador.telefone}</span></div>` : ''}
      <div class="field"><label>E-mail</label><span>${d.prestador.email}</span></div>
      ${d.prestador.cidade ? `<div class="field"><label>Cidade/Estado</label><span>${d.prestador.cidade}${d.prestador.estado ? ` - ${d.prestador.estado}` : ''}</span></div>` : ''}
    </div>
  </div>

  <h2>2. Objeto do Contrato</h2>
  <div class="field"><label>Serviço</label><span>${d.tipo}</span></div>
  ${d.descricao ? `<div class="field" style="margin-top:8px"><label>Descrição</label><span>${d.descricao}</span></div>` : ''}
  ${d.endereco ? `<div class="field" style="margin-top:8px"><label>Local de Execução</label><span>${d.endereco}</span></div>` : ''}
  <div class="field" style="margin-top:8px"><label>Prazo / Data Prevista</label><span>${agendadoFmt}</span></div>

  <h2>3. Valor</h2>
  <div class="valor-box">
    <div class="label">Valor Total do Serviço</div>
    <div class="valor">${valorFmt}</div>
  </div>

  <h2>4. Obrigações das Partes</h2>
  <div class="clausula"><strong>4.1 Do Contratante (Produtor):</strong>
    Fornecer acesso à área de execução do serviço, informar corretamente as condições do terreno, efetuar o pagamento conforme acordado e avaliar o serviço após a conclusão.
  </div>
  <div class="clausula"><strong>4.2 Do Contratado (Prestador):</strong>
    Executar o serviço com qualidade, dentro do prazo acordado, com equipamentos adequados e seguindo as boas práticas agrícolas. Comunicar ao Contratante qualquer impedimento com antecedência.
  </div>

  <h2>5. Política de Cancelamento</h2>
  <div class="clausula">
    O cancelamento poderá ser realizado por qualquer das partes com comunicação prévia pela plataforma AgroCore.
    Cancelamentos após o início da execução sujeitam-se às penalidades definidas na plataforma.
  </div>

  <h2>6. Avaliações</h2>
  <div class="clausula">
    As avaliações somente serão habilitadas após a conclusão do serviço, sendo obrigatória a confirmação de execução por ambas as partes. Avaliações injustas poderão ser contestadas conforme política da plataforma.
  </div>

  <h2>7. Resolução de Disputas</h2>
  <div class="clausula">
    Em caso de divergência, as partes deverão acionar o Sistema de Disputas da plataforma AgroCore, enviando evidências (fotos, mensagens, registros). A equipe ORYON analisará e dará o veredicto em até 5 dias úteis.
  </div>

  <h2>8. Aceite Eletrônico</h2>
  <div class="aceite-eletronico">
    ✅ Este contrato foi aceito eletronicamente em <strong>${dataFmt}</strong>.<br>
    ${d.ipProdutor ? `IP do Contratante: <strong>${d.ipProdutor}</strong><br>` : ''}
    O aceite eletrônico tem validade jurídica conforme a Lei nº 14.063/2020 (Assinatura Eletrônica) e MP 2.200-2/2001.
  </div>

  <div class="assinaturas">
    <div class="assinatura">
      <div class="nome">${d.produtor.nome}</div>
      <div class="papel">Contratante · Produtor</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:4px">Aceite eletrônico em ${dataFmt}</div>
    </div>
    <div class="assinatura">
      <div class="nome">${d.prestador.nome}</div>
      <div class="papel">Contratado · Prestador</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:4px">Aceite automático ao enviar proposta</div>
    </div>
  </div>

  <div class="rodape">
    Contrato gerado automaticamente pela plataforma AgroCore · ${APP_URL}<br>
    ID do Serviço: ${d.serviceId} · Documento com validade jurídica conforme legislação brasileira vigente
  </div>
</body>
</html>`
}

export async function salvarContrato(serviceId: string, html: string): Promise<string | null> {
  try {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Salva o HTML do contrato no Storage
    await adminClient.storage.createBucket('contratos', { public: false }).catch(() => {})

    const path = `${serviceId}.html`
    const encoder = new TextEncoder()
    const { error } = await adminClient.storage
      .from('contratos')
      .upload(path, encoder.encode(html), {
        contentType: 'text/html',
        upsert: true,
      })

    if (error) {
      console.error('Erro ao salvar contrato:', error)
      return null
    }

    // Retorna URL assinada com validade de 10 anos
    const { data } = await adminClient.storage
      .from('contratos')
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10)

    return data?.signedUrl ?? null
  } catch (e) {
    console.error('Erro salvarContrato:', e)
    return null
  }
}
