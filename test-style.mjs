import { toHtml } from "hast-util-to-html"
import { h } from "hastscript"

const node = h("div", {
  style: "aspect-ratio:16/9;max-width:100%"
})
console.log("String style:", JSON.stringify(toHtml(node)))

const node2 = h("div", {
  style: { aspectRatio: "16/9", maxWidth: "100%" }
})
console.log("Object style:", JSON.stringify(toHtml(node2)))
