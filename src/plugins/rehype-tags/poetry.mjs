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
  background: var(--block);
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
  background: var(--accent);
}
.tag-plugin.poetry .content > .meta {
  color: var(--text-p2);
  font-size: 0.875rem;
  font-weight: 500;
}
.tag-plugin.poetry .content > .meta span + span {
  margin-left: 4px;
}
.tag-plugin.poetry .content > .body {
  margin: 0.75rem 0;
  border-top: 1px dashed var(--block-border);
  border-bottom: 1px dashed var(--block-border);
  line-height: 2;
  width: 100%;
}
.tag-plugin.poetry .content > .footer {
  font-style: italic;
  color: var(--text-p4);
  margin: 0.75rem 0;
  font-size: 0.875rem;
}`

export function PoetryComponent(properties, children) {
  const nodes = []
  if (shouldInject("poetry")) {
    nodes.push(h("style", { "data-tag-plugin": "poetry" }, STYLE))
  }

  const inner = []
  if (properties.title) {
    inner.push(h("div", { class: "title" }, [h("strong", properties.title)]))
  }

  const metaParts = []
  if (properties.author) metaParts.push(h("span", properties.author))
  if (properties.date) metaParts.push(h("span", properties.date))
  if (metaParts.length > 0) inner.push(h("div", { class: "meta" }, metaParts))

  if (children && children.length > 0) {
    inner.push(h("div", { class: "body" }, children))
  }

  if (properties.footer) {
    inner.push(h("div", { class: "footer" }, properties.footer))
  }

  nodes.push(h("div", { class: "tag-plugin poetry" }, [
    h("div", { class: "content" }, inner),
  ]))
  return nodes.length === 1 ? nodes[0] : nodes
}
