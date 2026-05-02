const HEX_CHARS = '0123456789ABCDEF'
const BLOCKED_SUBSTRINGS = ['BAD', 'CAB', 'DEAD']

function buildBlocklist(): Set<string> {
  const blocked = new Set<string>()
  for (const c of HEX_CHARS) blocked.add(c.repeat(4))
  for (let n = 0; n < 0x10000; n++) {
    const code = n.toString(16).toUpperCase().padStart(4, '0')
    for (const sub of BLOCKED_SUBSTRINGS) {
      if (code.includes(sub)) {
        blocked.add(code)
        break
      }
    }
  }
  return blocked
}

export const BLOCKED_HEX_CODES = buildBlocklist()

export function generateHexCode(): string {
  for (let attempt = 0; attempt < 32; attempt++) {
    let out = ''
    for (let i = 0; i < 4; i++) {
      out += HEX_CHARS[Math.floor(Math.random() * 16)]
    }
    if (!BLOCKED_HEX_CODES.has(out)) return out
  }
  throw new Error('hex-code generator failed to find unblocked code in 32 tries')
}

export function isValidHexCode(code: string): boolean {
  if (!/^[0-9A-F]{4}$/.test(code)) return false
  if (BLOCKED_HEX_CODES.has(code)) return false
  return true
}
