<script lang="ts">
import { onMount } from "svelte";
import { siteConfig } from "../config/site";

const { envId, region, lang, cdn, css } = siteConfig.twikoo || {};

let loading = $state(true);

onMount(() => {
	if (!envId) return;

	const twikooCDN = cdn || "https://cdnjs.cloudflare.com/ajax/libs/twikoo/1.7.19/twikoo.min.js";
	let loaded = false;
	let rootObserver: MutationObserver | null = null;
	const bound = new WeakSet<HTMLElement>();

	/**
	 * 表情面板是 absolute 浮层，超出卡片的部分会被卡片的 overflow: hidden
	 * 裁掉。主提交框和每条评论的回复框各有一个 .OwO（回复框的是点开回复后
	 * 才创建的），这里统一接管：量出每个打开面板底部超出卡片的距离，取最大
	 * 值给卡片补 padding-bottom，让卡片自己伸长把面板包进去；面板仍是浮层，
	 * 位置和遮挡行为都不变。
	 */
	function syncCards() {
		const owos = [...document.querySelectorAll<HTMLElement>(".twikoo .OwO")];
		const cards = new Set<HTMLElement>();
		for (const owo of owos) {
			const card = owo.closest<HTMLElement>(".card-base");
			if (card) cards.add(card);
		}
		// 先还原再量，避免上一次补的高度影响测量
		for (const card of cards) card.style.paddingBottom = "";

		const need = new Map<HTMLElement, number>();
		for (const owo of owos) {
			if (!owo.classList.contains("OwO-open")) continue;
			const body = owo.querySelector<HTMLElement>(".OwO-body");
			const card = owo.closest<HTMLElement>(".card-base");
			if (!body || !card) continue;
			const overflow = body.getBoundingClientRect().bottom - card.getBoundingClientRect().bottom;
			if (overflow <= 0) continue;
			const base = Number.parseFloat(getComputedStyle(card).paddingBottom) || 0;
			need.set(card, Math.max(need.get(card) ?? 0, base + overflow + 16));
		}
		for (const [card, padding] of need) {
			card.style.paddingBottom = `${Math.ceil(padding)}px`;
		}
	}

	function bindAll() {
		let added = false;
		for (const owo of document.querySelectorAll<HTMLElement>(".twikoo .OwO")) {
			if (bound.has(owo)) continue;
			bound.add(owo);
			new MutationObserver(syncCards).observe(owo, {
				attributes: true,
				attributeFilter: ["class"],
			});
			added = true;
		}
		if (added) syncCards();
	}

	function watchComments() {
		const root = document.getElementById("tcomment");
		if (!root) return;
		bindAll();
		rootObserver?.disconnect();
		rootObserver = new MutationObserver(bindAll);
		rootObserver.observe(root, { childList: true, subtree: true });
		window.addEventListener("resize", syncCards);
	}

	function hideLoader() {
		loading = false;
	}

	function loadComments() {
		if (loaded) return;
		loaded = true;

		if (css) {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = css;
			document.head.appendChild(link);
		}

		const script = document.createElement("script");
		script.src = twikooCDN;
		script.async = true;
		script.onload = () => {
			hideLoader();
			const el = document.getElementById("tcomment");
			if ((window as any).twikoo && el) {
				(window as any).twikoo.init({
					envId,
					el,
					path: window.location.pathname,
					region: region || "",
					lang: lang || "",
				});
				// 回复框的 .OwO 是点开回复后才创建的，用 MutationObserver 持续接管
				watchComments();
			}
		};
		document.head.appendChild(script);
	}

	if ("IntersectionObserver" in window) {
		const el = document.getElementById("tcomment");
		if (el) {
			const obs = new IntersectionObserver((entries) => {
				if (entries[0]?.isIntersecting) {
					loadComments();
					obs.disconnect();
				}
			}, { rootMargin: "200px" });
			obs.observe(el);
		}
	} else {
		loadComments();
	}

	return () => {
		rootObserver?.disconnect();
		window.removeEventListener("resize", syncCards);
	};
});
</script>

{#if loading}
<div class="flex flex-col items-center justify-center py-12 gap-3">
	<div class="w-8 h-8 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
	<p class="text-sm text-black/50 dark:text-white/50">加载评论中...</p>
</div>
{/if}
<div id="tcomment"></div>
