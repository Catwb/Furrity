import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();
	const container = await AstroContainer.create();

	const items = await Promise.all(
		blog.map(async (post) => {
			try {
				const { Content } = await render(post);
				const rawHtml = await container.renderToString(Content);
				const content = sanitizeHtml(rawHtml, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				});
				return {
					title: post.data.title,
					pubDate: post.data.published,
					description: post.data.description || "",
					link: url(`/posts/${post.slug}/`),
					content,
				};
			} catch {
				return {
					title: post.data.title,
					pubDate: post.data.published,
					description: post.data.description || "",
					link: url(`/posts/${post.slug}/`),
					content: post.data.description || "",
				};
			}
		}),
	);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items,
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
