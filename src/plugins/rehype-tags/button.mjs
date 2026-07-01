import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.colorful.button {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.4em 1em;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
  background: var(--btn-bg, oklch(0.9 0.02 var(--hue)));
  color: inherit;
}
.tag-plugin.colorful.button:hover { background: var(--btn-bg-hover, oklch(0.85 0.03 var(--hue))); }
.tag-plugin.colorful.button[size="xs"] { font-size: 0.75rem; padding: 0.2em 0.6em; }
.tag-plugin.colorful.button[size="sm"] { font-size: 0.875rem; }
.tag-plugin.colorful.button[size="lg"] { font-size: 1.125rem; padding: 0.5em 1.25em; }
.tag-plugin.colorful.button[color="red"] { --btn-bg: oklch(0.9 0.06 20); --btn-bg-hover: oklch(0.85 0.08 20); }
.tag-plugin.colorful.button[color="green"] { --btn-bg: oklch(0.9 0.06 140); --btn-bg-hover: oklch(0.85 0.08 140); }
.tag-plugin.colorful.button[color="blue"] { --btn-bg: oklch(0.9 0.06 240); --btn-bg-hover: oklch(0.85 0.08 240); }
.tag-plugin.colorful.button[color="yellow"] { --btn-bg: oklch(0.92 0.06 80); --btn-bg-hover: oklch(0.88 0.08 80); }
.tag-plugin.colorful.button[color="purple"] { --btn-bg: oklch(0.9 0.06 290); --btn-bg-hover: oklch(0.85 0.08 290); }`

export function ButtonComponent(properties, children) {
  const nodes = []
  if (shouldInject("button")) {
    nodes.push(h("style", { "data-tag-plugin": "button" }, STYLE))
  }

  const attrs = { class: "tag-plugin colorful button" }
  if (properties.color) attrs.color = properties.color
  if (properties.size) attrs.size = properties.size

  const text = properties.text || ""
  const url = properties.url || ""

  if (url) attrs.href = url
  attrs.title = text

  const inner = []
  if (children && children.length > 0) {
    inner.push(...children)
  } else if (text) {
    inner.push(h("span", text))
  }

  nodes.push(h("a", attrs, inner))
  return nodes.length === 1 ? nodes[0] : nodes
}
