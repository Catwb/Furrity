import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.colorful.note {
  position: relative;
  margin: 1em 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--block-bg, oklch(0.95 0.01 var(--hue)));
}
.tag-plugin.colorful.note > .title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.tag-plugin.colorful.note[color="red"] { --block-bg: oklch(0.93 0.04 20); }
.tag-plugin.colorful.note[color="orange"] { --block-bg: oklch(0.93 0.04 50); }
.tag-plugin.colorful.note[color="yellow"] { --block-bg: oklch(0.95 0.04 80); }
.tag-plugin.colorful.note[color="green"] { --block-bg: oklch(0.93 0.04 140); }
.tag-plugin.colorful.note[color="cyan"] { --block-bg: oklch(0.93 0.04 190); }
.tag-plugin.colorful.note[color="blue"] { --block-bg: oklch(0.93 0.04 240); }
.tag-plugin.colorful.note[color="purple"] { --block-bg: oklch(0.93 0.04 290); }`

export function NoteComponent(properties, children) {
  const nodes = []
  if (shouldInject("note")) {
    nodes.push(h("style", { "data-tag-plugin": "note" }, STYLE))
  }

  const attrs = { class: "tag-plugin colorful note" }
  if (properties.color) attrs.color = properties.color

  const inner = []
  if (properties.title) {
    inner.push(h("div", { class: "title" }, properties.title))
  }
  if (children && children.length > 0) {
    inner.push(h("div", { class: "body" }, children))
  }

  nodes.push(h("div", attrs, inner))
  return nodes.length === 1 ? nodes[0] : nodes
}
