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
		hue: 192,
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
			"本站由 [绮曜](/) 创建。",
			"本博客所有文章除特别声明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议，转载请注明出处。",
			"Copyright © 2024-2025 绮曜",
			"Powered by [Astro](https://astro.build) & [Fuwari](https://github.com/saicaca/fuwari)",
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
					url: "/page/fcircle/",
				},
				{
					name: "关于",
					url: "/about/",
				},
				{
					name: "加密",
					url: "/page/encrypt/",
				},
				{
					name: "更多",
					url: "/page/more/",
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
