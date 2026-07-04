# 龙星划空

基于 [Fuwari](https://github.com/saicaca/fuwari) 定制，融合 Stellar 标签插件生态的 Astro 静态博客模板。

## ✨ Features

- [x] Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)
- [x] Smooth animations and page transitions
- [x] Light / dark mode
- [x] Customizable theme colors & banner
- [x] Responsive design
- [x] Search functionality with [Pagefind](https://pagefind.app/)
- [x] Stellar tag-plugin compatibility (box, note, folding, button, frame, poetry, paper, tabs)
- [x] Pinned posts
- [x] Abbrlink support (CRC16/CRC32)
- [x] Multi-level dropdown navbar
- [x] Table of contents
- [x] RSS feed
- [x] Novel / Fiction support — dedicated content type with chapters, series, characters, and reading mode

## 🚀 Getting Started

1. Install [pnpm](https://pnpm.io): `npm install -g pnpm`
2. Install dependencies: `pnpm install`
3. Edit config file `src/config.ts` to customize your blog
4. Run `pnpm new-post <filename>` to create a new post
5. Start dev server: `pnpm dev`

## 📝 Frontmatter of Posts

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
pinned: true        # Pin to top of list
abbrlink: 12345     # Optional custom short link ID
lang: jp            # Set only if post language differs from site language
---
```

## 🧩 Stellar Tag Plugins

Use triple-colon container directives in markdown:

### Box — colored block with optional title
```markdown
:::box{color="blue" title="Info"}
Content here
:::
```

### Note — styled note with color accent
```markdown
:::note{color="cyan" title="Note"}
Note content
:::
```

### Folding — collapsible section
```markdown
:::folding{title="Click to expand" color="yellow" open=true}
Hidden content
:::
```

### Button
```markdown
::button{color="red" text="Click Me" url="https://example.com"}
```

### Frame — bordered image frame
```markdown
:::frame
![alt](image.jpg)
:::
```

### Poetry — verse block
```markdown
:::poetry{title="静夜思" author="李白"}
床前明月光，
疑是地上霜。
:::
```

### Paper — article with delimiters
```markdown
:::paper{style="underline"}
---
Body content
---
## Notes
Footer notes
:::
```

### Tabs — raw HTML (use directly in markdown)
```html
<div class="tag-plugin tabs" data-tabs-name="example" data-tabs-active="0">
  <div class="nav-tabs raw">
    <button class="tab active">Tab 1</button>
    <button class="tab">Tab 2</button>
  </div>
  <div class="tab-panel" data-active>
    Content for tab 1
  </div>
  <div class="tab-panel">
    Content for tab 2
  </div>
</div>
```

## 📖 Writing Novels / Fiction

### Directory Structure
```
src/content/
├── novels/
│   └── your-novel-slug/
│       ├── index.md          # Novel overview
│       ├── 01-chapter.md     # Chapter 1
│       └── 02-chapter.md     # Chapter 2
└── characters/
    └── character-name.md     # Character profile
```

See existing novels in `src/content/novels/` for examples.

## ⚡ Commands

| Command | Action |
|:---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server at `localhost:4321` |
| `pnpm build` | Build to `./dist/` |
| `pnpm preview` | Preview production build |
| `pnpm new-post <filename>` | Create a new post |
| `pnpm astro ...` | Run Astro CLI commands |

## 📄 License

MIT
