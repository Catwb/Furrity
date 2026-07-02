import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const SRC = "D:\\文档\\1工作站\\testTheme\\_posts"
const DST = "D:\\文档\\1工作站\\testTheme\\Furrity\\src\\content\\posts"

const TAG_MAP = [
  // box: {% box color:cyan 标题 %} 或 {% box 标题 color:cyan %}...{% endbox %}
  //       → :::box{color=cyan title="标题"}\n...\n:::
  [/{%\s*box\s+([\s\S]*?)%}([\s\S]*?){%\s*endbox\s*%}/g,
   (_, raw, body) => {
     const color = raw.match(/color:(\S+)/)?.[1]
     const title = raw.replace(/color:\S+\s*/g, "").trim()
     const p = []
     if (color) p.push(`color=${color}`)
     if (title) p.push(`title="${title}"`)
     const ps = p.length ? `{${p.join(" ")}}` : ""
     return `:::box${ps}\n${body.replace(/^ +/gm, "").trim()}\n:::`
   }],

  // folding: {% folding title %}...{% endfolding %}
  //          → :::folding{title="title"}\n...\n:::
  [/{%\s*folding\s+(.*?)\s*%}([\s\S]*?){%\s*endfolding\s*%}/g,
   (_, title, body) =>
     `:::folding{title="${title.trim()}"}\n${body.replace(/^ +/gm, "").trim()}\n:::`],

  // poetry: {% poetry title author:name %}body{% endpoetry %}
  //          → :::poetry{title=title author="name"}\nbody\n:::
  [/{%\s*poetry\s+([\s\S]*?)(?:\s+author:(\S+))?\s*%}([\s\S]*?){%\s*endpoetry\s*%}/g,
   (_, title, author, body) => {
     const p = [`title="${title.trim()}"`]
     if (author) p.push(`author="${author.trim()}"`)
     return `:::poetry{${p.join(" ")}}\n${body.replace(/^ +/gm, "").trim()}\n:::`
   }],

  // note: {% note %}...{% endnote %}
  //        → :::stnote\n...\n:::
  [/{%\s*note\s*%}([\s\S]*?){%\s*endnote\s*%}/g,
   (_, body) => `:::stnote\n${body.replace(/^ +/gm, "").trim()}\n:::`],

  // button: {% button text url %}
  //          → :::button{text="text" url="url"}:::
  [/{%\s*button\s+(.*?)\s+(https?:\/\/\S+)\s*%}/g,
   (_, text, url) => `:::button{text="${text.trim()}" url="${url.trim()}"}:::`],

  // gallery: {% gallery %}...images...{% endgallery %}
  //          → strip wrapper, keep inner content as-is
  [/{%\s*gallery\s*%}([\s\S]*?){%\s*endgallery\s*%}/g,
   (_, body) => body.replace(/^ +/gm, "").trim()],

  // link_tip: {% link_tip text url display %}
  //            → [text](url)
  [/{%\s*link_tip\s+(.*?)\s+(https?:\/\/\S+)\s*(?:\S+\s*)?%}/g,
   (_, text, url) => `[${text.trim()}](${url.trim()})`],

  // link: {% link title url::avatar %}
  //        → [title](url)
  [/{%\s*link\s+(.*?)::(https?:\/\/\S+?)::(?:\S+\s*)?%}/g,
   (_, title, url) => `[${title.trim()}](${url.trim()})`],

  // checkbox: {% checkbox checked(optional) text %}
  //            → - [x] text or - [ ] text
  [/{%\s*checkbox\s+(checked\s+)?(.*?)\s*%}/g,
   (_, checked, text) => `- ${checked ? "[x]" : "[ ]"} ${text.trim()}`],

  // emoji: {% emoji name %}
  //         → :name:
  [/{%\s*emoji\s+(.*?)\s*%}/g,
   (_, name) => `:${name.trim()}:`],

  // font: {% font name %}...{% endfont %}
  //        → keep content, strip wrapper
  [/{%\s*font\s+.*?%}([\s\S]*?){%\s*endfont\s*%}/g,
   (_, body) => body.trim()],

  // psw: {% psw %}...{% endpsw %}
  //        → keep content, strip wrapper
  [/{%\s*psw\s*%}([\s\S]*?){%\s*endpsw\s*%}/g,
   (_, body) => body.trim()],

  // meting: {% meting id platform type %}
  //          → [Listen on Netease](https://music.163.com/#/playlist?id=id)
  [/{%\s*meting\s+"(\d+)"\s+"(\w+)"\s+"(\w+)"\s*%}/g,
   (_, id, platform, type) => {
     if (type === "playlist")
       return `[🎵 Listen on Netease](https://music.163.com/#/playlist?id=${id})`
     return `[🎵 Netease Music](https://music.163.com/#/song?id=${id})`
   }],

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

  // image: {% image url description %}
  //         → ![description](url)
  [/{%\s*image\s+(https?:\/\/\S+?)\s+(.*?)\s*%}/g,
   (_, url, desc) => {
     const d = desc.trim().replace(/["']/g, "")
     return d ? `![${d}](${url.trim()})` : `![](${url.trim()})`
   }],
]

function convertTags(content) {
  let result = content
  for (const [pattern, replacer] of TAG_MAP) {
    result = result.replace(pattern, replacer)
  }
  return result
}

function convertFrontmatter(data) {
  const out = {}
  out.title = data.title || "Untitled"
  out.published = data.date ? new Date(data.date) : new Date()
  if (data.updated) out.updated = new Date(data.updated)
  if (data.draft) out.draft = true
  if (data.description) out.description = data.description
  if (data.home_cover) out.image = data.home_cover
  if (data.tags && Array.isArray(data.tags)) out.tags = data.tags.map(String)
  if (data.categories && Array.isArray(data.categories)) out.category = flattenCats(data.categories).map(String)
  if (data.abbrlink) out.abbrlink = String(data.abbrlink)
  if (data.lang) out.lang = data.lang
  return out
}

function flattenCats(cats) {
  const result = []
  for (const c of cats) {
    if (Array.isArray(c)) {
      const path = c.filter(Boolean).map(s => String(s).trim()).join("/")
      if (path) result.push(path)
    } else if (typeof c === "string" && c.trim()) result.push(c.trim())
  }
  return result
}

function slugify(name) {
  let s = path.basename(name, ".md")
    .replace(/^【.*?】/, "")
    .replace(/[《》<>:"\/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
  if (!s) s = "post-" + Date.now()
  return s.substring(0, 80)
}

let ok = 0, err = 0
const files = fs.readdirSync(SRC).filter(f => f.endsWith(".md"))

for (const file of files) {
  try {
    const srcPath = path.join(SRC, file)
    const raw = fs.readFileSync(srcPath, "utf-8")
    const parsed = matter(raw)
    const newFm = convertFrontmatter(parsed.data)
    const newBody = convertTags(parsed.content)
    const slug = newFm.abbrlink || slugify(file)
    const outFile = `${slug}.md`
    const outPath = path.join(DST, outFile)
    const newContent = matter.stringify(newBody, newFm)
    fs.writeFileSync(outPath, newContent, "utf-8")
    console.log(`  OK  ${file} → ${outFile}`)
    ok++
  } catch (e) {
    console.error(`  ERR ${file}: ${e.message}`)
    err++
  }
}

console.log(`\nDone: ${ok} OK, ${err} errors`)
