import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xa001 : 0);
    }
  }
  return (crc ^ 0xffff) & 0xffff;
}

function computeAbbrlink(title, dateStr, alg = "crc16", rep = "dec") {
  const raw = title + dateStr;
  const hash = alg === "crc32" ? crc32(raw) : crc16(raw);
  return rep === "hex" ? hash.toString(16) : hash.toString(10);
}

const postsDir = join(__dirname, "..", "src", "content", "posts");
const files = readdirSync(postsDir).filter(f => extname(f) === ".md");

let updated = 0;
for (const file of files) {
  const fp = join(postsDir, file);
  let content = readFileSync(fp, "utf-8");
  if (!content.startsWith("---")) continue;
  const end = content.indexOf("---", 3);
  if (end === -1) continue;
  const frontmatter = content.slice(0, end + 3);
  const body = content.slice(end + 3);

  if (frontmatter.includes("abbrlink:")) continue;

  const title = frontmatter.match(/^title:\s*(.+)/m)?.[1]?.replace(/["']/g, "").trim();
  const published = frontmatter.match(/^published:\s*(.+)/m)?.[1]?.trim();
  if (!title || !published) {
    console.log(`  skip ${file}: missing title or published`);
    continue;
  }

  const dateObj = new Date(published);
  const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
  const abbrlink = computeAbbrlink(title, dateStr);

  const newFrontmatter = frontmatter.replace(/(^title:.+\n)/m, `$1abbrlink: '${abbrlink}'\n`);
  writeFileSync(fp, newFrontmatter + body, "utf-8");
  console.log(`  ${file} -> abbrlink: ${abbrlink}`);
  updated++;
}

console.log(`Done. ${updated} file(s) updated.`);
