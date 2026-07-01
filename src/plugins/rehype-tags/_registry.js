let injected = new Set()

export function resetRegistry() {
  injected = new Set()
}

export function shouldInject(name) {
  if (injected.has(name)) return false
  injected.add(name)
  return true
}
