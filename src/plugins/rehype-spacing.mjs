import { visit } from "unist-util-visit";

function prevSiblingText(node, parent, index) {
	if (index <= 0) return "";
	const prev = parent.children[index - 1];
	if (prev.type === "text") return prev.value;
	if (prev.type === "element" && prev.tagName !== "code" && prev.tagName !== "pre") {
		return prev.children?.map((c) => c.type === "text" ? c.value : "").join("");
	}
	return "";
}

function nextSiblingText(node, parent, index) {
	if (index >= parent.children.length - 1) return "";
	const next = parent.children[index + 1];
	if (next.type === "text") return next.value;
	if (next.type === "element" && next.tagName !== "code" && next.tagName !== "pre") {
		return next.children?.map((c) => c.type === "text" ? c.value : "").join("");
	}
	return "";
}

const cjk = /[\u4e00-\u9fff]/;
const latin = /[a-zA-Z]/;
const digit = /\d/;

export function rehypeSpacing() {
	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			if (!parent || parent.tagName === "code" || parent.tagName === "pre") return;
			let value = node.value;

			// internal CJK/Latin/digit spacing
			value = value
				.replace(/([\u4e00-\u9fff])([a-zA-Z])/g, "$1 $2")
				.replace(/([a-zA-Z])([\u4e00-\u9fff])/g, "$1 $2")
				.replace(/([\u4e00-\u9fff])(\d)/g, "$1 $2")
				.replace(/(\d)([\u4e00-\u9fff])/g, "$1 $2");

			// cross-element boundary spacing (e.g. 记住**261** → "记住 261")
			if (value.length > 0) {
				const prev = prevSiblingText(node, parent, index);
				const next = nextSiblingText(node, parent, index);
				const first = value[0];
				const last = value[value.length - 1];

				if ((latin.test(first) || digit.test(first)) && prev.length > 0 && cjk.test(prev[prev.length - 1])) {
					value = " " + value;
				}
				if ((latin.test(last) || digit.test(last)) && next.length > 0 && cjk.test(next[0])) {
					value = value + " ";
				}
				if ((cjk.test(first)) && prev.length > 0 && (latin.test(prev[prev.length - 1]) || digit.test(prev[prev.length - 1]))) {
					value = " " + value;
				}
				if ((cjk.test(last)) && next.length > 0 && (latin.test(next[0]) || digit.test(next[0]))) {
					value = value + " ";
				}
			}

			if (value !== node.value) {
				node.value = value;
			}
		});
	};
}
