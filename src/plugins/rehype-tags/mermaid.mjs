import { h } from "hastscript";
import { visit } from "unist-util-visit";
import { shouldInject } from "./_registry.js";

export function rehypeMermaidComponent() {
	return (tree) => {
		let hasMermaid = false;

		visit(tree, "element", (node, index, parent) => {
			if (
				node.tagName === "pre" &&
				node.children?.[0]?.tagName === "code"
			) {
				const code = node.children[0];
				const classes = code.properties?.className || [];
				if (classes.includes("language-mermaid")) {
					hasMermaid = true;
					const text = code.children?.[0]?.value || "";
					parent.children[index] = h("div", { class: "mermaid" }, text);
				}
			}
		});

		if (hasMermaid && shouldInject("mermaid")) {
			tree.children.push(
				h(
					"style",
					{ "data-tag-plugin": "mermaid" },
					`.mermaid {
  margin: 1em 0;
  padding: 1em;
  background: var(--block-bg, #fafafa);
  border-radius: 0.5rem;
  overflow-x: auto;
}`,
				),
			);

			tree.children.push(
				h("script", { "data-swup-ignore-script": true },
					`(function() {
  var els = document.querySelectorAll('.mermaid');
  if (els.length === 0) return;
  var s = document.createElement('script');
  s.src = 'https://unpkg.com/mermaid@11/dist/mermaid.min.js';
  s.onload = function() {
    mermaid.initialize({ startOnLoad: false });
    mermaid.run({ querySelector: '.mermaid' });
  };
  document.head.appendChild(s);
  function reinit() {
    if (typeof mermaid !== 'undefined') {
      mermaid.run({ querySelector: '.mermaid' });
    }
  }
  if (window.swup) {
    window.swup.hooks.on('content:replace', reinit);
  } else {
    document.addEventListener('swup:enable', function() {
      window.swup.hooks.on('content:replace', reinit);
    });
  }
})();`,
				),
			);
		}
	};
}
