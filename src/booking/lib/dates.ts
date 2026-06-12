export function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function normalizeTimeStr(val: unknown): string {
  if (val === undefined || val === null || val === '') return ''
  const p = String(val).split(':')
  let h = parseInt(p[0], 10)
  const m = parseInt(p[1], 10) || 0
  if (isNaN(h)) h = 0
  return pad2(h) + ':' + pad2(m)
}

export function toISODate(d: Date) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
}

export function todayISODate() {
  return toISODate(new Date())
}

export function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function digitsOnly(str: string) {
  return str.replace(/\D/g, '')
}

export function timeToMinutes(t: string) {
  const n = normalizeTimeStr(t)
  if (!n) return NaN
  const p = n.split(':')
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10)
}
