import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.poetry {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
}
.tag-plugin.poetry .content {
  padding-left: 1rem;
  position: relative;
  width: 100%;
}
.tag-plugin.poetry .content::before {
  content: '';
  position: absolute;
  width: 4px;
  left: -4px;
  top: 4px;
  bottom: 4px;
  border-radius: 4px;
  background: var(--primary);
}
.tag-plugin.poetry .content > .title {
  font-weight: 500;
  margin-top: 0.75rem;
  position: relative;
}
.tag-plugin.poetry .content > .title::before {
  content: '';
  position: absolute;
  width: 4px;
  left: calc(-1rem - 4px);
  top: 6px;
  bottom: 6px;
  border-radius: 4px;
  background: var(--primary);
}
.tag-plugin.poetry .content > .meta {
  color: oklch(0.55 0.02 var(--hue));
  font-size: 0.875rem;
  font-weight: 500;
}
.tag-plugin.poetry .content > .meta span + span {
  margin-left: 4px;
}
.tag-plugin.poetry .content > .body {
  margin: 0.75rem 0;
  border-top: 1px dashed oklch(0.85 0.02 var(--hue));
  border-bottom: 1px dashed oklch(0.85 0.02 var(--hue));
  line-height: 2;
  width: 100%;
}
.tag-plugin.poetry .content > .body p {
  margin: 0;
}
.tag-plugin.poetry .content > .footer {
  font-style: italic;
  color: oklch(0.6 0.01 var(--hue));
  margin: 0.75rem 0;
  font-size: 0.875rem;
}`

function extractText(nodes) {
  let text = ""
  function walk(arr) {
    for (const n of arr) {
      if (!n) continue
      if (n.type === "text") text += n.value
      if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  return text
}

function buildPoetry(node) {
  const props = node.properties || {}
  const children = (node.children || []).filter(Boolean)
  const inner = []

  if (props.title) {
    inner.push(h("div", { class: "title" }, [h("strong", props.title)]))
  }

  const metaParts = []
  if (props.author) metaParts.push(h("span", props.author))
  if (props.date) metaParts.push(h("span", props.date))
  if (metaParts.length > 0) inner.push(h("div", { class: "meta" }, metaParts))

  if (children.length > 0) {
    const text = extractText(children).trim()
    if (text) {
      const lines = text.split(/(?<=[。？！；])\s+/).filter(Boolean)
      const bodyChildren = lines.length > 1
        ? lines.map(line => h("p", {}, [line.trim()]))
        : children
      inner.push(h("div", { class: "body" }, bodyChildren))
    } else {
      inner.push(h("div", { class: "body" }, children))
    }
  }

  if (props.footer) {
    inner.push(h("div", { class: "footer" }, props.footer))
  }

  const nodes = []
  if (shouldInject("poetry")) {
    nodes.push(h("style", { "data-tag-plugin": "poetry" }, STYLE))
  }
  nodes.push(h("div", { class: "tag-plugin poetry" }, [
    h("div", { class: "content" }, inner),
  ]))
  return nodes
}

function walk(node, fn, parent, index) {
  if (!node) return
  fn(node, parent, index)
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      walk(node.children[i], fn, node, i)
    }
  }
}

export function rehypePoetryComponent() {
  return (tree) => {
    if (!tree) return
    walk(tree, (node, parent, index) => {
      if (index == null || !parent) return
      if (node.type !== "element" || node.tagName !== "poetry") return
      const replacement = buildPoetry(node)
      parent.children.splice(index, 1, ...replacement)
    })
  }
}
