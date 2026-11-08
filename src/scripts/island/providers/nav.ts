import type { IslandBus } from "../bus";

/**
 * 页面/Link 事件 provider
 * ---------------------------------------------------------------------------
 * 两件事：
 *   1. swup 换页时闪一下"载入中"，让岛成为页面状态的指示器（跨页存活的好处）；
 *   2. 加密文章解锁（password:decrypted）时弹一条短暂提示。
 *
 * 注意：这里只监听 swup 的钩子，绝不碰 window.onscroll ——
 * Layout.astro:634 是直接赋值占用的，谁再赋一次就把导航的滚动逻辑覆盖了。
 */

const NAV_ID = "island-nav";
const NOTICE_ID = "island-notice";

export function installNavProvider(bus: IslandBus): () => void {
	let navTimer = 0;

	function showNavigating() {
		bus.push({
			id: NAV_ID,
			source: "nav",
			priority: 60,
			size: "mini",
			tone: "primary",
			ttl: 6000, // 兜底：万一下一次 page:view 没来
			// 换页提示不该把已经收起的岛叫醒 —— 用户翻页时岛突然冒出来很吵。
			// 但岛本来就显示着（比如音乐在放）时，它照样能显示"载入中"。
			wake: false,
			render(el) {
				el.dataset.state = "navigating";
				el.dataset.size = "mini";
				el.style.setProperty("--island-progress", "0%");
				el.style.setProperty("--island-poster", "none");
			},
		});
	}

	function clearNavigating() {
		clearTimeout(navTimer);
		navTimer = window.setTimeout(() => bus.drop(NAV_ID), 260);
	}

	// swup 没起来时（比如首访脚本还在路上）也要能挂上
	function bindSwup(): boolean {
		const swup = window.swup;
		if (!swup?.hooks) return false;
		swup.hooks.on("visit:start", showNavigating);
		swup.hooks.on("page:view", clearNavigating);
		return true;
	}

	let bound = bindSwup();
	let retryTimer = 0;
	if (!bound) {
		let tries = 0;
		retryTimer = window.setInterval(() => {
			tries += 1;
			if (bindSwup() || tries > 20) {
				clearInterval(retryTimer);
				retryTimer = 0;
			}
		}, 250);
	}

	const onDecrypted = () => {
		bus.push({
			id: NOTICE_ID,
			source: "notice",
			priority: 70,
			size: "compact",
			ttl: 3200,
			tone: "accent",
			render(el) {
				el.dataset.state = "notice";
				el.dataset.size = "compact";
				const titleEl = el.querySelector<HTMLElement>("[data-title]");
				const artistEl = el.querySelector<HTMLElement>("[data-artist]");
				if (titleEl) titleEl.textContent = "内容已解锁";
				if (artistEl) artistEl.textContent = "加密正文已展开";
				el.style.setProperty("--island-progress", "100%");
				el.style.setProperty("--island-poster", "none");
			},
		});
	};

	document.addEventListener("password:decrypted", onDecrypted);

	return () => {
		document.removeEventListener("password:decrypted", onDecrypted);
		clearTimeout(navTimer);
		if (retryTimer) clearInterval(retryTimer);
		bus.drop(NAV_ID);
		bus.drop(NOTICE_ID);
	};
}
