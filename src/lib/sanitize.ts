/** Remove tags HTML e limita tamanho de strings */
export function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')           // remove HTML tags
    .replace(/[<>'"]/g, '')            // remove caracteres perigosos
    .trim()
    .slice(0, maxLength)
}

/** Valida se é um número positivo */
export function sanitizePositiveNumber(value: unknown): number | null {
  const n = Number(value)
  if (!isFinite(n) || n <= 0) return null
  return n
}

/** Valida e normaliza telefone BR */
export function sanitizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const digits = value.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) return null
  return digits
}
