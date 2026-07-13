import { h } from "hastscript"
import { shouldInject } from "./_registry.js"
import { parseTitleProps } from "./_parse-title.mjs"

const STYLE = `.tag-plugin.colorful.box {
  position: relative;
  margin: 1em 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--block-bg, oklch(0.95 0.01 var(--hue)));
}
.tag-plugin.colorful.box > .title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.tag-plugin.colorful.box[color="red"] { --block-bg: oklch(0.93 0.04 20); }
.tag-plugin.colorful.box[color="orange"] { --block-bg: oklch(0.93 0.04 50); }
.tag-plugin.colorful.box[color="yellow"] { --block-bg: oklch(0.95 0.04 80); }
.tag-plugin.colorful.box[color="green"] { --block-bg: oklch(0.93 0.04 140); }
.tag-plugin.colorful.box[color="cyan"] { --block-bg: oklch(0.93 0.04 190); }
.tag-plugin.colorful.box[color="blue"] { --block-bg: oklch(0.93 0.04 240); }
.tag-plugin.colorful.box[color="purple"] { --block-bg: oklch(0.93 0.04 290); }`

export function BoxComponent(properties, children) {
  const nodes = []
  if (shouldInject("box")) {
    nodes.push(h("style", { "data-tag-plugin": "box" }, STYLE))
  }

  const props = parseTitleProps(properties || {})
  const attrs = { class: "tag-plugin colorful box" }
  if (props.color) attrs.color = props.color

  const inner = []
  if (props.title) {
    inner.push(h("div", { class: "title" }, [h("strong", props.title)]))
  }
  if (children && children.length > 0) {
    inner.push(h("div", { class: "body" }, children))
  }

  nodes.push(h("div", attrs, inner))
  return nodes.length === 1 ? nodes[0] : nodes
}
