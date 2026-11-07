import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.25em 0;
  line-height: 1.6;
}
.tag-plugin.checkbox > .checkbox-text {
  flex: 1 1 auto;
  min-width: 0;
}
/* 文本通常由 Markdown 生成为 <p>，Typography 默认给它上下外边距，
   在 flex 容器里会把文字整体压低，看起来和图标不在同一行 */
.tag-plugin.checkbox > .checkbox-text > p {
  margin-block: 0;
}
.tag-plugin.checkbox .icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #fff;
  font-weight: 700;
  line-height: 1;
  /* 统一取 --checkbox-color；未指定时的回退色由 checked/unchecked 决定，
     这样 color="red" 的叉号才真的是红色，而不是写死的灰 */
  background: var(--checkbox-color, var(--checkbox-fallback));
}
.tag-plugin.checkbox .icon.checked {
  --checkbox-fallback: var(--primary);
}
.tag-plugin.checkbox .icon.unchecked {
  --checkbox-fallback: #ccc;
}`

export function CheckboxComponent(properties, children) {
  const nodes = []
  if (shouldInject("checkbox")) {
    nodes.push(h("style", { "data-tag-plugin": "checkbox" }, STYLE))
  }

  const props = properties || {}
  const checked = props.checked === "true" || props.checked === true
  const color = props.color || ""

  const colorMap = {
    green: "oklch(0.6 0.15 140)",
    red: "oklch(0.6 0.2 20)",
    blue: "oklch(0.5 0.15 240)",
    yellow: "oklch(0.7 0.12 80)",
    cyan: "oklch(0.6 0.12 190)",
    purple: "oklch(0.55 0.15 290)",
    orange: "oklch(0.65 0.15 50)",
  }

  const icon = h("span", {
    class: `icon ${checked ? "checked" : "unchecked"}`,
    style: color ? `--checkbox-color: ${colorMap[color] || color}` : "",
  }, checked ? "✓" : "✗")

  // 文本包一层 .checkbox-text：便于用子选择器精确去掉 <p> 的外边距，
  // 让图标与首行文字基线对齐
  const text = h("span", { class: "checkbox-text" }, children || [])

  nodes.push(h("span", { class: "tag-plugin checkbox" }, [icon, text]))
  return nodes.length === 1 ? nodes[0] : nodes
}
