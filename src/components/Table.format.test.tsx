import { test, expect } from 'vitest'
import { formatPrice } from './Table'

test('formatPrice returns dash for null/undefined', () => {
  expect(formatPrice(undefined)).toBe('—')
  expect(formatPrice(null)).toBe('—')
})

test('formatPrice formats numbers and numeric strings', () => {
  expect(formatPrice(1234.56)).toBe('1.234,56')
  expect(formatPrice('9.5' as any)).toBe('9,50')
})

test('formatPrice returns dash for non-numeric strings', () => {
  expect(formatPrice('abc' as any)).toBe('—')
})
