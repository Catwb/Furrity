import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.tabs {
  margin: 1em 0;
  border-radius: 0.5rem;
  overflow: hidden;
}
.tag-plugin.tabs .tab-nav {
  display: flex;
  gap: 2px;
  border-bottom: 2px solid var(--primary, oklch(0.5 0.15 var(--hue)));
  padding: 0;
  margin: 0 !important;
}
.tag-plugin.tabs .tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  color: var(--secondary, oklch(0.5 0.05 var(--hue)));
  border-radius: 0.25rem 0.25rem 0 0;
  transition: all 0.2s;
}
.tag-plugin.tabs .tab-btn:hover {
  background: var(--block-bg, oklch(0.95 0.01 var(--hue)));
  color: var(--primary, oklch(0.5 0.15 var(--hue)));
}
.tag-plugin.tabs .tab-btn.active {
  background: var(--primary, oklch(0.5 0.15 var(--hue)));
  color: white;
}
.tag-plugin.tabs .tab-panel {
  display: none;
  padding: 1rem;
  background: var(--block-bg, oklch(0.97 0.005 var(--hue)));
  border: 1px solid var(--block-border, oklch(0.85 0.02 var(--hue)));
  border-top: none;
  border-radius: 0 0 0.25rem 0.25rem;
}
.tag-plugin.tabs .tab-panel.active {
  display: block;
}`

const SCRIPT = `document.addEventListener("click",function(e){
  var b=e.target.closest(".tab-btn");if(!b)return;
  var t=b.closest(".tag-plugin.tabs");if(!t)return;
  t.querySelectorAll(".tab-btn").forEach(function(x){x.classList.remove("active")});
  t.querySelectorAll(".tab-panel").forEach(function(x){x.classList.remove("active")});
  b.classList.add("active");
  var p=t.querySelectorAll(".tab-panel");
  if(p[b.getAttribute("data-tab")])p[b.getAttribute("data-tab")].classList.add("active");
})`

function walk(node, fn, parent, index) {
  if (!node) return
  fn(node, parent, index)
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      walk(node.children[i], fn, node, i)
    }
  }
}

/**
 * Finds raw-HTML <div class="tag-plugin tabs"> in markdown output
 * and injects CSS/JS via the registry (only once per page).
 */
export function rehypeTabsComponent() {
  return (tree) => {
    if (!tree) return
    let found = false
    walk(tree, (node) => {
      if (found) return
      if (node.type === "raw" && typeof node.value === "string") {
        if (node.value.includes("tag-plugin tabs")) found = true
        else if (node.value.includes("tab-btn")) found = true
        else if (node.value.includes("tab-panel")) found = true
      }
      if (node.type === "element") {
        if (node.properties?.class === "tag-plugin tabs") found = true
        if (node.properties?.className === "tag-plugin tabs") found = true
        if (Array.isArray(node.properties?.className) && node.properties.className.includes("tag-plugin") && node.properties.className.includes("tabs")) found = true
      }
      if (node.type === "text" && typeof node.value === "string" && node.value.includes("tag-plugin tabs")) found = true
    })
    if (!found) return
    if (!shouldInject("tabs")) return
    tree.children.unshift(
      h("style", { "data-tag-plugin": "tabs" }, STYLE),
      h("script", { "data-tag-plugin": "tabs" }, SCRIPT),
    )
  }
}
