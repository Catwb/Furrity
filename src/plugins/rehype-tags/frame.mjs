import { h } from "hastscript"
import { shouldInject } from "./_registry.js"

const STYLE = `.tag-plugin.img-wrap, .tag-plugin.video-wrap {
  margin: 1em 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tag-plugin .frame-wrap {
  position: relative;
  width: 100%;
  max-width: 375px;
}
.tag-plugin .frame-wrap .img {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
}
.tag-plugin .frame-wrap video {
  width: 100%;
  display: block;
  border-radius: 0.5rem;
}
.tag-plugin .image-caption {
  margin-top: 0.25rem;
  font-size: 0.85em;
  opacity: 0.65;
}`
export function FrameComponent(properties, children) {
  const nodes = []
  if (shouldInject("frame")) {
    nodes.push(h("style", { "data-tag-plugin": "frame" }, STYLE))
  }

  const device = properties.device || ""
  const img = properties.img || ""
  const video = properties.video || ""
  const focus = properties.focus || ""
  const alt = properties.alt || ""

  if ((!img && !video) || !device) {
    nodes.push(h("div", { class: "hidden" }, "Invalid frame tag: requires device and img/video"))
    return nodes
  }

  const wrapClass = video ? "tag-plugin video-wrap" : "tag-plugin img-wrap"
  const frameAttrs = { class: "frame-wrap", id: device }
  if (focus) frameAttrs.focus = focus

  if (video) {
    const videoAttrs = { playsinline: "", muted: "", loop: "", autoplay: "", preload: "metadata" }
    if (img) videoAttrs.poster = img
    const inner = [
      h("video", videoAttrs, [h("source", { src: video, type: "video/mp4" })]),
      h("div", { class: "frame" }),
    ]
    nodes.push(h("div", { class: wrapClass }, [
      h("div", frameAttrs, inner),
    ]))
  } else {
    const imgAttrs = { class: "img", src: img }
    if (alt) imgAttrs.alt = alt
    const inner = [
      h("img", imgAttrs),
      h("div", { class: "frame" }),
    ]
    const wrapInner = [h("div", frameAttrs, inner)]
    if (alt) {
      wrapInner.push(h("span", { class: "image-caption" }, alt))
    }
    nodes.push(h("div", { class: wrapClass }, wrapInner))
  }
  return nodes.length === 1 ? nodes[0] : nodes
}
