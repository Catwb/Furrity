---
title: Murmur：用 GitHub Issue 写说说的小站
abbrlink: '54726'
published: 2026-11-15T21:20:00+08:00
description: 开个 issue 就是发一条说说，编辑、关闭、删除都跟着变，站点是纯静态的，挂在 GitHub Pages 上。
category:
  - 项目
draft: false
---

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)

# 起因

一直想在博客之外留个地方写点零碎的东西，比如今天吃了什么、路上看到什么。装个 Memos 或者 WordPress 吧，得有一台一直开着的服务器，还要备份、升级、续证书；直接在博客里写吧，发一条「今天吃了拉面」要新建文件、写 frontmatter、提交、推送，动一次 git 的仪式感太重了。

后来想到，GitHub 的 issue 其实什么都有：编辑器、markdown、图片上传、时间线、评论，还有现成的 API。那我干脆把 issue 当数据源，用 Actions 自动构建成一个静态站，扔到 Pages 上。这个项目就是 `Murmur`。

- 站点：[catwb.github.io/MurMur](https://catwb.github.io/MurMur)
- 仓库：[Catwb/MurMur](https://github.com/Catwb/MurMur)

# 怎么用

整套东西的用法特别简单，全在 GitHub 上完成：

| 你做的事 | 站点的变化 |
| --- | --- |
| 开一个 issue（想分类就打个 label） | 多一条说说 |
| 改标题或者正文 | 下次构建时更新 |
| 打上「置顶」的 label | 排到最前面，带个小角标 |
| 关闭 issue | 从站点上消失 |
| 删除 issue | 从站点上消失 |
| 改 `config.yaml` 里的 `authors` | 换显示的名字和头像 |

所以平时发说说就是：打开 GitHub，写 issue，打个 label，关掉页面。等一两分钟 workflow 跑完，Pages 就更新了。

`authors` 那段只影响页面上显示什么，GitHub 的 login 还是原样保留着。没配置的人就自动用 GitHub 的昵称和头像。

```yaml
authors:
  catwb:
    name: "绮曜"
    avatar: "assets/avatars/catwb.svg"
```

# 页面大概什么样

列表页是一条条卡片，按时间倒序排，每张卡片有标题、日期、作者、标签和一小段摘要。顶上有一排标签和月份的筛选，点一下就能筛。筛选状态会写进网址里，所以筛好之后直接把链接发给别人，对方打开看到的是同一个结果。

点进详情页就是完整的 markdown 正文，带作者、标签、上一条下一条，还有一个跳回 GitHub 原 issue 的按钮。正文里的图片点一下能放大。

订阅方面 RSS 和 JSON Feed 都有，用阅读器订阅就行。

# 能改的东西

内容相关的配置都在 `config.yaml` 一个文件里，改完等下一次构建生效。常用的几项：

- 哪些 label 才收录，哪些 label 要排除；
- 哪些 label 算置顶；
- 按创建时间还是更新时间排序，正序还是倒序；
- 最多显示多少条；
- 关掉的 issue 要不要还留在页面上；
- 标题为空的时候，用正文第一行顶上；
- 图片点击放大要不要开。

样式和字体也能改。中文站我推荐用中文网字计划那种远程字体，它按字形分片，浏览器只下当前页面用到的部分，比整包字体小很多。想自己写 CSS 也行，会排在默认样式后面，能盖住默认样式。

# 部署

Fork 一份之后大概四步：

1. 改 `config.yaml`，把 `site.base_url` 换成你自己的 Pages 地址，`site.repo` 填你的仓库，`authors` 填你的昵称和头像；
2. 去 Actions 手动跑一次 build，它会自动创建 `pages` 分支；
3. 到 Settings → Pages，Source 选 Deploy from a branch，分支选 `pages`，目录选根目录；
4. 回仓库开个 issue，打上 label，等一两分钟。

本地想预览的话，`npm install` 之后跑 `npm test` 跑单测，`npm run build:fixture` 用自带的测试数据离线构建一份，再 `npm run serve` 就能在 `http://127.0.0.1:4173/` 看到效果，构建和预览都不用联网。

# 一点想法

这个项目没什么宏大的目标，就是想把「发一条说说」这件事的开销压到最低。数据是你自己的 issue，站点是你自己的仓库，哪天不想用了，把仓库删掉就干净了，不会留下什么要清理的服务。

目前它适合个人量级的使用，几百条以内都挺舒服。正文里的 `#话题` 不会自动变成标签，标签还是得从 label 来；图片也没有镜像，国内直连 GitHub 图床可能会慢一点。这些小毛病我都记在仓库的 README 里了。

如果你也在维护静态博客，又想要一个不用服务器、不用数据库、还能用 RSS 订阅的说说角落，可以 fork 一份玩玩。

- 仓库：[github.com/Catwb/MurMur](https://github.com/Catwb/MurMur)
- 站点：[catwb.github.io/MurMur](https://catwb.github.io/MurMur)
