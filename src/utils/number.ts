export function formatNumberBR(value?: number | null): string {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'number') value = Number(value) || 0
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function parseBRInput(input: string): number | undefined {
  if (!input) return undefined
  // remove any non digits, dots or commas
  const cleaned = input.replace(/[^0-9,\.]+/g, '')

  // If the input contains a comma, assume comma is the decimal separator
  // and dots are thousand separators: "1.234,56" -> "1234.56"
  if (cleaned.includes(',')) {
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')
    const n = Number(normalized)
    return Number.isFinite(n) ? n : undefined
  }

  // If there is no comma but there is a dot, assume dot is decimal separator
  // e.g. "1234.56" -> 1234.56
  if (cleaned.includes('.')) {
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : undefined
  }

  // If it's only digits, parse as integer
  if (/^[0-9]+$/.test(cleaned)) return Number(cleaned)

  return undefined
}
