import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.25em 0;
  line-height: 1.6;
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
}
.tag-plugin.checkbox .icon.checked {
  background: var(--checkbox-color, var(--primary));
}
.tag-plugin.checkbox .icon.unchecked {
  background: #ccc;
}`

export function CheckboxComponent(properties, children) {
  const nodes = []
  if (shouldInject("checkbox")) {
    nodes.push(h("style", { "data-tag-plugin": "checkbox" }, STYLE))
  }

  const checked = properties.checked === "true" || properties.checked === true
  const color = properties.color || ""

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

  nodes.push(h("span", { class: "tag-plugin checkbox" }, [icon, ...(children || [])]))
  return nodes.length === 1 ? nodes[0] : nodes
}
