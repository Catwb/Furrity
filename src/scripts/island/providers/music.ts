import type { IslandBus, IslandMoment } from "../bus";

/**
 * 音乐 provider
 * ---------------------------------------------------------------------------
 * MusicManager.astro 已经把需要的东西全抛在 window 上了：
 *   fm:track / fm:play-state / fm:time / fm:lrc-index / fm:lyrics / fm:volume
 * 所以这里零改动别人的代码，只做订阅 + 渲染。
 *
 * 两个性能约定（都写过教训，别改回去）：
 *   1. fm:time 的源头是 audio 的 timeupdate，约 4Hz。折叠态**也要**跟随，
 *      因为折叠态同样能看到底部那条 2px 进度条 —— 之前这里直接 return，
 *      结果收起后进度条冻在原地，看起来像坏了。
 *   2. 但绝不 1:1 转发：折叠态 1Hz 节流（进度条 220ms 过渡，肉眼完全够），
 *      展开态才升到 rAF 合并。两者都走同一个 rAF，不会叠加。
 *
 * render() 拿到的 el 是 #dynamic-island 根节点（不是 body），
 * 所以 data-state / --island-progress 都写在根上，和组件的 data-size 互不打架。
 */

/** 折叠态进度刷新间隔：1Hz。进度条有 220ms 过渡，1Hz 已经是连续流动的观感 */
const COLLAPSED_INTERVAL_MS = 1000;

export function installMusicProvider(bus: IslandBus): () => void {
	const player = window.__fireflyMusic;
	if (!player) return () => {};

	let progressRaf = 0;
	let lrcRaf = 0;
	let lastProgressAt = 0;

	function build(): IslandMoment {
		// size 必须在 push 时就定下来：总线用它算聚合尺寸，
		// 而 render() 是在尺寸定完之后才跑的，写在 render 里会晚一拍。
		const s = player!.getState();
		return {
			id: "player",
			source: "player",
			priority: 40,
			// 播放和暂停都给完整胶囊。
			// 曾经暂停时缩成 40px 圆点（模仿系统灵动岛的静息态），但那样只剩
			// 一个点，底部进度条看不见、圆环又太细看不清 —— 用户反馈"进度丢了"。
			// 这里优先保证信息可读：暂停也保持胶囊，底部横线停在暂停位置。
			size: "compact",
			// 播放中才算活跃。暂停后岛会自动收起（岛自己判断，不靠用户操作）。
			active: s.isPlaying,
			tone: "primary",
			render(el) {
				const s = player!.getState();
				el.dataset.state = s.isPlaying ? "playing" : "paused";

				const titleEl = el.querySelector<HTMLElement>("[data-title]");
				const artistEl = el.querySelector<HTMLElement>("[data-artist]");
				const lrcEl = el.querySelector<HTMLElement>("[data-lyric]");

				const name = s.track?.name ?? "未在播放";
				if (titleEl) titleEl.textContent = name;
				if (artistEl) artistEl.textContent = s.track?.artist ?? "";

				if (lrcEl) {
					const line = s.lyrics?.[s.currentLrcIndex];
					lrcEl.textContent = line?.text ?? s.track?.artist ?? "";
				}

				el.style.setProperty(
					"--island-progress",
					`${Math.max(0, Math.min(100, s.progress || 0))}%`,
				);
				el.style.setProperty(
					"--island-poster",
					s.track?.pic ? `url("${s.track.pic}")` : "none",
				);

				const playBtn = el.querySelector<HTMLButtonElement>("[data-act='play']");
				if (playBtn) {
					playBtn.setAttribute("aria-label", s.isPlaying ? "暂停" : "播放");
					playBtn.dataset.playing = s.isPlaying ? "true" : "false";
				}
			},
		};
	}

	const refresh = () => {
		// 没有歌（meting 离线 / 歌单为空）就整条撤掉，不留一个干瘪的圆点在 navbar 里闪
		if (!player!.getState().track) {
			bus.drop("player");
			return;
		}
		bus.push(build());
	};

	refresh(); // 首次也走同一条路径，避免"没歌却先挂了个圆点"

	window.addEventListener("fm:track", refresh);
	window.addEventListener("fm:play-state", refresh);
	window.addEventListener("fm:volume", refresh);
	window.addEventListener("fm:lyrics", refresh);

	// 高频事件：折叠态 1Hz 节流，展开态 rAF 合并；两者共用同一个 rAF
	const onTime = () => {
		if (progressRaf) return;

		if (!bus.expanded) {
			// 折叠态：节流。进度条只有 2px 高，1Hz 足够，也不会让 bus 频繁重排
			const now = performance.now();
			if (now - lastProgressAt < COLLAPSED_INTERVAL_MS) return;
			lastProgressAt = now;
		}

		progressRaf = requestAnimationFrame(() => {
			progressRaf = 0;
			bus.touch();
		});
	};

	const onLrc = () => {
		// 歌词行只在展开态可见，折叠态没必要刷新
		if (!bus.expanded) return;
		if (lrcRaf) return;
		lrcRaf = requestAnimationFrame(() => {
			lrcRaf = 0;
			bus.touch();
		});
	};

	window.addEventListener("fm:time", onTime);
	window.addEventListener("fm:lrc-index", onLrc);

	return () => {
		window.removeEventListener("fm:track", refresh);
		window.removeEventListener("fm:play-state", refresh);
		window.removeEventListener("fm:volume", refresh);
		window.removeEventListener("fm:lyrics", refresh);
		window.removeEventListener("fm:time", onTime);
		window.removeEventListener("fm:lrc-index", onLrc);
		if (progressRaf) cancelAnimationFrame(progressRaf);
		if (lrcRaf) cancelAnimationFrame(lrcRaf);
		bus.drop("player");
	};
}
