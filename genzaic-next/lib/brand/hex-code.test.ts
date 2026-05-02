import { describe, it, expect } from 'vitest'
import { generateHexCode, isValidHexCode, BLOCKED_HEX_CODES } from './hex-code'

describe('generateHexCode', () => {
  it('returns a 4-character uppercase hex string', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateHexCode()
      expect(code).toMatch(/^[0-9A-F]{4}$/)
    }
  })

  it('skips blocked codes', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 5000; i++) seen.add(generateHexCode())
    for (const blocked of BLOCKED_HEX_CODES) {
      expect(seen.has(blocked)).toBe(false)
    }
  })
})

describe('isValidHexCode', () => {
  it('accepts well-formed 4-char hex', () => {
    expect(isValidHexCode('A4F2')).toBe(true)
    expect(isValidHexCode('0001')).toBe(true)
  })

  it('rejects malformed', () => {
    expect(isValidHexCode('a4f2')).toBe(false)
    expect(isValidHexCode('A4F')).toBe(false)
    expect(isValidHexCode('A4F22')).toBe(false)
    expect(isValidHexCode('GHIJ')).toBe(false)
  })

  it('rejects blocked codes', () => {
    expect(isValidHexCode('0000')).toBe(false)
    expect(isValidHexCode('FFFF')).toBe(false)
    expect(isValidHexCode('AAAA')).toBe(false)
    expect(isValidHexCode('DEAD')).toBe(false)
    expect(isValidHexCode('CAB0')).toBe(false)
    expect(isValidHexCode('1BAD')).toBe(false)
  })
})
