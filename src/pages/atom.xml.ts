import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import { computeAbbrlink } from "@utils/abbrlink-utils";
import type { APIContext } from "astro";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();
	const container = await AstroContainer.create();
	const abbrConfig = siteConfig.abbrlink || {};
	const alg = abbrConfig.alg || "crc16";
	const rep = abbrConfig.rep || "dec";
	const siteUrl = context.site ?? "https://fuwari.vercel.app";

	const entries = await Promise.all(
		blog.map(async (post) => {
			let content: string;
			try {
				const { Content } = await render(post);
				const rawHtml = await container.renderToString(Content);
				content = sanitizeHtml(rawHtml, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				});
			} catch {
				content = post.data.description || "";
			}
			const linkSlug = post.data.abbrlink || computeAbbrlink(post.data.title, post.data.published, alg as any, rep as any);
			const link = url(`/posts/${linkSlug}/`);
			const updated = post.data.updated || post.data.published;
			return { title: post.data.title, published: post.data.published, updated, link, description: post.data.description || "", content };
		}),
	);

	const feedUrl = siteUrl + "/atom.xml";
	const updated = entries.length > 0 ? entries[0].updated.toISOString() : new Date().toISOString();

	const feed = [
		`<?xml version="1.0" encoding="utf-8"?>`,
		`<feed xmlns="http://www.w3.org/2005/Atom">`,
		`  <title>${escapeXml(siteConfig.title)}</title>`,
		`  <subtitle>${escapeXml(siteConfig.subtitle || "")}</subtitle>`,
		`  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml"/>`,
		`  <link href="${escapeXml(siteUrl)}" rel="alternate" type="text/html"/>`,
		`  <updated>${updated}</updated>`,
		`  <id>${escapeXml(feedUrl)}</id>`,
		...entries.map((e) => [
			`  <entry>`,
			`    <title>${escapeXml(e.title)}</title>`,
			`    <link href="${escapeXml(e.link)}" rel="alternate" type="text/html"/>`,
			`    <id>${escapeXml(e.link)}</id>`,
			`    <published>${e.published.toISOString()}</published>`,
			`    <updated>${e.updated.toISOString()}</updated>`,
			`    <summary>${escapeXml(e.description)}</summary>`,
			`    <content type="html"><![CDATA[${e.content}]]></content>`,
			`  </entry>`,
		].join("\n")),
		`</feed>`,
	].join("\n");

	return new Response(feed, {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
}

function escapeXml(s: unknown): string {
	if (typeof s !== "string") s = String(s ?? "");
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
