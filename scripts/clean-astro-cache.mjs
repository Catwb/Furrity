import { existsSync, rmSync } from "fs";

// 构建前清除 astro 的内容缓存，确保 expressive-code 等 rehype 插件
// 每次构建都重新处理代码块（折叠等特性不会因缓存旧渲染结果而失效）
const targets = [".astro/data-store.json", "node_modules/.astro/data-store.json"];

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { force: true });
    console.log(`[clean-astro-cache] Removed: ${target}`);
  } else {
    console.log(`[clean-astro-cache] Not found: ${target}`);
  }
}
