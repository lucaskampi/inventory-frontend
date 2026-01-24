export function formatNumberBR(value?: number | null): string {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'number') value = Number(value) || 0
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function parseBRInput(input: string): number | undefined {
  if (!input) return undefined
  // remove any non digits, dots or commas
  const cleaned = input.replace(/[^0-9,\.]+/g, '')
  // remove thousand separators (.) and transform comma to dot
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : undefined
}
