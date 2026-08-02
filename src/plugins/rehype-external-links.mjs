import { visit } from "unist-util-visit";

export function rehypeExternalLinks() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName !== "a") return;
			const href = node.properties?.href;
			if (typeof href !== "string") return;
			if (/^https?:\/\//.test(href)) {
				node.properties.target = "_blank";
				node.properties.rel = ["noopener", "noreferrer"];
			}
		});
	};
}
