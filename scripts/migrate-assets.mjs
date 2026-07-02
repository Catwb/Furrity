import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const IMG_SRC = "D:\\文档\\1工作站\\testTheme\\images"
const PAGES_SRC = "D:\\文档\\1工作站\\testTheme\\Pages"
const FURRITY = "D:\\文档\\1工作站\\testTheme\\Furrity"

// ── Image migration ──────────────────────────────────────────
const imgDst = {
  "avatar.jpg":               "src/assets/images/avatar.jpg",
  "atiq.png":                 "src/assets/images/atiq.png",
  "atiq.webp":                "src/assets/images/atiq.webp",
  "favicon-16x16-qiyao.png":  "public/favicon/favicon-16x16-qiyao.png",
  "favicon-32x32-qiyao.png":  "public/favicon/favicon-32x32-qiyao.png",
  "loge.svg":                 "public/favicon/loge.svg",
  "web.png":                  "public/images/web.png",
}

console.log("── Copying images ──")
for (const [file, rel] of Object.entries(imgDst)) {
  const src = path.join(IMG_SRC, file)
  const dst = path.join(FURRITY, rel)
  if (!fs.existsSync(src)) { console.log(`  SKIP ${file} (not found)`); continue }
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
  console.log(`  OK   ${file} → ${rel}`)
}

// ── Tag-plugin converter (reuse from migrate-posts) ──────────
const TAG_MAP = [
  [/{%\s*box\s+([\s\S]*?)%}([\s\S]*?){%\s*endbox\s*%}/g,
   (_, raw, body) => {
     const color = raw.match(/color:(\S+)/)?.[1]
     const title = raw.replace(/color:\S+\s*/g, "").trim()
     const p = []; if (color) p.push(`color=${color}`); if (title) p.push(`title="${title}"`)
     return `:::box${p.length ? `{${p.join(" ")}}` : ""}\n${body.replace(/^ +/gm, "").trim()}\n:::`
   }],
  [/{%\s*folding\s+(.*?)\s*%}([\s\S]*?){%\s*endfolding\s*%}/g,
   (_, title, body) => `:::folding{title="${title.trim()}"}\n${body.replace(/^ +/gm, "").trim()}\n:::`],
  [/{%\s*gallery\s*%}([\s\S]*?){%\s*endgallery\s*%}/g,
   (_, body) => body.replace(/^ +/gm, "").trim()],
  [/{%\s*note\s*%}([\s\S]*?){%\s*endnote\s*%}/g,
   (_, body) => `:::stnote\n${body.replace(/^ +/gm, "").trim()}\n:::`],
  [/{%\s*checkbox\s+(checked:true\s+)?(.*?)\s*%}/g,
   (_, checked, text) => `- ${checked ? "[x]" : "[ ]"} ${text.trim()}`],
  [/{%\s*checkbox\s+checked:true\s+(.*?)\s*%}/g,
   (_, text) => `- [x] ${text.trim()}`],
  [/{%\s*checkbox\s+symbol:\w+\s+color:\w+\s+checked:true\s+(.*?)\s*%}/g,
   (_, text) => `- [x] ${text.trim()}`],
  [/{%\s*checkbox\s+color:\w+\s+checked:true\s+(.*?)\s*%}/g,
   (_, text) => `- [x] ${text.trim()}`],
  [/{%\s*quot\s+(.*?)\s*%}/g, (_, text) => `> ${text.trim()}`],
  [/{%\s*timeline\s*%}([\s\S]*?){%\s*endtimeline\s*%}/g,
   (_, body) => body.replace(/^ +/gm, "").trim()],
  [/<!--\s*node\s+(.*?)\s*-->/g, (_, title) => `### ${title.trim()}`],
  [/{%\s*sites\s+(.*?)\s*%}/g, (_) => ""],
  [/{%\s*ghcard\s+(.*?)::theme=(\w+)\s*%}/g,
   (_, repo) => `[${repo.trim()}](https://github.com/${repo.trim()})`],
  // tabs: {% tabs name,active_index %}<!-- tab title -->...<!-- endtab -->...{% endtabs %}
  //        → <div class="tag-plugin tabs"> with raw HTML tab structure
  [/{%\s*tabs\s+([^%]+?)\s*%}([\s\S]*?){%\s*endtabs\s*%}/g,
   (_, args, content) => {
     const active = parseInt(args.split(",")[1]?.trim()) || 1
     const parts = content.split(/<!--\s*endtab\s*-->/g)
     let idx = 0
     const headers = []
     const panels = []
     parts.forEach(block => {
       const m = block.match(/<!--\s*tab\s+(.*?)\s*-->([\s\S]*)/)
       if (!m) return
       idx++
       const title = m[1].trim()
       const body = m[2].replace(/^ +/gm, "").trim() + "\n"
       const isActive = idx === active
       headers.push(`<button class="tab-btn${isActive ? " active" : ""}" data-tab="${idx - 1}">${title}</button>`)
       panels.push(`<div class="tab-panel${isActive ? " active" : ""}" data-tab="${idx - 1}">\n\n${body}\n</div>`)
     })
     if (headers.length === 0) return ""
     return `<div class="tag-plugin tabs">\n<div class="tab-nav">\n${headers.join("\n")}\n</div>\n${panels.join("\n")}\n</div>`
   }],
]

function convertTags(content) {
  let result = content
  for (const [pattern, replacer] of TAG_MAP) result = result.replace(pattern, replacer)
  return result
}

// ── Page migration ──────────────────────────────────────────
// Map: Stellar dir → spec id (filename in src/content/spec/)
const PAGE_MAP = {
  "about":   { id: "about",   override: true  },  // replaces existing
  "links":   { id: "friends", override: true  },  // replaces existing → use "friends" id
  "encrypt": { id: "encrypt", override: false },
  "fcircle": { id: "fcircle", override: false },
  "furry":   { id: "furry",   override: false },
  "log":     { id: "log",     override: false },
  "more":    { id: "more",    override: false },
  "shuoshuo":{ id: "shuoshuo",override: false },
  "status":  { id: "status",  override: false },
}

console.log("\n── Migrating pages ──")
for (const [dir, cfg] of Object.entries(PAGE_MAP)) {
  const srcFile = path.join(PAGES_SRC, dir, "index.md")
  if (!fs.existsSync(srcFile)) { console.log(`  SKIP ${dir} (not found)`); continue }
  const raw = fs.readFileSync(srcFile, "utf-8")
  const parsed = matter(raw)
  const body = convertTags(parsed.content)
  const out = { title: parsed.data.title || dir }
  // Keep only title from frontmatter; other fields are Stellar-specific
  const newContent = matter.stringify(body, out)
  const dstFile = path.join(FURRITY, "src", "content", "spec", `${cfg.id}.md`)
  fs.writeFileSync(dstFile, newContent, "utf-8")
  console.log(`  OK   ${dir}/index.md → spec/${cfg.id}.md`)
}

// ── Play pages (sub-pages under /play/) ──────────────────────
const PLAY_MAP = {
  "flipcard":        { title: "翻牌游戏" },
  "chat":            { title: "实时聊天" },
  "eatcat":          { title: "吃掉小猫咪" },
  "air-conditioner": { title: "小空调" },
}

console.log("\n── Migrating play sub-pages ──")
for (const [dir, meta] of Object.entries(PLAY_MAP)) {
  const srcFile = path.join(PAGES_SRC, "play", dir, "index.md")
  if (!fs.existsSync(srcFile)) { console.log(`  SKIP play/${dir} (not found)`); continue }
  const raw = fs.readFileSync(srcFile, "utf-8")
  const parsed = matter(raw)
  const body = convertTags(parsed.content)
  const newContent = matter.stringify(body, { title: meta.title })
  const dstFile = path.join(FURRITY, "src", "content", "spec", `play-${dir}.md`)
  fs.writeFileSync(dstFile, newContent, "utf-8")
  console.log(`  OK   play/${dir}/index.md → spec/play-${dir}.md`)
}

console.log("\nDone!")
