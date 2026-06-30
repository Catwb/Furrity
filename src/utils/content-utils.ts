import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils";
import type { CategoryNode } from "@/types/config";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryTree(): Promise<CategoryNode[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const root: CategoryNode[] = [];
	let uncategorizedCount = 0;

	allBlogPosts.forEach((post) => {
		const cats = post.data.category;
		if (!cats || cats.length === 0) {
			uncategorizedCount++;
			return;
		}

		cats.forEach((cat) => {
			const segments = cat.split("/").map(s => s.trim()).filter(s => s);
			if (segments.length === 0) return;

			let currentLevel = root;
			let fullPath = "";
			for (let i = 0; i < segments.length; i++) {
				const seg = segments[i];
				fullPath = fullPath ? `${fullPath}/${seg}` : seg;

				let node = currentLevel.find(n => n.name === seg);
				if (!node) {
					node = {
						name: seg,
						fullName: fullPath,
						count: 0,
						totalCount: 0,
						children: [],
						url: getCategoryUrl(fullPath),
						depth: i,
					};
					currentLevel.push(node);
				}
				node.totalCount++;
				if (i === segments.length - 1) {
					node.count++;
				}
				currentLevel = node.children;
			}
		});
	});

	function sortNodes(nodes: CategoryNode[]) {
		nodes.sort((a, b) =>
			a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
		);
		nodes.forEach((n) => sortNodes(n.children));
	}
	sortNodes(root);

	if (uncategorizedCount > 0) {
		root.push({
			name: i18n(I18nKey.uncategorized),
			fullName: i18n(I18nKey.uncategorized),
			count: uncategorizedCount,
			totalCount: uncategorizedCount,
			children: [],
			url: getCategoryUrl(null),
			depth: 0,
		});
	}

	return root;
}

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post) => {
		const cats = post.data.category;
		if (!cats || cats.length === 0) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		cats.forEach((cat) => {
			const categoryName = cat.trim();
			if (!categoryName) return;
			count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
		});
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
