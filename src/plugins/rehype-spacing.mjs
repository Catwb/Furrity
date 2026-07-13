import { visit } from "unist-util-visit";

const cjk = /[\u4e00-\u9fff]/;
const latin = /[a-zA-Z]/;
const digit = /\d/;
const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "blockquote", "figcaption", "dt", "dd"]);

function needSpace(a, b) {
  return (cjk.test(a) && (latin.test(b) || digit.test(b))) ||
         ((latin.test(a) || digit.test(a)) && cjk.test(b));
}

function extractText(node) {
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    if (node.tagName === "code" || node.tagName === "pre") return "";
    return (node.children || []).map(extractText).join("");
  }
  return "";
}

function lastTextNode(node) {
  if (node.type === "text") return node;
  if (node.type === "element" && node.children?.length > 0) {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const r = lastTextNode(node.children[i]);
      if (r) return r;
    }
  }
  return null;
}

function firstTextNode(node) {
  if (node.type === "text") return node;
  if (node.type === "element" && node.children?.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      const r = firstTextNode(node.children[i]);
      if (r) return r;
    }
  }
  return null;
}

function isInline(node) {
  if (node.type === "text") return true;
  if (node.type === "element") {
    return !BLOCK_TAGS.has(node.tagName) && node.tagName !== "code" && node.tagName !== "pre";
  }
  return false;
}

function processContainer(container) {
  const children = container.children || [];
  for (let i = 0; i < children.length - 1; i++) {
    const a = children[i];
    const b = children[i + 1];
    if (!a || !b || !isInline(a) || !isInline(b)) continue;

    const aText = extractText(a);
    const bText = extractText(b);
    if (!aText || !bText) continue;

    if (needSpace(aText[aText.length - 1], bText[0])) {
      const last = lastTextNode(a);
      const first = firstTextNode(b);
      if (last && !last.value.endsWith(" ")) {
        last.value += " ";
      } else if (first && !first.value.startsWith(" ")) {
        first.value = " " + first.value;
      }
    }
  }
}

export function rehypeSpacing() {
  return (tree) => {
    // 1. internal spacing within each text node
    visit(tree, "text", (node, _index, parent) => {
      if (!parent || parent.tagName === "code" || parent.tagName === "pre") return;
      const spaced = node.value
        .replace(/([\u4e00-\u9fff])([a-zA-Z])/g, "$1 $2")
        .replace(/([a-zA-Z])([\u4e00-\u9fff])/g, "$1 $2")
        .replace(/([\u4e00-\u9fff])(\d)/g, "$1 $2")
        .replace(/(\d)([\u4e00-\u9fff])/g, "$1 $2");
      if (spaced !== node.value) node.value = spaced;
    });

    // 2. cross-element boundaries at the block-container level
    visit(tree, "element", (node) => {
      if (BLOCK_TAGS.has(node.tagName)) processContainer(node);
    });
  };
}
