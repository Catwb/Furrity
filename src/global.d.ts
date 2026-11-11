import type { AstroIntegration } from "@swup/astro";
import type { IslandBus } from "./scripts/island/bus";

declare global {
	// @swup/astro 在 swup 的 page:view 上派发，用来模拟 Astro 的页面加载生命周期
	interface DocumentEventMap {
		"astro:page-load": Event;
		"swup:enable": Event;
	}

	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};
		// 下面几个都是"脚本可能被重复执行"的全局守卫，见各自文件头注释
		__islandBus?: IslandBus;
		__islandInit?: boolean;
		__islandDestroy?: () => void;
		/** MusicManager.astro 暴露的播放器门面（见该文件末尾） */
		__fireflyMusic?: {
			init: () => Promise<void> | void;
			getState: () => {
				playlist: Array<{ name: string; artist: string; url: string; pic: string; lrc: string }>;
				currentIndex: number;
				track: { name: string; artist: string; url: string; pic: string; lrc: string } | null;
				isPlaying: boolean;
				playMode: number;
				volume: number;
				isMuted: boolean;
				currentTime: number;
				duration: number;
				progress: number;
				currentTimeStr: string;
				durationStr: string;
				lyrics: Array<{ time: number; text: string }>;
				currentLrcIndex: number;
				initialized: boolean;
				error: string | null;
			};
			togglePlay: () => void;
			playNext: () => void;
			playPrev: () => void;
			cyclePlayMode: () => void;
			setVolume: (val: number) => void;
			toggleMute: () => void;
			seek: (percent: number) => void;
			seekToTime: (time: number) => void;
			playTrackByIndex: (index: number) => void;
			loadTrack: (index: number, autoPlay?: boolean) => void;
		};
	}
}

declare module "@fontsource-variable/jetbrains-mono" {
	const _: never;
	export default _;
}
declare module "@fontsource-variable/jetbrains-mono/wght-italic.css" {
	const _: never;
	export default _;
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
