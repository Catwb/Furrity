import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getNovelChapters, getNovelIndex, getNovelMetas } from "@utils/novel-utils";
import { getChapterUrl } from "@utils/url-utils";
import type { APIContext } from "astro";
import type { CollectionEntry } from "astro:content";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config/site";

type NovelEntry = CollectionEntry<"novels">;

export async function getStaticPaths() {
	const metas = await getNovelMetas();
	return metas.map((meta) => ({
		params: { novel: meta.slug },
		props: { slug: meta.slug },
	}));
}

export async function GET(context: APIContext) {
	const { slug } = context.props;
	const [index, chapters] = await Promise.all([
		getNovelIndex(slug),
		getNovelChapters(slug),
	]);

	if (!index) {
		return new Response(null, { status: 404 });
	}

	const container = await AstroContainer.create();
	const novelTitle = index.data.novelTitle || index.data.title;
	const description = index.data.description || "";
	const baseUrl = (context.site?.href ?? "https://fuwari.vercel.app").replace(/\/$/, "");
	const novelUrl = `${baseUrl}/novels/${slug}/`;

	async function renderEntry(entry: NovelEntry, title: string, desc: string, link: string) {
		if (entry.data.password) {
			return { title, description: desc, link, content: "本章已加密保护，请访问网站查看。" };
		}
		try {
			const { Content } = await render(entry);
			const rawHtml = await container.renderToString(Content);
			const content = sanitizeHtml(rawHtml, {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			});
			return { title, description: desc, link, content };
		} catch {
			return { title, description: desc, link, content: desc };
		}
	}

	const items = [await renderEntry(index, novelTitle, description, `/novels/${slug}/`)];

	for (const ch of chapters) {
		const chTitle = ch.data.chapter !== undefined
			? `第${ch.data.chapter}章 ${ch.data.title}`
			: ch.data.title;
		items.push(await renderEntry(ch, chTitle, ch.data.description || "", getChapterUrl(slug, ch.id)));
	}

	return rss({
		title: novelTitle,
		description,
		site: novelUrl,
		items,
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
