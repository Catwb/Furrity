import { h } from "hastscript"

export function MetingComponent(properties, children) {
  const attrs = {}
  const allowed = ["server", "type", "id", "api", "fixed", "autoplay",
    "volume", "theme", "loop", "order", "list-max-height", "list-folded",
    "preload", "mutex", "mini", "storage-name"]
  for (const key of allowed) {
    if (properties[key] !== undefined) {
      attrs[key] = String(properties[key])
    }
  }
  if (children && children.length > 0) {
    attrs["has-content"] = "true"
  }
  return h("meting-js", attrs, children || [])
}
