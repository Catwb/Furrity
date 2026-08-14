import path from "node:path";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { PAGE_SIZE } from "../constants/constants";
import { siteConfig } from "../config/site";
import { getSortedPosts } from "../utils/content-utils";
import { computeAbbrlink } from "../utils/abbrlink-utils";
import { getNovelMetas } from "../utils/novel-utils";
import { getNovelUrl, getChapterUrl } from "../utils/url-utils";

export async function GET(context: APIContext) {
	const origin = (siteConfig.canonical?.origin ?? context.site?.origin ?? "").replace(/\/$/, "");

	const posts = await getSortedPosts();
	const abbrConfig = siteConfig.abbrlink || {};
	const alg = abbrConfig.alg || "crc16";
	const rep = abbrConfig.rep || "dec";

	const postUrls = posts.map((post) => {
		const slug = post.data.abbrlink || computeAbbrlink(post.data.title, post.data.published, alg as any, rep as any);
		const lastmod = post.data.updated || post.data.published;
		return { loc: `${origin}/posts/${slug}/`, lastmod: lastmod.toISOString().slice(0, 10) };
	});

	const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
	const paginationUrls = [];
	for (let i = 2; i <= totalPages; i++) {
		paginationUrls.push({ loc: `${origin}/${i}/`, lastmod: "" });
	}

	const novels = await getNovelMetas();
	const novelUrls = [];
	for (const novel of novels) {
		novelUrls.push({ loc: `${origin}${getNovelUrl(novel.slug)}`, lastmod: "" });
		for (const chapter of novel.chapters) {
			novelUrls.push({ loc: `${origin}${getChapterUrl(novel.slug, chapter.id)}`, lastmod: "" });
		}
	}

	const fursonas = await getCollection("fursonas");
	const fursonaUrls = fursonas.map((oc) => {
		const slug = path.parse(oc.id).name;
		return { loc: `${origin}/about/furryoc/${slug}/`, lastmod: "" };
	});

	const staticPages = getStaticPageUrls();

	const urls = [
		...staticPages.map((p) => ({ loc: `${origin}${p}`, lastmod: "" })),
		...paginationUrls,
		...fursonaUrls,
		...novelUrls,
		...postUrls,
	];

	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...urls.map((u) =>
			`  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`,
		),
		`</urlset>`,
	].join("\n");

	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
}

function escapeXml(s: unknown): string {
	const str = typeof s === "string" ? s : String(s ?? "");
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function getStaticPageUrls(): string[] {
	const modules = import.meta.glob("./**/*.astro", { eager: false });
	const urls = new Set<string>();
	for (const file of Object.keys(modules)) {
		// 形如 ./about/me.astro → about/me
		let rel = file.replace(/^\.\//, "").replace(/\.astro$/, "");
		// 跳过动态路由（含 [ 参数）与非页面文件
		if (rel.includes("[")) continue;
		if (rel === "rss" || rel === "atom" || rel === "robots") continue;
		if (rel === "index") {
			urls.add("/");
			continue;
		}
		// 目录 index → 上级路径
		if (rel.endsWith("/index")) rel = rel.slice(0, -6);
		const p = rel === "" ? "/" : `/${rel}/`;
		urls.add(p);
	}
	return [...urls];
}
