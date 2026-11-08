import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	background?: string;
	banner: {
		enable: boolean;
		src?: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
	fonts?: FontConfig;
	footer?: FooterConfig;
	twikoo?: TwikooConfig;
	meting?: MetingConfig;
	sidebar?: {
		left: SidebarComponent[];
		right: SidebarComponent[];
	};
	analytics?: AnalyticsConfig;
	lazyload?: {
		enable?: boolean;
		cdn?: string;
		threshold?: number;
	};
	custom?: CustomCodeConfig;
	preconnect?: (string | { href: string; crossorigin?: string })[];
	canonical?: {
		/** SEO 权威域名（主站），canonical / og:url 统一指向它 */
		origin: string;
	};
	abbrlink?: AbbrlinkConfig;
	outdateWarning?: OutdateWarningConfig;
	island?: IslandConfig;
};

/**
 * 灵动岛 / 流体云配置
 *
 * mode:
 *   "single" —— 同一时刻只显示优先级最高的一条（灵动岛式，推荐）
 *   "stack"  —— 最多同时显示 maxStack 条，多余的折成 "+N"（流体云式）
 * size 等视觉细节见 DynamicIsland.astro，这里只留开关和配额。
 */
export type IslandProvider = "player" | "loader" | "search" | "nav" | "notice";

export type IslandConfig = {
	enable: boolean;
	mode: "single" | "stack";
	/** stack 模式下最多同时展示几条，超出折叠为 +N */
	maxStack: number;
	/**
	 * 岛自身不活跃（如音乐暂停）后，等多久收起。0 = 立刻收起。
	 *
	 * 这是"岛的任务"活跃度，不是用户有没有在操作：
	 * 音乐放着你一直不动，岛也一直显示；一暂停，岛就自己收起来。
	 */
	inactiveGraceMs?: number;
	providers: IslandProvider[];
};

export type TwikooConfig = {
	enable: boolean;
	envId: string;
	region?: string;
	lang?: string;
	cdn?: string;
	css?: string;
};

export type FontConfig = {
	google?: string[];
	heading?: string;
	body?: string;
	code?: string;
	bold?: string;
};

export type FooterConfig = {
	enable: boolean;
	content?: string[];
};

export type AbbrlinkConfig = {
	alg?: "crc16" | "crc32";
	rep?: "dec" | "hex";
};

export type MetingConfig = {
	enable: boolean;
	api?: string;
	fixed: {
		enable: boolean;
		server: string;
		type: string;
		id: string;
		autoplay?: boolean;
		volume?: number;
		theme?: string;
		loop?: string;
		order?: string;
		"list-max-height"?: string;
		"list-folded"?: boolean;
		preload?: string;
	};
};

export type SidebarComponent = {
	type: "profile" | "categories" | "tags" | "site-status" | "text" | "music";
	title?: string;
	content?: string;
	sticky?: boolean;
};

export type AnalyticsConfig = {
	enable: boolean;
	url: string;
	websiteId: string;
};

export type CustomCodeConfig = {
	css?: string[];
	js?: string[];
	head?: string[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export type OutdateWarningConfig = {
	enable: boolean;
	thresholdDays: number;
};

export type FriendLink = {
	name: string;
	url: string;
	avatar?: string;
	description?: string;
	color?: string;
};

export type FriendLinkGroup = {
	title: string;
	collapsed?: boolean;
	links: FriendLink[];
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
	Categories = 3,
	Novels = 4,
	Characters = 5,
	Friends = 6,
}

export type NavBarLink = {
	name: string;
	url?: string;
	external?: boolean;
	children?: NavBarLink[];
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string[];
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
	/** 代码块超过该行数后，自动折叠第 N 行之后的全部行 */
	autoCollapseLines?: number;
	/** 折叠提示文案的 locale（如 "zh"），默认跟随站点语言 */
	autoCollapseLocale?: string;
};

export type CategoryNode = {
	name: string;
	fullName: string;
	count: number;
	totalCount: number;
	children: CategoryNode[];
	url: string;
	depth: number;
};
