import { markdownToMdast } from "satteri";
import { unified } from "unified";
import { VFile } from "vfile";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import {
  markdownConfigDefaults,
  rehypeHeadingIds,
  rehypePrism,
  rehypeShiki,
  remarkCollectImages,
} from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

const HAST_PRESERVED_PROPERTIES = ["className", "htmlFor"];

function rehypeImages() {
  return function (tree, file) {
    if (!file.data.astro?.localImagePaths?.length && !file.data.astro?.remoteImagePaths?.length) {
      return;
    }
    const imageOccurrenceMap = new Map();
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      if (typeof node.properties?.src !== "string") return;
      const src = decodeURI(node.properties.src);
      let imageProperties;
      if (file.data.astro?.localImagePaths?.includes(src)) {
        imageProperties = { ...node.properties, src };
      } else if (file.data.astro?.remoteImagePaths?.includes(src)) {
        imageProperties = {
          inferSize: "width" in node.properties && "height" in node.properties ? undefined : true,
          ...node.properties,
          src,
        };
      } else {
        return;
      }
      const hastProperties = {};
      for (const key of HAST_PRESERVED_PROPERTIES) {
        if (key in imageProperties) {
          hastProperties[key] = imageProperties[key];
          delete imageProperties[key];
        }
      }
      const index = imageOccurrenceMap.get(node.properties.src) || 0;
      imageOccurrenceMap.set(node.properties.src, index + 1);
      node.properties = {
        ...hastProperties,
        __ASTRO_IMAGE_: JSON.stringify({ ...imageProperties, index }),
      };
    });
  };
}

const DEFAULT_FEATURES = {
  gfm: true,
  math: true,
  directive: true,
  smartPunctuation: false,
  frontmatter: true,
};

function remarkFixSatteriDirectives() {
  return function (tree, vfile) {
    const src = (vfile && vfile.value) || "";
    function visit(node) {
      if (node.type === "textDirective" || node.type === "leafDirective" || node.type === "containerDirective") {
        const off = node.position && node.position.start && node.position.start.offset;
        const badName = !/^[a-zA-Z]/.test(node.name || "");
        const adjacentText = off !== undefined && off > 0 && /[\p{L}\p{N}_]/u.test(String(src)[off - 1]);
        if (badName || adjacentText) {
          return { type: "text", value: String(src).slice(off, node.position.end.offset) };
        }
      }
      return undefined;
    }
    function walk(node) {
      if (!node || !node.children) return;
      const out = [];
      for (const c of node.children) {
        const rep = visit(c);
        if (rep) out.push(rep);
        else { walk(c); out.push(c); }
      }
      node.children = out;
    }
    walk(tree);
  };
}

function mathHandlers() {
  return {
    math(state, node) {
      return {
        type: "element", tagName: "pre", properties: {},
        children: [{
          type: "element", tagName: "code",
          properties: { className: ["language-math", "math-display"] },
          children: [{ type: "text", value: node.value || "" }],
        }],
      };
    },
    inlineMath(state, node) {
      return {
        type: "element", tagName: "code",
        properties: { className: ["language-math", "math-inline"] },
        children: [{ type: "text", value: node.value || "" }],
      };
    },
  };
}

function satteriUnified(opts = {}) {
  const processor = {
    name: "unified",
    options: {
      remarkPlugins: [...(opts.remarkPlugins ?? [])],
      rehypePlugins: [...(opts.rehypePlugins ?? [])],
      remarkRehype: { ...opts.remarkRehype },
      features: { ...DEFAULT_FEATURES, ...opts.features },
      gfm: opts.gfm,
      smartypants: opts.smartypants,
    },
    async createRenderer(shared) {
      const remarkRehypeOptions = processor.options.remarkRehype;
      const remarkPlugins = processor.options.remarkPlugins;
      const rehypePlugins = processor.options.rehypePlugins;
      const syntaxHighlight = shared?.syntaxHighlight ?? markdownConfigDefaults.syntaxHighlight;
      const shikiConfig = shared?.shikiConfig ?? markdownConfigDefaults.shikiConfig;
      const image = shared?.image;

      const features = {
        ...processor.options.features,
        gfm: processor.options.gfm ?? shared?.gfm ?? processor.options.features.gfm,
      };
      const smartypants = processor.options.smartypants ?? shared?.smartypants ?? true;

      const isBenchmark = Boolean(process.env.ASTRO_PERFORMANCE_BENCHMARK);
      const loadedRemarkPlugins = [];
      const loadedRehypePlugins = [];

      for (const [i, p] of remarkPlugins.entries()) {
        const [plugin, pluginOpts] = Array.isArray(p) ? p : [p];
        loadedRemarkPlugins.push([plugin, pluginOpts]);
        void i;
      }
      for (const [i, p] of rehypePlugins.entries()) {
        const [plugin, pluginOpts] = Array.isArray(p) ? p : [p];
        loadedRehypePlugins.push([plugin, pluginOpts]);
        void i;
      }

      const parser = unified()
        .use(remarkFixSatteriDirectives)
        .use(remarkSmartypants, typeof smartypants === "object" ? smartypants : {});
      if (!isBenchmark) {
        parser.use(remarkCollectImages, image);
      }
      for (const [plugin, pluginOpts] of loadedRemarkPlugins) {
        parser.use(plugin, pluginOpts);
      }
      parser.use(remarkRehype, {
        allowDangerousHtml: true,
        ...remarkRehypeOptions,
        handlers: {
          ...(remarkRehypeOptions.handlers ?? {}),
          ...mathHandlers(),
        },
      });
      if (syntaxHighlight && !isBenchmark) {
        const type = typeof syntaxHighlight === "string" ? syntaxHighlight : syntaxHighlight?.type;
        const excludeLangs = typeof syntaxHighlight === "object" ? syntaxHighlight?.excludeLangs : undefined;
        if (type === "shiki") parser.use(rehypeShiki, shikiConfig, excludeLangs);
        else if (type === "prism") parser.use(rehypePrism, excludeLangs);
      }
      for (const [plugin, pluginOpts] of loadedRehypePlugins) {
        parser.use(plugin, pluginOpts);
      }
      parser.use(rehypeImages);
      if (!isBenchmark) {
        parser.use(rehypeHeadingIds);
      }
      parser.use(rehypeRaw).use(rehypeStringify, { allowDangerousHtml: true });

      return {
        async render(content, renderOpts) {
          const vfile = new VFile({
            value: content,
            path: renderOpts?.fileURL,
            data: {
              astro: {
                frontmatter: renderOpts?.frontmatter ?? {},
              },
            },
          });
          const tree = markdownToMdast(content, { features });
          const result = await parser.run(tree, vfile).catch((err) => {
            console.error(err);
            throw err;
          });
          const code = parser.stringify(result, vfile);
          return {
            code,
            metadata: {
              headings: vfile.data.astro?.headings ?? [],
              localImagePaths: vfile.data.astro?.localImagePaths ?? [],
              remoteImagePaths: vfile.data.astro?.remoteImagePaths ?? [],
              frontmatter: vfile.data.astro?.frontmatter ?? {},
            },
          };
        },
      };
    },
  };
  return processor;
}

export { satteriUnified };
