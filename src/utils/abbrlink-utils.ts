function crc16(str: string): number {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i)
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xa001 : 0)
    }
  }
  return (crc ^ 0xffff) & 0xffff
}

function crc32(str: string): number {
  let crc = 0xffffffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i)
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

export type AbbrlinkAlg = "crc16" | "crc32"
export type AbbrlinkRep = "dec" | "hex"

export function computeAbbrlink(
  title: string,
  date: Date,
  alg: AbbrlinkAlg = "crc16",
  rep: AbbrlinkRep = "dec"
): string {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const raw = title + dateStr
  const hash = alg === "crc32" ? crc32(raw) : crc16(raw)
  return rep === "hex" ? hash.toString(16) : hash.toString(10)
}
