---
title: dsh-solution-ledger：一个便于跨对话同步错误及解决问题的dsh插件
published: 2026-11-21T08:58:50.354Z
abbrlink: '43531'
category:
  - 项目
draft: false
pinned: false
---



# 开始

仓库地址：https://github.com/Catwb/dsh-solution-ledger



# 为什么写这个插件出来？

那会在用dsh的时候，在同工作区下开了个新的会话，然后开工，在观察agent工作时，我发现一个问题，`package.json`里面写了开启预览服务器的命令`pnpm dev`，但在`workspace-write`的权限下，无法正常运行。但实际上这个问题在其他会话也有过，只是在这个会话又忘记了罢了，然后就接着消耗tokens告诉我为什么不能使用这个命令。很明显这是在浪费tokens。



# 如何运作？

在第一次报错会对报错信息和账本内容进行比对，如果匹配成功，会在报错信息下新增插件的提醒信息，正如下面的。

```
Error: grep search failed (exit 2): rg: D:\Deepseek Harness\resources\app.asar\dsh\dist: IO error for operation on D:\Deepseek Harness\resources\app.asar\dsh\dist: 系统找不到指定的路径。 (os error 3)
// ↑ 原来的报错 ↓ 新增的信息
[solution-ledger] Known problem match (score 5): 沙箱内 pnpm 与 node_modules 链接操作会被拒，需一次性 danger-full-access
Resolution: 这些都是沙箱对工作区外路径（D:\.pnpm-store）与 reparse point 写入的真实限制，与项目代码无关；同一个沙箱还会让 pnpm dev 的整体启动失败（见 mwp7a4mm-89na）。处理办法：确需改依赖或在 node_modules 内建/改名链接、以及要正常跑 dev 时，用一次 danger-full-access 重试同一操作即可（实测 pnpm store 访问、…
Verify: pnpm add <pkg> --store-dir D:\.pnpm-store\v11 在 workspace-write 下必报 ERR_SQLITE_ERROR；同一条命令加 danger-full-access 可正常完成安装。
(id mwp7a4n9-xsx4; call solution_search for the full entry, or solution_log with replaces to correct it)
```

告诉模型之前有其他模型已经发现了问题并给出了合理的解决方案，可以进行参考。

相比之下，与其一直消耗大量tokens死磕同一个问题，不如用一点tokens读一下前人是怎么去做的，方便解决问题。
