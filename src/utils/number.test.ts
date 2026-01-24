import { test, expect } from 'vitest'
import { formatNumberBR, parseBRInput } from './number'

test('formatNumberBR handles undefined/null and numbers', () => {
  expect(formatNumberBR(undefined)).toBe('')
  expect(formatNumberBR(null)).toBe('')
  expect(formatNumberBR(0)).toBe('0,00')
  expect(formatNumberBR(1234.56)).toBe('1.234,56')
  // non-number input coerced to number (call via any)
  // @ts-ignore
  expect(formatNumberBR('1234.56')).toBe('1.234,56')
})

test('parseBRInput covers comma, dot, integer and cleaned inputs', () => {
  expect(parseBRInput('')).toBeUndefined()
  expect(parseBRInput('1.234,56')).toBeCloseTo(1234.56)
  expect(parseBRInput('1.234.567,89')).toBeCloseTo(1234567.89)
  expect(parseBRInput('1234.56')).toBeCloseTo(1234.56)
  expect(parseBRInput('1234')).toBe(1234)
  expect(parseBRInput('R$ 1.234,56')).toBeCloseTo(1234.56)
  // malformed numeric sequences should return undefined
  expect(parseBRInput('1,2,3')).toBeUndefined()
  expect(parseBRInput('abc')).toBeUndefined()
})
import { describe, it, expect } from 'vitest'
import { formatNumberBR, parseBRInput } from './number'

describe('formatNumberBR', () => {
  it('formats numbers to pt-BR with two decimals', () => {
    expect(formatNumberBR(1234.5)).toBe('1.234,50')
    expect(formatNumberBR(0)).toBe('0,00')
  })

  it('returns empty string for null/undefined', () => {
    expect(formatNumberBR(undefined)).toBe('')
    expect(formatNumberBR(null)).toBe('')
  })
})

describe('parseBRInput', () => {
  it('parses pt-BR formatted inputs', () => {
    expect(parseBRInput('1.234,56')).toBeCloseTo(1234.56)
    expect(parseBRInput('1234.56')).toBeCloseTo(1234.56)
    expect(parseBRInput('1,5')).toBeCloseTo(1.5)
  })

  it('returns undefined for empty or invalid input', () => {
    expect(parseBRInput('')).toBeUndefined()
    expect(parseBRInput('abc')).toBeUndefined()
  })
})
