import type { IslandBus } from "../bus";

/**
 * 首屏进度 provider
 * ---------------------------------------------------------------------------
 * 数据源是 PageLoader 在 setProgress() 里派发的 loader:progress 事件
 * （见 PageLoader.astro）。用事件而不是 MutationObserver 扒 #loader-percent
 * 的文本：少一次布局读取，也不用猜 loader 的 DOM 结构。
 *
 * 结束判定不靠事件，靠 loader 元素的 .hide 类：PageLoader 在淡出后才加 .hide，
 * 那一刻把岛上的进度换回常规内容。另有一条 window load 后的兜底，防止
 * MutationObserver 因为元素被 swup 换掉而失联。
 */

interface LoaderProgressDetail {
	percent: number;
}

export function installLoaderProvider(bus: IslandBus): () => void {
	let done = false;
	let hideObserver: MutationObserver | null = null;
	let graceTimer = 0;
	let boundEl: HTMLElement | null = null;

	function push(percent: number) {
		if (done) return;
		bus.push({
			id: "loader",
			source: "loader",
			priority: 80, // 高于播放器：首屏期间进度更重要
			size: "compact",
			tone: "accent",
			render(el) {
				const p = Math.round(Math.max(0, Math.min(100, percent)));
				el.dataset.state = "loading";
				const titleEl = el.querySelector<HTMLElement>("[data-title]");
				const artistEl = el.querySelector<HTMLElement>("[data-artist]");
				if (titleEl) titleEl.textContent = "正在载入";
				if (artistEl) artistEl.textContent = `${p}%`;
				el.style.setProperty("--island-progress", `${p}%`);
				el.style.setProperty("--island-poster", "none");
			},
		});
	}

	function finish() {
		if (done) return;
		done = true;
		// 停留一小会儿再说再见，否则 100% 一闪而过像闪屏
		graceTimer = window.setTimeout(() => bus.drop("loader"), 400);
	}

	const onProgress = (e: Event) => {
		const detail = (e as CustomEvent<LoaderProgressDetail>).detail;
		if (typeof detail?.percent === "number") push(detail.percent);
	};

	const onLoad = () => {
		// 留 1.2s 给剩下的档位走完，再收
		graceTimer = window.setTimeout(finish, 1200);
	};

	function bindLoader() {
		const el = document.getElementById("page-loader");
		if (!el || el === boundEl) return !!boundEl;
		boundEl = el;
		if (el.classList.contains("hide")) {
			done = true;
			return true;
		}
		hideObserver = new MutationObserver(() => {
			if (el.classList.contains("hide")) finish();
		});
		hideObserver.observe(el, { attributes: true, attributeFilter: ["class"] });
		return true;
	}

	bindLoader();

	window.addEventListener("loader:progress", onProgress);
	if (!done) {
		window.addEventListener("load", onLoad, { once: true });
	}

	return () => {
		window.removeEventListener("loader:progress", onProgress);
		window.removeEventListener("load", onLoad);
		hideObserver?.disconnect();
		clearTimeout(graceTimer);
		bus.drop("loader");
	};
}
