/* 脚本：快速创建文章/页面 */

import fs from "fs"
import path from "path"
import readline from "readline"

function getDateTime() {
  const now = new Date()
  return now.toISOString()
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function crc16(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i)
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xa001 : 0)
    }
  }
  return (crc ^ 0xffff) & 0xffff
}

function computeAbbrlink(title, dateStr, alg = "crc16", rep = "dec") {
  const raw = title + dateStr
  const hash = alg === "crc32" ? crc32(raw) : crc16(raw)
  return rep === "hex" ? hash.toString(16) : hash.toString(10)
}

function crc32(str) {
  let crc = 0xffffffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i)
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function parseArgs(args) {
  const result = { flags: {} }
  let i = 0
  while (i < args.length) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2)
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        result.flags[key] = args[i + 1]
        i += 2
      } else {
        result.flags[key] = true
        i++
      }
    } else {
      if (!result.type) result.type = args[i]
      else if (!result.title) result.title = args[i]
      i++
    }
  }
  return result
}

async function main() {
  const args = process.argv.slice(2)
  const parsed = parseArgs(args)

  let postType = parsed.type || ""
  if (!["post", "page", "p", "w"].includes(postType)) {
    console.log("\n📝 选择类型：")
    console.log("  1) post  - 创建文章")
    console.log("  2) page  - 创建页面")
    console.log("")
    const choice = await ask("请选择 (1/2): ")
    postType = choice === "2" || choice === "page" ? "page" : "post"
  }

  const isPost = postType === "post" || postType === "p"
  const targetDir = isPost ? "./src/content/posts/" : "./src/content/spec/"

  // 获取标题
  let title = parsed.title || ""
  if (!title) {
    title = await ask(`\n📌 ${isPost ? "文章" : "页面"}标题: `)
  }
  if (!title) {
    console.error("❌ 标题不能为空")
    process.exit(1)
  }

  // 获取标签（仅文章）
  let tags = parsed.flags.tags || ""
  if (isPost && !tags) {
    tags = await ask("🏷️  标签 (逗号分隔，可留空): ")
  }

  // 获取分类（仅文章）
  let category = parsed.flags.category || ""
  if (isPost && !category) {
    category = await ask("📁 分类 (可留空): ")
  }

  // 获取描述
  let description = parsed.flags.desc || ""
  if (!description) {
    description = await ask("📝 描述 (可留空): ")
  }

  // 获取密码（仅文章）
  let password = parsed.flags.password || ""
  let passwordHint = parsed.flags.hint || ""
  if (isPost) {
    if (!password) {
      password = await ask("🔒 密码 (密码保护，留空则不加密): ")
    }
    if (password && !passwordHint) {
      passwordHint = await ask("💡 密码提示 (可留空): ")
    }
  }

  // 创建文件
  const slug = toSlug(title)
  const frontmatter = getDateTime()

  const tagsArray = tags
    ? `[${tags.split(",").map((t) => `"${t.trim()}"`).join(", ")}]`
    : "[]"

  const dateObj = new Date(frontmatter)
  const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`
  const abbrlink = computeAbbrlink(title, dateStr)

  const lines = [`---`, `title: ${title}`, `published: ${frontmatter}`, `abbrlink: '${abbrlink}'`]
  if (description) lines.push(`description: ${description}`)
  if (password) lines.push(`password: ${password}`)
  if (passwordHint) lines.push(`passwordHint: ${passwordHint}`)
  if (tags) lines.push(`tags: ${tagsArray}`)
  if (category) {
    const cats = category.split(",").map((c) => c.trim()).filter(Boolean)
    if (cats.length === 1) {
      lines.push(`category: "${cats[0]}"`)
    } else {
      lines.push(`category:`, ...cats.map((c) => `  - ${c}`))
    }
  }
  lines.push(`draft: false`, `pinned: false`, `---`, ``)
  const content = lines.join("\n")

  // 确定文件路径
  let filePath
  if (isPost) {
    const parts = slug.split("/")
    if (parts.length > 1) {
      const dir = path.join(targetDir, path.dirname(slug))
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      filePath = path.join(targetDir, slug, "index.md")
    } else {
      filePath = path.join(targetDir, `${slug}.md`)
    }
  } else {
    filePath = path.join(targetDir, `${slug}.md`)
  }

  if (fs.existsSync(filePath)) {
    console.error(`\n❌ 文件已存在: ${filePath}`)
    process.exit(1)
  }

  const dirPath = path.dirname(filePath)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  fs.writeFileSync(filePath, content)

  console.log(`\n✅ 创建成功: ${filePath}`)

  if (isPost) {
    console.log(`\n💡 提示:`)
    console.log(`   - 在 public/images/ 下放文章封面图`)
    console.log(`   - 图片名与文章 slug 相同即可自动匹配`)
  }

  rl.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
