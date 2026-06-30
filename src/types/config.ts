import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

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
	sidebar?: {
		components: SidebarComponent[];
	};
	custom?: CustomCodeConfig;
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
};

export type FooterConfig = {
	enable: boolean;
	content?: string;
};

export type SidebarComponent = {
	type: "profile" | "categories" | "tags" | "text";
	title?: string;
	content?: string;
	sticky?: boolean;
};

export type CustomCodeConfig = {
	css?: string;
	js?: string;
	head?: string;
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
	Categories = 3,
	Novels = 4,
	Characters = 5,
}

export type NavBarLink = {
	name: string;
	url: string;
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
