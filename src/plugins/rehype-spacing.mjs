import { visit } from "unist-util-visit";

export function rehypeSpacing() {
	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			if (!parent || parent.tagName === "code" || parent.tagName === "pre") return;
			const value = node.value;
			const spaced = value
				.replace(/([\u4e00-\u9fff])([a-zA-Z])/g, "$1 $2")
				.replace(/([a-zA-Z])([\u4e00-\u9fff])/g, "$1 $2")
				.replace(/([\u4e00-\u9fff])(\d)/g, "$1 $2")
				.replace(/(\d)([\u4e00-\u9fff])/g, "$1 $2");
			if (spaced !== value) {
				node.value = spaced;
			}
		});
	};
}
