---
title: 用Vercel部署Cap
abbrlink: '38308'
published: 2026-07-07 07:29:18
description: ""
image: ""
tags: []
category: 
  - 教程
draft: true
lang: ""
---



# 前言

## 什么是`Cap`

**`Cap` 是一种基于工作量证明（`PoW`）的轻量级开源验证码系统，旨在替代传统 CAPTCHA，实现高效、安全且隐私友好的人机验证。**

## 工作

本来它仅支持 Docker 和 Railway 部署，但是现在掌握了 AI 神力，就可以将其移植到 Vercel 上了。



# 前置准备

- [这个Github仓库](https://github.com/Catwb/Cap-For-Serverless)
- 一个 Vercel 账号
- 一个 [Upstash](https://console.upstash.com/) 账号（可选）
- 自己的域名
- 手

> 注意：不用看仓库里面的 Readme ，看我这篇文章就行。

# 正文

## 构建

首先，Fork 这个仓库到自己名下，并导入到新的 Vercel 项目。

- `Framework Preset` 选择 `other`

- `Output Directory` 输入 `Public`

- 新建环境变量：`ADMIN_KEY`。

  > 该变量值指的是你的后台密码，**至少 12 位**。

然后，新建数据库 **Neon Postgres：** 在项目 **Dashboard** → **Storage** → **Create** → **Neon**，并将其绑定到你刚刚新建的项目下，重新部署。

> 由于 `vercel.app` 在大陆的不可用性，你需要绑定一个自己的域名。

如果你要用 `Upstash`：点击上面那个链接，创建账号，新建数据库，保存 `REST URL` 和 `REST Token`；环境变量新建如下 ↓

| 变量                       | 类型   |                          |
| -------------------------- | ------ | ------------------------ |
| `UPSTASH_REDIS_REST_URL`   | Secret | Upstash Redis REST URL   |
| `UPSTASH_REDIS_REST_TOKEN` | Secret | Upstash Redis REST Token |

重新部署即可。

## 登陆

构建完毕，直接访问绑定域名，会发现面板内容无法加载，要先访问 `/login.html` 路径，输入你的密码，再回到原来的面板，就可以正常显示和创建 Key 了。

## BUG 处理方案

开个 issue ？
