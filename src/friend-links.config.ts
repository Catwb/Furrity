import type { FriendLinkGroup } from "./types/config";

export const friendLinkGroups: FriendLinkGroup[] = [
	{
		title: "推荐博客",
		collapsed: false,
		links: [
			{
				name: "Fuwari",
				url: "https://github.com/saicaca/fuwari",
				avatar: "https://raw.githubusercontent.com/saicaca/fuwari/main/public/favicon.svg",
				description: "A static blog template built with Astro",
				color: "#f0eaff",
			},
		],
	},
];
