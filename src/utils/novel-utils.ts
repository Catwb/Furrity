import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type NovelEntry = CollectionEntry<"novels">;
export type CharacterEntry = CollectionEntry<"characters">;

export type NovelMeta = {
	slug: string;
	title: string;
	description: string;
	series?: string;
	seriesOrder?: number;
	wordCount: number;
	chapterCount: number;
	chapters: NovelEntry[];
};

/** 从 entry.id（Content Layer 已全小写化）派生出 novel 的唯一 slug */
export function getNovelSlug(entry: NovelEntry): string {
	const id = entry.id.replace(/\.md$/, "");
	return id.split("/")[0] ?? id;
}

export async function getAllNovelEntries() {
	return await getCollection("novels", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

export async function getNovelMetas(): Promise<NovelMeta[]> {
	const entries = await getAllNovelEntries();

	const indexEntries = entries.filter((e) => !e.data.chapter);
	const chapterEntries = entries.filter((e) => e.data.chapter !== undefined);

	const grouped = new Map<string, NovelEntry[]>();
	for (const ch of chapterEntries) {
		const key = getNovelSlug(ch);
		if (!grouped.has(key)) grouped.set(key, []);
		grouped.get(key)!.push(ch);
	}

	const metas: NovelMeta[] = [];
	for (const idx of indexEntries) {
		const key = getNovelSlug(idx);
		const chapters = (grouped.get(key) || []).sort(
			(a, b) => (a.data.chapter ?? 0) - (b.data.chapter ?? 0),
		);
		const wordCount = chapters.reduce(
			(sum, ch) => sum + computeWordCount(ch.body),
			0,
		);
		metas.push({
			slug: key,
			title: idx.data.novelTitle || idx.data.title,
			description: idx.data.description,
			series: idx.data.series,
			seriesOrder: idx.data.seriesOrder,
			wordCount,
			chapterCount: chapters.length,
			chapters,
		});
	}

	metas.sort((a, b) => (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999));
	return metas;
}

export async function getNovelChapters(
	novelSlug: string,
): Promise<NovelEntry[]> {
	const entries = await getAllNovelEntries();
	return entries
		.filter(
			(e) => getNovelSlug(e) === novelSlug && e.data.chapter !== undefined,
		)
		.sort((a, b) => (a.data.chapter ?? 0) - (b.data.chapter ?? 0));
}

export async function getNovelIndex(
	novelSlug: string,
): Promise<NovelEntry | undefined> {
	const entries = await getAllNovelEntries();
	return entries.find((e) => getNovelSlug(e) === novelSlug && !e.data.chapter);
}

export async function getAllCharacters(): Promise<CharacterEntry[]> {
	try {
		return await getCollection("characters");
	} catch {
		return [];
	}
}

export async function getCharactersByNovel(
	novelSlug: string,
): Promise<CharacterEntry[]> {
	const all = await getAllCharacters();
	const target = novelSlug.toLowerCase();
	return all.filter((c) => getNovelSlugFromName(c.data.novel) === target);
}

function getNovelSlugFromName(novel: string): string {
	return novel.replace(/\.md$/, "").toLowerCase();
}

export function getSeriesList(
	metas: NovelMeta[],
): { name: string; novels: NovelMeta[] }[] {
	const map = new Map<string, NovelMeta[]>();
	for (const m of metas) {
		const key = m.series || i18n(I18nKey.uncategorized);
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(m);
	}
	return Array.from(map.entries())
		.map(([name, novels]) => ({ name, novels }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { computeWordCount } from "./word-count";
