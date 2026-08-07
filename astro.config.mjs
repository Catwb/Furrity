import compress from "@playform/compress";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { satteriUnified } from "./src/plugins/satteri-unified-processor.mjs";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig } from "./src/config/site.ts";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { pluginAutoCollapse } from "./src/plugins/expressive-code/auto-collapse.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { CheckboxComponent } from "./src/plugins/rehype-tags/checkbox.mjs";
import { BoxComponent } from "./src/plugins/rehype-tags/box.mjs";
import { NoteComponent } from "./src/plugins/rehype-tags/note.mjs";
import { FoldingComponent } from "./src/plugins/rehype-tags/folding.mjs";
import { ButtonComponent } from "./src/plugins/rehype-tags/button.mjs";
import { FrameComponent } from "./src/plugins/rehype-tags/frame.mjs";
import { MetingComponent } from "./src/plugins/rehype-tags/meting.mjs";
import { rehypePoetryComponent } from "./src/plugins/rehype-tags/poetry.mjs";
import { rehypePaperComponent } from "./src/plugins/rehype-tags/paper.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkAbbrlink } from "./src/plugins/remark-abbrlink";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { rehypeMermaidComponent } from "./src/plugins/rehype-tags/mermaid.mjs";
import { rehypeExternalLinks } from "./src/plugins/rehype-external-links.mjs";
import { rehypeSpacing } from "./src/plugins/rehype-spacing.mjs";
// Tab 代码块 — 不再使用 rehype-code-group，改为内联自定义 rehypeCodeGroupWrapper

/* 自定义 rehype-code-group 实现：用 <hr> 切分面板 */
import { SKIP, visit } from "unist-util-visit";

const rehypeCodeGroupWrapper = () => {
  return (tree) => {
    const groups = [];
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.tagName !== "p") return;
      const txt = node.children?.[0]?.value ?? "";
      const m = txt.match(/^::: code-group labels=\[([^\]]+)\]/);
      if (m) {
        groups.push({ parent, startIdx: index, labels: m[1].split(",").map(s=>s.trim()) });
        return SKIP;
      }
      if (txt.trim() === ":::") {
        const g = groups.pop();
        if (g && g.parent === parent) {
          const between = parent.children.slice(g.startIdx + 1, index);
          const panels = [];
          let cur = [];
          for (const item of between) {
            if (item.type === "element" && item.tagName === "hr") {
              if (cur.length) { panels.push(cur); cur = []; }
            } else { cur.push(item); }
          }
          if (cur.length) panels.push(cur);
          const tabEl = {
            type: "element", tagName: "div",
            properties: { className: ["rcg-tab-container"], role: "tablist" },
            children: g.labels.map((label, i) => ({
              type: "element", tagName: "button",
              properties: {
                type: "button", className: ["rcg-tab", ...(i===0?["active"]:[])],
                role: "tab", "aria-selected": i===0 ? "true" : "false",
                "aria-controls": `rcg-0-block-${i}`, id: `rcg-0-tab-${i}`,
              },
              children: [{ type: "text", value: label }],
            })),
          };
          const blockEls = panels.map((p, i) => ({
            type: "element", tagName: "div",
            properties: {
              className: ["rcg-block", ...(i===0?["active"]:[])],
              role: "tabpanel", "aria-labelledby": `rcg-0-tab-${i}`,
              id: `rcg-0-block-${i}`,
              ...(i===0?{}:{hidden:true}),
            },
            children: i === 0 ? p : [{
              type: "element", tagName: "template",
              properties: { className: ["rcg-panel"] },
              children: p,
            }],
          }));
          const wrapper = {
            type: "element", tagName: "div",
            properties: { className: ["rehype-code-group"] },
            children: [tabEl, ...blockEls],
          };
          parent.children.splice(g.startIdx, index - g.startIdx + 1, wrapper);
          return [SKIP, g.startIdx + 1];
        }
      }
    });
  };
};

// https://astro.build/config
export default defineConfig({
	site: "https://blog.furryawa.com/",
	base: "/",
	trailingSlash: "always",
	build: {
		inlineStylesheets: "auto",
	},
	integrations: [
		swup({
			theme: false,
			animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
			// the default value `transition-` cause transition delay
			// when the Tailwind class `transition-all` is used
			containers: ["main", "#toc"],
			smoothScrolling: true,
			cache: true,
			preload: true,
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
		}),
		icon({
			include: {
				"preprocess: vitePreprocess(),": ["*"],
				"fa6-brands": ["*"],
				"fa6-regular": ["*"],
				"fa6-solid": ["*"],
			},
		}),
		expressiveCode({
			themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
			plugins: [
				pluginAutoCollapse(expressiveCodeConfig.autoCollapseLines ?? 10),
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton()
			],
			getBlockLocale: () => expressiveCodeConfig.autoCollapseLocale ?? "zh",
			defaultProps: {
				wrap: true,
				collapseStyle: "collapsible-auto",
				overridesByLang: {
					'shellsession': {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
					editorTabBarBackground: "var(--codeblock-topbar-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
					terminalTitlebarBorderBottomColor: "none"
				},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250
				}
			},
			frames: {
				showCopyToClipboardButton: false,
			}
		}),
        svelte(),
		sitemap(),
		compress({
			CSS: false,
			HTML: false,
			JavaScript: false,
			SVG: false,
			JSON: false,
		}),
	],
	markdown: {
		processor: satteriUnified({
			remarkPlugins: [
				remarkAbbrlink,
				remarkReadingTime,
				remarkExcerpt,
				remarkGithubAdmonitionsToDirectives,
				remarkDirective,
				remarkSectionize,
				parseDirectiveNode,
			],
			rehypePlugins: [
				rehypeMermaidComponent,
				rehypeKatex,
				rehypeSlug,
				[
					rehypeComponents,
					{
						components: {
							note: NoteComponent, // Stellar-style note with color support
							tip: (x, y) => AdmonitionComponent(x, y, "tip"),
							important: (x, y) => AdmonitionComponent(x, y, "important"),
							caution: (x, y) => AdmonitionComponent(x, y, "caution"),
							warning: (x, y) => AdmonitionComponent(x, y, "warning"),
							box: BoxComponent,
							check: CheckboxComponent,
							stnote: NoteComponent,
							folding: FoldingComponent,
							button: ButtonComponent,
							frame: FrameComponent,
							meting: MetingComponent,
						},
					},
				],
				rehypeCodeGroupWrapper,
				rehypePoetryComponent,
				rehypePaperComponent,
				rehypeSpacing,
				rehypeExternalLinks,
				[
					rehypeAutolinkHeadings,
					{
						behavior: "append",
						properties: {
							className: ["anchor"],
						},
						content: {
							type: "element",
							tagName: "span",
							properties: {
								className: ["anchor-icon"],
								"data-pagefind-ignore": true,
							},
							children: [
								{
									type: "text",
									value: "#",
								},
							],
						},
					},
				],
			],
			gfm: true,
			smartypants: true,
		}),
	},
	vite: {
		optimizeDeps: {
			include: ["photoswipe"],
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes('node_modules/swup')) return 'swup';
						if (id.includes('node_modules/overlayscrollbars')) return 'overlayscrollbars';
						if (id.includes('node_modules/photoswipe')) return 'photoswipe';
						if (id.includes('_astro/') && id.includes('.js') && !id.includes('pagefind')) {
							if (id.includes('Icon') || id.includes('iconify')) return 'icons';
							if (id.includes('Search') || id.includes('DisplaySettings')) return 'widgets';
							if (id.includes('translation') || id.includes('setting-utils') || id.includes('url-utils')) return 'utils';
						}
					},
				},
				onwarn(warning, warn) {
					// temporarily suppress this warning
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
			},
		},
		esbuild: {
			drop: ["debugger"],
			pure: ["console.log", "console.debug"],
		},
	},
});
