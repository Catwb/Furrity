import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

/**
 * chat 对话标签
 * ---------------------------------------------------------------------------
 * 用法：
 *
 *   :::chat{title="龙星的夜晚" me="龙星" avatars="绮曜:/img/qiyao.png, 帝凌:/img/diling.png"}
 *   - 绮曜: 你回来啦。
 *   - 龙星: 嗯，今天把灯箱修好了。
 *   - 帝凌: 修好了？我看看。
 *   :::
 *
 * 左右规则（按优先级）：
 *   1. left="A, B" / right="C"  显式指定
 *   2. me="龙星"                该名字在右，其余在左
 *   3. 两个人以内               按说话人交替（同一个人连发保持同侧）
 *   4. 三个人以上且没给 me       全部在左，退化成群聊
 *
 * 注意：这里用自定义 walk 替换，而不是 rehype-components —— 后者替换节点后会
 * 跳过子节点（return [SKIP, index]），嵌套的标签不会被渲染。
 */

const STYLE = `.tag-plugin.chat {
  display: flex;
  flex-direction: column;
  margin: 1.6em 0;
  padding: 0.9rem 1rem 1.1rem;
  border-radius: var(--radius-large, 1.25rem);
  border: 1px solid var(--line-divider, oklch(0.9 0.01 var(--hue)));
  background: var(--card-bg);
}
.tag-plugin.chat .chat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px dashed var(--line-divider, oklch(0.9 0.01 var(--hue)));
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--deep-text, oklch(0.25 0.02 var(--hue)));
  line-height: 1.3;
}
.tag-plugin.chat .chat-header::before {
  content: "";
  flex: 0 0 auto;
  width: 3px;
  height: 0.95rem;
  border-radius: 2px;
  background: var(--primary);
}
.tag-plugin.chat .chat-items {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.tag-plugin.chat .chat-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}
.tag-plugin.chat .chat-item[data-side="right"] {
  flex-direction: row-reverse;
}
.tag-plugin.chat .chat-avatar {
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
  background: var(--btn-regular-bg);
  color: var(--btn-content);
}
.tag-plugin.chat .chat-avatar--initial {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1;
  user-select: none;
}
.tag-plugin.chat .chat-body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-width: min(78%, 34rem);
  min-width: 0;
}
.tag-plugin.chat .chat-item[data-side="right"] .chat-body {
  align-items: flex-end;
}
.tag-plugin.chat .chat-name {
  font-size: 0.75rem;
  line-height: 1.2;
  color: var(--btn-content);
}
.tag-plugin.chat .chat-bubble {
  padding: 0.55rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid var(--line-divider, oklch(0.9 0.01 var(--hue)));
  background: var(--btn-regular-bg);
  font-size: 0.95rem;
  line-height: 1.7;
  word-break: break-word;
}
.tag-plugin.chat .chat-item[data-side="left"] .chat-bubble {
  border-bottom-left-radius: 0.25rem;
}
.tag-plugin.chat .chat-item[data-side="right"] .chat-bubble {
  border-color: transparent;
  background: color-mix(in oklab, var(--primary) 16%, var(--card-bg));
  border-bottom-right-radius: 0.25rem;
}
.tag-plugin.chat .chat-bubble > :first-child {
  margin-top: 0;
}
.tag-plugin.chat .chat-bubble > :last-child {
  margin-bottom: 0;
}
@media (max-width: 640px) {
  .tag-plugin.chat {
    padding: 0.75rem 0.75rem 0.9rem;
  }
  .tag-plugin.chat .chat-body {
    max-width: 82%;
  }
  .tag-plugin.chat .chat-avatar {
    width: 2rem;
    height: 2rem;
  }
}`

function textOf(node) {
  if (!node) return ""
  if (node.type === "text") return node.value || ""
  if (Array.isArray(node.children)) return node.children.map(textOf).join("")
  return ""
}

/** "绮曜:/a.png, 帝凌:/b.png" → { 绮曜: "/a.png", 帝凌: "/b.png" } */
function parseAvatars(raw) {
  const map = {}
  if (!raw) return map
  for (const part of String(raw).split(/[,，]/)) {
    const idx = part.search(/[:：]/)
    if (idx < 0) continue
    const name = part.slice(0, idx).trim()
    const url = part.slice(idx + 1).trim()
    if (name && url) map[name] = url
  }
  return map
}

function parseNameList(raw) {
  return String(raw || "")
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 从 <li> 里拆出「名字」和「消息内容」 */
function splitMessage(li) {
  const children = (li.children || []).filter(Boolean)
  const paragraph = children.find((c) => c.type === "element" && c.tagName === "p")
  const nodes = paragraph ? paragraph.children || [] : children

  let name = ""
  let content = nodes

  if (nodes.length > 0 && nodes[0].type === "element" && nodes[0].tagName === "strong") {
    name = textOf(nodes[0]).trim()
    const rest = nodes.slice(1)
    // 去掉紧随其后的 "：" 或 ":"
    if (rest.length > 0 && rest[0].type === "text") {
      rest[0] = { ...rest[0], value: String(rest[0].value || "").replace(/^\s*[:：]\s*/, "") }
    }
    content = rest
  } else if (nodes.length > 0 && nodes[0].type === "text") {
    const match = /^([^:：]+)[:：]\s*/.exec(nodes[0].value || "")
    if (match) {
      name = match[1].trim()
      const remainder = (nodes[0].value || "").slice(match[0].length)
      const rest = nodes.slice(1)
      content = remainder ? [{ type: "text", value: remainder }, ...rest] : rest
    }
  }

  return { name, content }
}

function buildChat(node) {
  const props = node.properties || {}
  const avatars = parseAvatars(props.avatars)
  const me = props.me ? String(props.me).trim() : ""
  const title = props.title ? String(props.title).trim() : ""
  const explicitLeft = parseNameList(props.left)
  const explicitRight = parseNameList(props.right)

  // 收集容器里所有的 <li>（可能被包在 <ul> 或 <ol> 里）
  const collectLis = (n) => {
    if (!n) return []
    if (n.type === "element" && n.tagName === "li") return [n]
    if (!Array.isArray(n.children)) return []
    return n.children.flatMap(collectLis)
  }
  const lis = (node.children || []).flatMap(collectLis)

  const parsed = lis.map((li) => {
    const { name, content } = splitMessage(li)
    return { name, content }
  })

  // 注意：判断的是「不同说话人」的数量，不是消息条数 ——
  // 四句话只有两个人，仍然应该按 1v1 对话交替。
  const speakerCount = new Set(parsed.map((m) => m.name).filter(Boolean)).size
  const autoAlternate = speakerCount <= 2

  const messages = []
  let previousName = ""
  let previousSide = null

  for (const { name, content } of parsed) {
    let side

    if (explicitLeft.includes(name)) {
      side = "left"
    } else if (explicitRight.includes(name)) {
      side = "right"
    } else if (me) {
      side = name === me ? "right" : "left"
    } else if (autoAlternate) {
      // 第一条靠左；之后按说话人翻转，同一个人连发保持同侧
      if (previousSide === null) side = "left"
      else if (name === previousName) side = previousSide
      else side = previousSide === "left" ? "right" : "left"
    } else {
      // 三个人以上又没有 me：全部靠左，退化成群聊
      side = "left"
    }

    previousName = name
    previousSide = side

    messages.push({ name, content, side, avatar: avatars[name] })
  }

  const items = messages.map(({ name, content, side, avatar }) => {
    const avatarNode = avatar
      ? h("img", { class: "chat-avatar", src: avatar, alt: name })
      : h("span", { class: "chat-avatar chat-avatar--initial" }, (name || "?").slice(0, 1))

    const body = []
    if (name) body.push(h("span", { class: "chat-name" }, name))
    body.push(h("div", { class: "chat-bubble" }, content))

    return h("div", { class: "chat-item", "data-side": side }, [avatarNode, h("div", { class: "chat-body" }, body)])
  })

  const inner = []
  if (title) inner.push(h("div", { class: "chat-header" }, title))
  inner.push(h("div", { class: "chat-items" }, items))

  const nodes = []
  if (shouldInject("chat")) {
    nodes.push(h("style", { "data-tag-plugin": "chat" }, STYLE))
  }
  nodes.push(h("div", { class: "tag-plugin chat" }, inner))
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

export function rehypeChatComponent() {
  return (tree) => {
    if (!tree) return
    walk(tree, (node, parent, index) => {
      if (index == null || !parent) return
      if (node.type !== "element" || node.tagName !== "chat") return
      const replacement = buildChat(node)
      parent.children.splice(index, 1, ...replacement)
    })
  }
}
