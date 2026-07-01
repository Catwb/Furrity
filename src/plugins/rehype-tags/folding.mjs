import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.colorful.folding {
  margin: 1em 0;
  border-radius: 0.5rem;
  border: 1px solid var(--block-border, oklch(0.85 0.02 var(--hue)));
  background: var(--block-bg, oklch(0.97 0.005 var(--hue)));
  overflow: hidden;
}
.tag-plugin.colorful.folding > summary {
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 500;
  background: var(--block-bg, oklch(0.95 0.01 var(--hue)));
}
.tag-plugin.colorful.folding > summary::-webkit-details-marker {
  color: var(--primary, oklch(0.5 0.15 var(--hue)));
}
.tag-plugin.colorful.folding > .body {
  padding: 0.75rem 1rem;
}
.tag-plugin.colorful.folding[color="red"] { --block-bg: oklch(0.93 0.04 20); --block-border: oklch(0.85 0.06 20); }
.tag-plugin.colorful.folding[color="yellow"] { --block-bg: oklch(0.95 0.04 80); --block-border: oklch(0.88 0.06 80); }
.tag-plugin.colorful.folding[color="green"] { --block-bg: oklch(0.93 0.04 140); --block-border: oklch(0.85 0.06 140); }
.tag-plugin.colorful.folding[color="blue"] { --block-bg: oklch(0.93 0.04 240); --block-border: oklch(0.85 0.06 240); }
.tag-plugin.colorful.folding[color="purple"] { --block-bg: oklch(0.93 0.04 290); --block-border: oklch(0.85 0.06 290); }`

export function FoldingComponent(properties, children) {
  const nodes = []
  if (shouldInject("folding")) {
    nodes.push(h("style", { "data-tag-plugin": "folding" }, STYLE))
  }

  const attrs = { class: "tag-plugin colorful folding" }
  if (properties.color) attrs.color = properties.color
  if (properties.open === "true") attrs.open = ""

  const inner = []
  if (properties.title) {
    inner.push(h("summary", properties.title))
  }
  if (children && children.length > 0) {
    inner.push(h("div", { class: "body" }, children))
  }

  nodes.push(h("details", attrs, inner))
  return nodes.length === 1 ? nodes[0] : nodes
}
