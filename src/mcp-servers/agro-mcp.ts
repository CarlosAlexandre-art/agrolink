/**
 * AgroCore MCP Server — Model Context Protocol para o ecossistema OryonAG
 *
 * Expõe ferramentas de consulta agrícola para LLMs via MCP.
 * Para usar com Claude Code: configurar em .mcp.json do projeto.
 *
 * Referência: https://modelcontextprotocol.io/
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  { name: 'agrocore-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

// ─── Ferramentas disponíveis ──────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'buscar_clima_agro',
      description: 'Busca clima atual e previsão para localização agrícola. Retorna temperatura, chuva esperada, umidade e recomendações para atividades de campo.',
      inputSchema: {
        type: 'object',
        properties: {
          localizacao: { type: 'string', description: 'Cidade/município ou coordenadas "lat,lon"' },
          dias: { type: 'number', description: 'Dias de previsão (1-7)', default: 3 },
        },
        required: ['localizacao'],
      },
    },
    {
      name: 'consultar_preco_commodity',
      description: 'Retorna preços de referência de commodities agrícolas brasileiras (soja, milho, boi gordo, algodão, café).',
      inputSchema: {
        type: 'object',
        properties: {
          commodity: {
            type: 'string',
            enum: ['soja', 'milho', 'boi_gordo', 'algodao', 'cafe', 'todos'],
            description: 'Commodity a consultar',
          },
          unidade: {
            type: 'string',
            enum: ['saca', 'kg', 'arroba'],
            description: 'Unidade de medida',
            default: 'saca',
          },
        },
        required: ['commodity'],
      },
    },
    {
      name: 'buscar_linha_credito_rural',
      description: 'Busca linhas de crédito rural disponíveis com base no score e perfil do produtor.',
      inputSchema: {
        type: 'object',
        properties: {
          score: { type: 'number', description: 'AgroRate Score (0-1000)' },
          finalidade: {
            type: 'string',
            enum: ['custeio', 'investimento', 'comercializacao', 'industrializacao'],
            description: 'Finalidade do crédito',
          },
          valor: { type: 'number', description: 'Valor desejado em R$' },
        },
        required: ['score', 'finalidade'],
      },
    },
    {
      name: 'consultar_agrofit',
      description: 'Consulta defensivos agrícolas registrados no MAPA via AGROFIT para uma determinada cultura e praga.',
      inputSchema: {
        type: 'object',
        properties: {
          cultura: { type: 'string', description: 'Cultura agrícola (ex: soja, milho, cana-de-açúcar)' },
          praga: { type: 'string', description: 'Praga, doença ou planta daninha a controlar' },
          ingredienteAtivo: { type: 'string', description: 'Ingrediente ativo preferencial (opcional)' },
        },
        required: ['cultura', 'praga'],
      },
    },
    {
      name: 'calcular_ndvi_estimado',
      description: 'Estima índice de vegetação (NDVI proxy) para uma localização com base em dados NASA POWER.',
      inputSchema: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: 'Latitude' },
          lon: { type: 'number', description: 'Longitude' },
          diasRetro: { type: 'number', description: 'Dias retrospectivos para calcular (7-90)', default: 30 },
        },
        required: ['lat', 'lon'],
      },
    },
    {
      name: 'buscar_calendario_safra',
      description: 'Retorna o calendário agrícola brasileiro para uma cultura e região.',
      inputSchema: {
        type: 'object',
        properties: {
          cultura: { type: 'string', description: 'Cultura (soja, milho, algodão, café, etc.)' },
          regiao: {
            type: 'string',
            enum: ['norte', 'nordeste', 'centro_oeste', 'sudeste', 'sul'],
            description: 'Região do Brasil',
          },
        },
        required: ['cultura', 'regiao'],
      },
    },
  ],
}))

// ─── Implementação das ferramentas ────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'buscar_clima_agro': {
      const { localizacao, dias = 3 } = args as { localizacao: string; dias?: number }
      try {
        const key = process.env.OPENWEATHER_API_KEY
        if (!key) return { content: [{ type: 'text', text: 'OPENWEATHER_API_KEY não configurada' }] }

        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(localizacao)},BR&limit=1&appid=${key}`
        )
        const geo = await geoRes.json()
        if (!geo[0]) return { content: [{ type: 'text', text: `Localização não encontrada: ${localizacao}` }] }

        const { lat, lon } = geo[0]
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=pt_br&cnt=${dias * 8}`
        )
        const weather = await weatherRes.json()

        const resumo = (weather.list ?? []).slice(0, dias * 2).map((item: any) => ({
          hora: item.dt_txt,
          temp: `${Math.round(item.main.temp)}°C`,
          chuva: item.pop > 0.3 ? `${Math.round(item.pop * 100)}% chance` : 'sem chuva',
          descricao: item.weather?.[0]?.description,
        }))

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ localizacao, coordenadas: { lat, lon }, previsao: resumo }, null, 2),
          }],
        }
      } catch (e: any) {
        return { content: [{ type: 'text', text: `Erro: ${e.message}` }] }
      }
    }

    case 'consultar_preco_commodity': {
      const { commodity } = args as { commodity: string }
      // Preços de referência — em produção, integrar com CEPEA/Esalq ou B3
      const precos: Record<string, { preco: string; unidade: string; fonte: string; data: string }> = {
        soja:      { preco: 'R$ 128-138/sc', unidade: 'saca 60kg', fonte: 'CEPEA/Esalq referência', data: new Date().toLocaleDateString('pt-BR') },
        milho:     { preco: 'R$ 68-75/sc',   unidade: 'saca 60kg', fonte: 'CEPEA/Esalq referência', data: new Date().toLocaleDateString('pt-BR') },
        boi_gordo: { preco: 'R$ 295-320/@',  unidade: 'arroba',    fonte: 'CEPEA/Esalq referência', data: new Date().toLocaleDateString('pt-BR') },
        algodao:   { preco: 'R$ 98-108/@',   unidade: 'arroba',    fonte: 'CEPEA/Esalq referência', data: new Date().toLocaleDateString('pt-BR') },
        cafe:      { preco: 'R$ 1.850-2.100/sc', unidade: 'saca 60kg', fonte: 'CEPEA/Esalq referência', data: new Date().toLocaleDateString('pt-BR') },
      }

      const resultado = commodity === 'todos'
        ? precos
        : precos[commodity] ? { [commodity]: precos[commodity] } : { erro: 'Commodity não encontrada' }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ commodity, precos: resultado, aviso: 'Preços de referência — consulte CEPEA/B3 para cotação em tempo real' }, null, 2),
        }],
      }
    }

    case 'buscar_linha_credito_rural': {
      const { score, finalidade, valor } = args as { score: number; finalidade: string; valor?: number }

      const linhas = []
      if (score >= 600 && finalidade === 'custeio') {
        linhas.push({ linha: 'PRONAF Custeio', taxa: '5-6% a.a.', teto: 'R$ 250.000', requisito: 'DAP ativa' })
        linhas.push({ linha: 'FCO Rural Custeio', taxa: '7-9% a.a.', teto: 'R$ 500.000', requisito: 'imóvel rural regular' })
      }
      if (score >= 700 && finalidade === 'investimento') {
        linhas.push({ linha: 'Moderfrota', taxa: '7% a.a.', teto: 'R$ 5.000.000', requisito: 'CAFIR + aval bancário' })
        linhas.push({ linha: 'Pronamp Investimento', taxa: '7.5% a.a.', teto: 'R$ 430.000', requisito: 'receita bruta até R$ 2M/ano' })
      }
      if (score >= 450) {
        linhas.push({ linha: 'CPR Física', taxa: '0% (amortização em produto)', teto: 'variável', requisito: 'produção comprometida em garantia' })
      }
      if (score >= 750) {
        linhas.push({ linha: 'BB Crédito Rural Premium', taxa: '8-10% a.a.', teto: 'R$ 3.000.000', requisito: 'relacionamento bancário' })
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ score, finalidade, valorDesejado: valor, linhasElegiveis: linhas }, null, 2),
        }],
      }
    }

    case 'calcular_ndvi_estimado': {
      const { lat, lon, diasRetro = 30 } = args as { lat: number; lon: number; diasRetro?: number }
      try {
        const hoje = new Date()
        const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - diasRetro)
        const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '')
        const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=AG&longitude=${lon}&latitude=${lat}&start=${fmt(inicio)}&end=${fmt(hoje)}&format=JSON`
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
        if (!res.ok) return { content: [{ type: 'text', text: 'NASA POWER indisponível' }] }
        const data = await res.json()
        const chuvas = data?.properties?.parameter?.PRECTOTCORR ?? {}
        const totalChuva = Object.values(chuvas).reduce((s: number, v) => s + (Number(v) > 0 ? Number(v) : 0), 0)
        const ndviEstimado = Math.min(0.85, Math.max(0.15, 0.3 + (totalChuva / diasRetro / 5) * 0.5))
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              lat, lon,
              periodo: `${diasRetro} dias`,
              chuvaAcumuladaMm: Math.round(totalChuva * 10) / 10,
              ndviEstimado: Math.round(ndviEstimado * 100) / 100,
              classificacao: ndviEstimado >= 0.6 ? 'vegetação saudável' : ndviEstimado >= 0.4 ? 'estresse leve' : 'estresse severo',
              nota: 'NDVI estimado via proxy pluviométrico NASA POWER',
            }, null, 2),
          }],
        }
      } catch (e: any) {
        return { content: [{ type: 'text', text: `Erro: ${e.message}` }] }
      }
    }

    case 'buscar_calendario_safra': {
      const { cultura, regiao } = args as { cultura: string; regiao: string }
      const calendarios: Record<string, Record<string, { plantio: string; colheita: string; obs: string }>> = {
        soja: {
          centro_oeste: { plantio: 'Out-Dez', colheita: 'Jan-Mar', obs: '1ª safra — principal região produtora BR' },
          sul:          { plantio: 'Nov-Dez', colheita: 'Fev-Abr', obs: '1ª safra' },
          sudeste:      { plantio: 'Out-Nov', colheita: 'Jan-Mar', obs: '1ª safra — MG/SP' },
          nordeste:     { plantio: 'Nov-Jan', colheita: 'Mar-Mai', obs: 'MATOPIBA — expansão recente' },
          norte:        { plantio: 'Out-Nov', colheita: 'Jan-Mar', obs: 'PA/RO — crescimento acelerado' },
        },
        milho: {
          centro_oeste: { plantio: '1ª: Out-Nov | 2ª: Jan-Feb', colheita: '1ª: Mar-Abr | 2ª: Jun-Ago', obs: 'Safrinha dominante na região' },
          sul:          { plantio: 'Set-Nov',  colheita: 'Fev-Abr', obs: '1ª safra' },
          sudeste:      { plantio: 'Out-Nov',  colheita: 'Mar-Mai', obs: '1ª safra' },
          nordeste:     { plantio: 'Abr-Jun',  colheita: 'Ago-Out', obs: 'Sequeiro e irrigado' },
          norte:        { plantio: 'Nov-Dez',  colheita: 'Mar-Mai', obs: '1ª safra' },
        },
      }

      const resultado = calendarios[cultura]?.[regiao]
      if (!resultado) return { content: [{ type: 'text', text: `Calendário não disponível para ${cultura}/${regiao}` }] }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ cultura, regiao, calendario: resultado }, null, 2),
        }],
      }
    }

    case 'consultar_agrofit': {
      const { cultura, praga } = args as { cultura: string; praga: string }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            instrucao: `Consulte o AGROFIT em: https://agrofit.agricultura.gov.br/agrofit_cons/principal_agrofit_cons`,
            parametros: { cultura, praga },
            apiAlternativa: '/api/ai/agrofit (rota disponível no AgroCore)',
            nota: 'A API AGROFIT do MAPA requer autenticação. Use a rota interna do AgroCore para consultas integradas.',
          }, null, 2),
        }],
      }
    }

    default:
      return { content: [{ type: 'text', text: `Ferramenta desconhecida: ${name}` }], isError: true }
  }
})

// ─── Inicialização ────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('AgroCore MCP Server iniciado')
}

main().catch(console.error)
