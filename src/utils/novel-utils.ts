import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

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
		const key = ch.data.novel;
		if (!grouped.has(key)) grouped.set(key, []);
		grouped.get(key)!.push(ch);
	}

	const metas: NovelMeta[] = [];
	for (const idx of indexEntries) {
		const key = idx.data.novel;
		const chapters = (grouped.get(key) || []).sort(
			(a, b) => (a.data.chapter ?? 0) - (b.data.chapter ?? 0),
		);
		const wordCount = chapters.reduce((sum, ch) => sum + computeWordCount(ch.body), 0);
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

export async function getNovelChapters(novelSlug: string): Promise<NovelEntry[]> {
	const entries = await getAllNovelEntries();
	return entries
		.filter((e) => e.data.novel === novelSlug && e.data.chapter !== undefined)
		.sort((a, b) => (a.data.chapter ?? 0) - (b.data.chapter ?? 0));
}

export async function getNovelIndex(novelSlug: string): Promise<NovelEntry | undefined> {
	const entries = await getAllNovelEntries();
	return entries.find((e) => e.data.novel === novelSlug && !e.data.chapter);
}

export async function getAllCharacters(): Promise<CharacterEntry[]> {
	return await getCollection("characters");
}

export async function getCharactersByNovel(novelSlug: string): Promise<CharacterEntry[]> {
	const all = await getAllCharacters();
	return all.filter((c) => c.data.novel === novelSlug);
}

export function getSeriesList(metas: NovelMeta[]): { name: string; novels: NovelMeta[] }[] {
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

import { computeWordCount } from "./word-count";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
