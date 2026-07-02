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
	title: "Fuwari",
	subtitle: "Demo Site",
	lang: "zh_CN", // 语言代码，例如 'en'、'zh_CN'、'ja' 等
	background: "url(https://api.furry.ist/furry-img/?mode=auto)", // 网站全局背景，设置后 Hero 区域变为透明，透出此背景
	themeColor: {
		hue: 250, // 主题色色调，0 到 360。例如红色: 0，青色: 200，蓝色: 250，粉色: 345
		fixed: false, // 隐藏主题色选择器
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // 相对于 /src 目录。如果以 '/' 开头则相对于 /public 目录
		position: "center", // 等同 object-position，仅支持 'top'、'center'、'bottom'。默认为 'center'
		credit: {
			enable: false, // 显示横幅图片的版权信息
			text: "", // 版权文字
			url: "", // （可选）原作品或艺术家页面的 URL 链接
		},
	},
	toc: {
		enable: true, // 在文章右侧显示目录
		depth: 2, // 目录最大标题层级，1 到 3
	},
	favicon: [
		// 留空使用默认 favicon
		{
			src: "/favicon/favicon-light-32.png",
			sizes: "32x32",
			theme: "light",
		},
		{
			src: "/favicon/favicon-light-128.png",
			sizes: "128x128",
			theme: "light",
		},
		{
			src: "/favicon/favicon-light-180.png",
			sizes: "180x180",
			theme: "light",
		},
		{
			src: "/favicon/favicon-light-192.png",
			sizes: "192x192",
			theme: "light",
		},
		{
			src: "/favicon/favicon-dark-32.png",
			sizes: "32x32",
			theme: "dark",
		},
		{
			src: "/favicon/favicon-dark-128.png",
			sizes: "128x128",
			theme: "dark",
		},
		{
			src: "/favicon/favicon-dark-180.png",
			sizes: "180x180",
			theme: "dark",
		},
		{
			src: "/favicon/favicon-dark-192.png",
			sizes: "192x192",
			theme: "dark",
		},
		{
			src: "/favicon/favicon.webp",
		},
	],
	// fonts: {
	// 	google: ["Noto Sans SC", "Noto Serif SC"],
	// 	heading: "'Noto Sans SC', sans-serif",
	// 	body: "'Noto Serif SC', serif",
	// 	code: "'JetBrains Mono', monospace",
	// },
	// footer: {
	// 	enable: true,
	// 	content: ["© 2026 **My Blog**", "Powered by [Astro](https://astro.build) & [Fuwari](https://github.com/saicaca/fuwari)"],
	// },
	// sidebar: {
	// 	components: [
	// 		{ type: "profile" },
	// 		{ type: "categories" },
	// 		{ type: "tags" },
	// 		{ type: "text", title: "About", content: "This blog is built with **Astro** and **Fuwari** theme." },
	// 	],
	// },
	// twikoo: {
	// 	enable: true,
	// 	envId: "https://your-twikoo-deployment.vercel.app",
	// 	region: "",            // "ap-guangzhou" for Tencent Cloud, empty for Vercel
	// 	lang: "zh-CN",         // optional, defaults to site language
	// 	cdn: "https://your-cdn.com/twikoo.all.min.js",  // optional, defaults to jsdelivr
	// 	css: "https://your-cdn.com/twikoo-custom.css",  // optional, custom stylesheet
	// },
	// custom: {
	// 	css: [
	// 		".some-class { color: red; }",
	// 		"https://your-cdn.com/twikoo-custom.css",
	// 	],
	// 	js: [
	// 		"console.log('site loaded')",
	// 	],
	// 	head: [
	// 		'<meta name="custom" content="value">',
	// 	],
	// },
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Friends,
		LinkPreset.Archive,
		LinkPreset.Categories,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/saicaca/fuwari",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg", // 相对于 /src 目录。如果以 '/' 开头则相对于 /public 目录
	name: "Lorem Ipsum",
	bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	links: [
		{
			name: "Twitter",
			icon: "fa6-brands:twitter", // 访问 https://icones.js.org/ 查看图标代码
			// 如果对应图标集未安装，需要先安装
			// `pnpm add @iconify-json/<图标集名称>`
			url: "https://twitter.com",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://store.steampowered.com",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/saicaca/fuwari",
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
