import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

/**
 * 图片灯箱：在 PhotoSwipe 之上补齐 Fancybox 那几样能力
 * ---------------------------------------------------------------------------
 * 两个坑（都踩过）：
 *  1. PhotoSwipe 5 的实例上**没有** getNumItems() / getItemData()。
 *  2. lightbox 模式下 `pswp.options.dataSource` 是 `{ gallery, children }`
 *     对象而不是数组，`.length` 是 undefined —— 所以总数和项数据要按
 *     DataSource 的三种形态分别取（数组 / { items } / { gallery }）。
 *
 * 调试：打开一张图后，控制台可读
 *   window.__lightbox            —— PhotoSwipeLightbox 实例
 *   window.__lightboxDebug       —— 缩略图构建过程的状态快照
 */

const CLOSE_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>';

const ZOOM_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M340-540h-40q-17 0-28.5-11.5T260-580q0-17 11.5-28.5T300-620h40v-40q0-17 11.5-28.5T380-700q17 0 28.5 11.5T420-660v40h40q17 0 28.5 11.5T500-580q0 17-11.5 28.5T460-540h-40v40q0 17-11.5 28.5T380-460q-17 0-28.5-11.5T340-500v-40Zm40 220q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>';

export type LightboxOptions = {
	/** 触发灯箱的图片选择器 */
	gallery: string;
	/** 限定 gallery 内参与灯箱的子元素（默认取 gallery 自身匹配到的图片） */
	children?: string;
	/** 是否显示底部缩略图条，默认 true */
	thumbstrip?: boolean;
	/** 是否显示工具栏按钮（1:1 / 全屏 / 幻灯片），默认 true */
	toolbar?: boolean;
};

type LightboxItem = { src: string; alt?: string };

type DebugState = {
	registered: boolean;
	onInit: boolean;
	itemsCount: number;
	reason: string;
	dataSourceKind: string;
};

let current: PhotoSwipeLightbox | null = null;
let slideshowTimer: number | null = null;

function debugState(): DebugState {
	const w = window as unknown as { __lightboxDebug?: DebugState };
	if (!w.__lightboxDebug) {
		w.__lightboxDebug = {
			registered: false,
			onInit: false,
			itemsCount: 0,
			reason: "not started",
			dataSourceKind: "unknown",
		};
	}
	return w.__lightboxDebug;
}

const SLIDESHOW_SECONDS = 3;

function stopSlideshow(el?: HTMLElement): void {
	if (slideshowTimer !== null) {
		window.clearInterval(slideshowTimer);
		slideshowTimer = null;
	}
	// 允许被当作事件监听器调用：那时第一个参数是 Event，不是按钮
	if (el instanceof HTMLElement) {
		el.classList.remove("is-playing");
		el.textContent = "▶";
	}
}

export function destroyLightbox(): void {
	stopSlideshow();
	if (current) {
		current.destroy();
		current = null;
	}
}

/**
 * 统一从 DataSource 的三种形态里取图片：
 *   - 数组（直接传 items）
 *   - { gallery, children }（lightbox 模式，解析后的 DOM 元素在 dataSource.items）
 *   - { gallery }（还没解析时，自己按选择器查）
 */
function collectItems(pswp: any): LightboxItem[] {
	const ds = pswp?.options?.dataSource;
	const dbg = debugState();

	if (!ds) {
		dbg.dataSourceKind = "missing";
		return [];
	}

	const fromElement = (el: HTMLImageElement): LightboxItem => ({
		src: el.currentSrc || el.src,
		alt: el.alt,
	});

	if (Array.isArray(ds)) {
		dbg.dataSourceKind = "array";
		return ds.map((item: any) => ({ src: item?.src ?? item?.msrc ?? "", alt: item?.alt }));
	}

	if (Array.isArray(ds.items)) {
		dbg.dataSourceKind = "gallery.items";
		return (ds.items as HTMLImageElement[]).map(fromElement);
	}

	if (typeof ds.gallery === "string") {
		dbg.dataSourceKind = "gallery.selector";
		return Array.from(document.querySelectorAll<HTMLImageElement>(ds.gallery)).map(fromElement);
	}

	dbg.dataSourceKind = "unknown";
	return [];
}

/** 底部缩略图条：点击跳转 + 当前项高亮 + 自动滚动到可见 */
function registerThumbstrip(pswp: any): void {
	const dbg = debugState();
	dbg.registered = true;

	pswp.ui.registerElement({
		name: "thumbstrip",
		className: "pswp-thumbstrip",
		tagName: "div",
		order: 9,
		isButton: false,
		appendTo: "root",
		onInit: (el: HTMLElement) => {
			dbg.onInit = true;
			el.setAttribute("role", "tablist");
			el.setAttribute("aria-label", "图片缩略图");

			let buttons: HTMLButtonElement[] = [];
			let built = false;

			const sync = () => {
				if (!buttons.length) return;
				const index = pswp.currIndex;
				buttons.forEach((btn, i) => {
					const active = i === index;
					btn.classList.toggle("is-active", active);
					btn.setAttribute("aria-selected", String(active));
				});
				const activeEl = buttons[index];
				if (!activeEl) return;
				const box = el.getBoundingClientRect();
				const rect = activeEl.getBoundingClientRect();
				// 只在超出可视范围时滚动，避免每切换一张都抖一下
				if (rect.left < box.left || rect.right > box.right) {
					activeEl.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
				}
			};

			const build = () => {
				if (built) return;
				const items = collectItems(pswp);
				dbg.itemsCount = items.length;
				// 单张图没有跳转的必要
				if (items.length < 2) {
					dbg.reason = "items < 2";
					return;
				}
				built = true;
				dbg.reason = "built";

				for (let i = 0; i < items.length; i++) {
					const btn = document.createElement("button");
					btn.type = "button";
					btn.className = "pswp-thumb";
					btn.setAttribute("aria-label", `第 ${i + 1} 张`);

					const img = document.createElement("img");
					img.src = items[i].src;
					img.loading = "lazy";
					img.alt = "";
					btn.appendChild(img);

					btn.addEventListener("click", () => pswp.goTo(i));
					el.appendChild(btn);
					buttons.push(btn);
				}

				pswp.on("change", sync);
				sync();
			};

			// uiRegister 阶段 dataSource 通常已解析；万一还没，等第一次 change
			build();
			if (!built) pswp.on("change", build);
		},
	});
}

/** 工具栏：1:1、全屏、幻灯片（放大/关闭由 PhotoSwipe 自带） */
function registerToolbar(pswp: any): void {
	pswp.ui.registerElement({
		name: "oneToOne",
		order: 11,
		isButton: true,
		html: "1:1",
		title: "实际大小",
		onClick: () => pswp.zoomTo(1),
	});

	pswp.ui.registerElement({
		name: "fullscreen",
		order: 12,
		isButton: true,
		html: "⛶",
		title: "全屏",
		onClick: () => {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			} else {
				document.documentElement.requestFullscreen?.();
			}
		},
	});

	pswp.ui.registerElement({
		name: "slideshow",
		order: 13,
		isButton: true,
		html: "▶",
		title: "幻灯片",
		onClick: (_event: Event, el: HTMLElement) => {
			if (slideshowTimer !== null) {
				stopSlideshow(el);
				return;
			}
			el.classList.add("is-playing");
			let remaining = SLIDESHOW_SECONDS;
			const render = () => {
				el.textContent = `⏸ ${remaining}`;
			};
			render();
			// 每秒走一格：先走倒计时，归零时切图并复位
			slideshowTimer = window.setInterval(() => {
				remaining -= 1;
				if (remaining <= 0) {
					remaining = SLIDESHOW_SECONDS;
					const total = collectItems(pswp).length;
					if (total > 0 && pswp.currIndex >= total - 1) {
						pswp.goTo(0);
					} else {
						pswp.next();
					}
				}
				render();
			}, 1000);
		},
	});

	pswp.on("close", () => stopSlideshow());
}

export function createLightbox(options: LightboxOptions): PhotoSwipeLightbox {
	destroyLightbox();

	const lightbox = new PhotoSwipeLightbox({
		gallery: options.gallery,
		children: options.children,
		pswpModule: () => import("photoswipe"),
		closeSVG: CLOSE_SVG,
		zoomSVG: ZOOM_SVG,
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		wheelToZoom: true,
		arrowPrev: false,
		arrowNext: false,
		imageClickAction: "close",
		tapAction: "close",
		doubleTapAction: "zoom",
		bgOpacity: 0.94,
		counter: true,
	});

	// 有些图的 naturalWidth 在 DOM 里取不到（懒加载 / 装饰性图片），
	// 用视口尺寸兜底，避免 PhotoSwipe 算出 0×0 的画布。
	lightbox.addFilter("domItemData", (itemData, element) => {
		if (element instanceof HTMLImageElement) {
			itemData.src = element.src;
			itemData.w = Number(element.naturalWidth || window.innerWidth);
			itemData.h = Number(element.naturalHeight || window.innerHeight);
			itemData.msrc = element.src;
			itemData.alt = element.alt;
		}
		return itemData;
	});

	lightbox.on("uiRegister", () => {
		const pswp = lightbox.pswp;
		if (!pswp) return;
		if (options.thumbstrip !== false) registerThumbstrip(pswp);
		if (options.toolbar !== false) registerToolbar(pswp);
	});

	lightbox.init();
	current = lightbox;
	// 调试入口
	(window as unknown as { __lightbox?: PhotoSwipeLightbox }).__lightbox = lightbox;
	return lightbox;
}
