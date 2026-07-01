import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.paper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.tag-plugin.paper > .content {
  border-left: 1px dashed var(--text-meta);
  border-right: 1px dashed var(--text-meta);
  border-bottom: 1px dashed var(--text-meta);
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  padding: 1rem;
  max-width: 95%;
  width: 100%;
  position: relative;
}
.tag-plugin.paper > .content::before {
  content: '';
  position: absolute;
  height: 4px;
  left: -16px;
  top: -4px;
  right: -16px;
  border-radius: 4px;
  background: var(--block);
}
.tag-plugin.paper > .content > .title {
  font-weight: 500;
  text-align: center;
  position: relative;
}
.tag-plugin.paper > .content > .title::before {
  content: '';
  position: absolute;
  height: 4px;
  left: calc(-1rem - 6px);
  top: calc(-1rem - 4px);
  right: calc(100% + 1rem - 6px);
  border-radius: 4px;
  background: var(--accent);
}
.tag-plugin.paper > .content > .title::after {
  content: '';
  position: absolute;
  height: 4px;
  right: calc(-1rem - 6px);
  top: calc(-1rem - 4px);
  left: calc(100% + 1rem - 6px);
  border-radius: 4px;
  background: var(--accent);
}
.tag-plugin.paper > .content > .body > .paragraph {
  text-indent: 2em;
}
.tag-plugin.paper > .content > .body > .section > .section-title {
  text-align: center;
}
.tag-plugin.paper > .content > .body > .section > .section-content {
  text-indent: 2em;
}
.tag-plugin.paper > .content > .body .tag-plugin {
  margin: 0;
}
.tag-plugin.paper > .content > .footer {
  color: var(--text-p4);
  font-size: 0.75rem;
  text-align: right;
}
.tag-plugin.paper > .content > .footer > .author-date {
  text-align: right;
}
.tag-plugin.paper > .content > .footer > .author-date > span {
  color: var(--text-p2);
  font-size: 0.75rem;
  font-weight: 500;
}
.tag-plugin.paper > .content > .footer > .author-date > .author {
  margin-right: 0.375rem;
}
.tag-plugin.paper > .content.underline > .title,
.tag-plugin.paper > .content.underline > .meta,
.tag-plugin.paper > .content.underline > .author-date,
.tag-plugin.paper > .content.underline > .footer,
.tag-plugin.paper > .content.underline > .body {
  background: linear-gradient(transparent 1.5rem, var(--text-meta) 1px);
  background-size: 100% calc(1.5rem + 1px);
  line-height: calc(1.5rem + 1px);
  padding: 0 3px;
}
.tag-plugin.paper > .content.underline p {
  margin: 0;
}
.tag-plugin.paper > .content.underline > .title {
  border-top: 1px solid var(--text-meta);
}`

function extractText(node) {
  if (!node) return ""
  if (node.type === "text") return node.value || ""
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractText).join("")
  }
  return ""
}

function groupBySections(children) {
  const sections = []
  let current = { type: "paragraph", title: "", content: [] }

  function flush() {
    if (current.content.length === 0) return
    let el
    if (current.type === "section" && current.title) {
      el = h("div", { class: "section" }, [
        h("div", { class: "section-title" }, current.title),
        h("div", { class: "section-content" }, current.content),
      ])
    } else {
      el = h("div", { class: current.type }, current.content)
    }
    sections.push(el)
  }

  for (const child of children) {
    if (child.type === "element" && child.tagName === "hr") {
      flush()
      current = { type: "paragraph", title: "", content: [] }
      continue
    }
    if (child.type === "element" && /^h[1-6]$/.test(child.tagName)) {
      flush()
      current = { type: "section", title: extractText(child), content: [] }
      continue
    }
    if (child.type === "raw" || child.type === "comment") {
      continue
    }
    current.content.push(child)
  }
  flush()
  return sections
}

function buildPaper(node) {
  const props = node.properties || {}
  const children = (node.children || []).filter(Boolean)
  const sections = groupBySections(children)
  const inner = []

  if (props.title) {
    inner.push(h("div", { class: "title" }, [h("strong", props.title)]))
  }

  if (sections.length > 0) {
    inner.push(h("div", { class: "body" }, sections))
  }

  const footerParts = []
  const authorDateParts = []
  if (props.author) {
    authorDateParts.push(h("span", { class: "author" }, props.author))
  }
  if (props.date) {
    authorDateParts.push(h("span", { class: "date" }, props.date))
  }
  if (authorDateParts.length > 0) {
    footerParts.push(h("div", { class: "author-date" }, authorDateParts))
  }
  if (props.footer) {
    footerParts.push(props.footer)
  }
  if (footerParts.length > 0) {
    inner.push(h("div", { class: "footer" }, footerParts))
  }

  const nodes = []
  if (shouldInject("paper")) {
    nodes.push(h("style", { "data-tag-plugin": "paper" }, STYLE))
  }

  const contentClass = props.style === "underline" ? "content underline" : "content"
  nodes.push(h("div", { class: "tag-plugin paper" }, [
    h("div", { class: contentClass }, inner),
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

export function rehypePaperComponent() {
  return (tree) => {
    if (!tree) return
    walk(tree, (node, parent, index) => {
      if (index == null || !parent) return
      if (node.type !== "element" || node.tagName !== "paper") return
      const replacement = buildPaper(node)
      parent.children.splice(index, 1, ...replacement)
    })
  }
}
