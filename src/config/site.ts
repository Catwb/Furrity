import type {
	AbbrlinkConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	MetingConfig,
	NavBarConfig,
	OutdateWarningConfig,
	ProfileConfig,
	SiteConfig,
} from "../types/config";
import { LinkPreset } from "../types/config";

export const siteConfig: SiteConfig = {
	title: "龙星划空",
	subtitle: "朝花夕拾",
	lang: "zh_CN",
	background: "url(https://api.furry.ist/furry-img/?mode=auto)",
	themeColor: {
		hue: 35,
		fixed: false,
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [
		{
			src: "/favicon/favicon.webp",
		},
	],
	fonts: {
		heading: "'LXGW WenKai Medium', 'LXGW WenKai', system-ui, sans-serif",
		body: "'LXGW WenKai', system-ui, sans-serif",
		bold: "'LXGW WenKai Medium', 'LXGW WenKai', system-ui, sans-serif",
	},
	footer: {
		enable: true,
		content: [
			"本站由 [绮曜](/) 使用 Furrity 主题（基于 Fuwari 主题）创建。",
			"本博客所有文章除特别声明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议，转载请注明出处。",
			"[Copyright © since 2024-2025 绮曜](/)",
			'<div id="StaticBadge"><a target="_blank" rel="noopener" href="https://icp.gov.moe/?keyword=20240822"><img alt="Static Badge" loading="lazy" src="https://img.shields.io/badge/萌ICP备-20240822号-green?style=for-the-badge&cacheSeconds=31536000&logo=https%3A%2F%2Ficp.gov.moe%2Fmoe-icon.zip&logoSize=auto&labelColor=FF1485&link=https%3A%2F%2Ficp.gov.moe%2F%3Fkeyword%3D20240822"></a> <a target="_blank" rel="noopener" href="https://astro.build/"><img alt="Static Badge" loading="lazy" src="https://img.shields.io/badge/Powered_By-Astro-blue?style=for-the-badge&cacheSeconds=31536000"></a> <a target="_blank" rel="noopener" href="https://github.com/saicaca/fuwari"><img alt="Static Badge" loading="lazy" src="https://img.shields.io/badge/Theme-Furrity_by_Qiyao-blue?style=for-the-badge&cacheSeconds=31536000"></a> <a target="_blank" rel="noopener" href="https://www.netlify.com/"><img alt="Static Badge" loading="lazy" src="https://img.shields.io/badge/C_D_N-Netlify-green?style=for-the-badge&cacheSeconds=31536000&logo=netlify&logoSize=auto"></a></div>',
			'<a title="无聊湾 🥱 The Boring Bay" href="https://boringbay.com"><img alt="无聊湾 Badge" width="300" height="59" loading="lazy" src="https://boringbay.com/api/badge/blog.245179.xyz"></a>',
			"**感谢访问我的网站**",
			'<div style="font-size: 0.85rem"><span id="timeDate">载入天数...</span> <span id="times">载入时分秒...</span> <script src="https://cdn.245179.xyz/js/runtime.js"></script></div>',
			'<a style="text-decoration:none;color:#51c4d3;" href="https://travel.moe/go.html" title="异次元之旅-跃迁-我们一起去萌站成员的星球旅行吧！" target="_blank"><img alt="异次元之旅" src="https://travel.moe/images/icon/icon64.png" loading="lazy" style="width:24px;height:24px">异次元之旅</a> | <a href="https://www.travellings.cn/go.html" target="_blank" rel="noopener" title="开往-友链接力"><img src="https://www.travellings.cn/assets/logo.gif" alt="开往-友链接力" loading="lazy" width="160" height="40"></a>',
			'<img alt="count" loading="lazy" src="https://count.getloli.com/@Qiyao?name=Qiyao&theme=minecraft&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto" />',
		],
	},
	sidebar: {
		components: [
			{ type: "profile" },
			{ type: "music" },
			{ type: "site-status" },
			{ type: "categories" },
			{ type: "tags" },
		],
	},
	twikoo: {
		enable: true,
		envId: "https://twikoo.245179.xyz/.netlify/functions/twikoo",
		region: "",
		lang: "zh-CN",
		cdn: "https://testingcf.jsdelivr.net/gh/Catwb/blog-js@HEAD/twikoo/twikoo.all.min.js", //"https://registry.npmmirror.com/twikoo/1.7.14/files/dist/twikoo.all.min.js",
		css: "https://cdn.245179.xyz/css/twikoo.css",
	},
	meting: {
		enable: true,
		api: "https://meting.furwolf.com/api?server=:server&type=:type&id=:id&auth=:auth&r=:r",
		fixed: {
			enable: true,
			server: "netease",
			type: "playlist",
			id: "6851447315",
			autoplay: false,
			volume: 0.8,
			theme: "#1BCDFC",
			loop: "all",
			order: "list",
			"list-max-height": "320px",
			"list-folded": true,
			preload: "none",
		},
	},
	lazyload: {
		enable: false,
		cdn: "https://unpkg.com/vanilla-lazyload@19.1.3/dist/lazyload.iife.js",
		threshold: 200,
	},
	preconnect: [
		"https://cdn.245179.xyz",
		"https://unpkg.com",
	],
	custom: {
		head: [
			'<link rel="preload" href="https://cdn.245179.xyz/LXGWWenKai-Medium/result.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" /><noscript><link rel="stylesheet" href="https://cdn.245179.xyz/LXGWWenKai-Medium/result.css" /></noscript>',
			'<link rel="preload" href="https://cdn.245179.xyz/LXGWWenKai-Regular/result.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" /><noscript><link rel="stylesheet" href="https://cdn.245179.xyz/LXGWWenKai-Regular/result.css" /></noscript>',
		],
	},
	analytics: {
		enable: true,
		url: "https://analyse.245179.xyz/tracker.min.js",
		websiteId: "blog.245179.xyz",
	},
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Friends,
		{
			name: "页面",
			children: [
				{
					name: "博客",
					url: "/",
				},
				{
					name: "朋友圈",
					url: "/fcircle/",
				},
				{
					name: "关于",
					url: "/about/",
				},
				{
					name: "小说",
					url: "/novels/",
				},
				{
					name: "说说",
					url: "/shuoshuo/",
				},
				{
					name: "加密",
					url: "/encrypt/",
				},
				{
					name: "状态面板",
					url: "https://status.245179.xyz/",
					external: true,
				},
				{
					name: "音乐馆",
					url: "https://qymusic.netlify.app/",
					external: true,
				},
			],
		},
		LinkPreset.Archive,
		LinkPreset.Categories,
		{
			name: "链接",
			children: [
				{
					name: "GitHub",
					url: "https://github.com/Catwb",
					external: true,
				},
				{
					name: "RSS",
					url: "/rss.xml",
				},
			],
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg",
	name: "绮曜",
	bio: "人生近看是悲剧，远看是喜剧",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Catwb",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const outdateWarningConfig: OutdateWarningConfig = {
	enable: true,
	thresholdDays: 180,
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：部分样式（如背景色）会被覆盖，详见 astro.config.mjs
	// 请选择一个深色主题，因为本博客主题目前仅支持深色背景
	theme: "github-dark",
};
