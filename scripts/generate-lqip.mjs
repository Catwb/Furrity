import sharp from "sharp";
import { existsSync, writeFileSync } from "fs";
import { readdir } from "fs/promises";
import { join, relative } from "path";

const outputPath = "src/constants/lqips.json";
const publicDir = "public";

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (/\.(jpg|jpeg|png|webp|avif|gif)$/i.test(entry.name)) {
      yield full;
    }
  }
}

async function main() {
  const lqips = {};
  const dirs = ["public", "src/assets", "src/images"];

  for (const dir of dirs) {
    if (existsSync(dir)) {
      for await (const file of walk(dir)) {
        try {
          const { data } = await sharp(file)
            .resize(1, 1, { fit: "fill" })
            .raw()
            .toBuffer({ resolveWithObject: true });
          const hex = (c) => c.toString(16).padStart(2, "0");
          let key;
          if (dir === "public") {
            key = "/" + relative("public", file).replace(/\\/g, "/");
          } else {
            key = relative("src", file).replace(/\\/g, "/");
          }
          lqips[key] = `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`;
        } catch (e) {
          console.warn(`[LQIP] Skipped: ${file}`);
        }
      }
    }
  }

  writeFileSync(outputPath, JSON.stringify(lqips, null, 2));
  console.log(`[LQIP] Generated ${Object.keys(lqips).length} entries → ${outputPath}`);
}

main();
