import type {
	AbbrlinkConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "龙星划空",
	subtitle: "朝花夕拾",
	lang: "zh_CN",
	background: "url(https://api.furry.ist/furry-img/?mode=auto)",
	themeColor: {
		hue: 250,
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
	// fonts: {
	// 	heading: "'LXGW WenKai', system-ui, sans-serif",
	// 	body: "'LXGW WenKai', system-ui, sans-serif",
	// 	code: "'LXGW WenKai', Menlo, monospace",
	// },
	footer: {
		enable: true,
		content: [
			"本站由 [绮曜](/) 使用 [Stellar](https://github.com/xaoxuu/hexo-theme-stellar) 主题（略微由我更改）创建。",
			"本博客所有文章除特别声明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议，转载请注明出处。",
			"[Copyright © since 2024-2025 绮曜](/)",
			'<div id="StaticBadge"><a target="_blank" rel="noopener" href="https://icp.gov.moe/?keyword=20240822"><img alt="Static Badge" src="https://img.shields.io/badge/萌ICP备-20240822号-green?style=for-the-badge&logo=https%3A%2F%2Ficp.gov.moe%2Fmoe-icon.zip&logoSize=auto&labelColor=FF1485&link=https%3A%2F%2Ficp.gov.moe%2F%3Fkeyword%3D20240822"></a> <a target="_blank" rel="noopener" href="https://astro.build/"><img alt="Static Badge" src="https://img.shields.io/badge/Powered_By-Astro-blue?style=for-the-badge"></a> <a target="_blank" rel="noopener" href="https://github.com/saicaca/fuwari"><img alt="Static Badge" src="https://img.shields.io/badge/Theme-Furrity_by_Qiyao-blue?style=for-the-badge"></a> <a target="_blank" rel="noopener" href="https://www.netlify.com/"><img alt="Static Badge" src="https://img.shields.io/badge/C_D_N-Netlify-green?style=for-the-badge&logo=netlify&logoSize=auto"></a></div>',
			'<a title="无聊湾 🥱 The Boring Bay" href="https://boringbay.com"><img height="50px" src="https://boringbay.com/api/badge/blog.245179.xyz"></a>',
			"![Netlify Status](https://api.netlify.com/api/v1/badges/c669c5a6-ac66-4f4d-9813-0edd3ed59146/deploy-status)",
			"**感谢访问我的网站**",
			'<div style="font-size: 0.85rem"><span id="timeDate">载入天数...</span> <span id="times">载入时分秒...</span> <script src="https://cdn.245179.xyz/js/runtime.js"></script></div>',
			'<a style="text-decoration:none;color:#51c4d3;" href="https://travel.moe/go.html" title="异次元之旅-跃迁-我们一起去萌站成员的星球旅行吧！" target="_blank"><img src="https://travel.moe/images/icon/icon64.png" style="width:24px;height:24px">异次元之旅</a> | <a href="https://www.travellings.cn/go.html" target="_blank" rel="noopener" title="开往-友链接力"><img src="https://www.travellings.cn/assets/logo.gif" alt="开往-友链接力" width="100"></a>',
			"![count](https://count.getloli.com/@Qiyao?name=Qiyao&theme=minecraft&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto)",
		],
	},
	sidebar: {
		components: [
			{ type: "profile" },
			{ type: "categories" },
			{ type: "tags" },
		],
	},
	twikoo: {
		enable: true,
		envId: "https://twikoo.245179.xyz/.netlify/functions/twikoo",
		region: "",
		lang: "zh-CN",
		cdn: "https://registry.npmmirror.com/twikoo/1.7.12/files/dist/twikoo.all.min.js",
		css: "https://cdn.245179.xyz/css/twikoo.css",
	},
	// custom: {
	// 	head: [
	// 		'<link rel="stylesheet" href="https://cdn.245179.xyz/LXGWWenKai-Medium/result.css" />',
	// 		'<link rel="stylesheet" href="https://cdn.245179.xyz/LXGWWenKai-Regular/result.css" />',
	// 		'<link rel="stylesheet" href="https://cdn.245179.xyz/css/b.css">',
	// 		'<link rel="stylesheet" href="https://cdn.245179.xyz/ChillRoundFRegular/result.css" />',
	// 		'<link rel="stylesheet" href="https://cdn.245179.xyz/ChillRoundFBold/result.css" />',
	// 		'<script defer src="https://umami.245179.xyz/script.js" data-website-id="abd4c32a-198e-44de-859f-715cfc95725d"></script>',
	// 	],
	// },
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

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：部分样式（如背景色）会被覆盖，详见 astro.config.mjs
	// 请选择一个深色主题，因为本博客主题目前仅支持深色背景
	theme: "github-dark",
};
