<script lang="ts">
import { onMount } from "svelte";
import { siteConfig } from "../config/site";

const { envId, region, lang, cdn, css } = siteConfig.twikoo || {};

let loading = $state(true);

onMount(() => {
	if (!envId) return;

	const twikooCDN = cdn || "https://cdnjs.cloudflare.com/ajax/libs/twikoo/1.7.19/twikoo.min.js";
	let loaded = false;
	let observer: MutationObserver | null = null;
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	/**
	 * 表情面板是 absolute 浮层，超出卡片的部分会被卡片的 overflow: hidden
	 * 裁掉。这里量出面板底部超出卡片底部的距离，给卡片补 padding-bottom，
	 * 让卡片自己伸长把面板包进去；面板仍是浮层，位置和遮挡行为都不变。
	 */
	function syncCardHeight() {
		const owo = document.querySelector<HTMLElement>(".twikoo .OwO");
		const body = owo?.querySelector<HTMLElement>(".OwO-body");
		const card = owo?.closest<HTMLElement>(".card-base");
		if (!owo || !body || !card) return;

		if (!owo.classList.contains("OwO-open")) {
			card.style.paddingBottom = "";
			return;
		}

		// 先还原再量，避免上一次补的高度影响测量
		card.style.paddingBottom = "";
		const overflow = body.getBoundingClientRect().bottom - card.getBoundingClientRect().bottom;
		if (overflow <= 0) return;
		const base = Number.parseFloat(getComputedStyle(card).paddingBottom) || 0;
		card.style.paddingBottom = `${Math.ceil(base + overflow + 16)}px`;
	}

	function bindOwo() {
		const owo = document.querySelector<HTMLElement>(".twikoo .OwO");
		if (!owo) return false;
		observer?.disconnect();
		observer = new MutationObserver(syncCardHeight);
		observer.observe(owo, { attributes: true, attributeFilter: ["class"] });
		window.addEventListener("resize", syncCardHeight);
		return true;
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
				// .OwO 由 twikoo 异步渲染，等它出现后再挂监听
				pollTimer = setInterval(() => {
					if (bindOwo() && pollTimer) {
						clearInterval(pollTimer);
						pollTimer = null;
					}
				}, 300);
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
		observer?.disconnect();
		if (pollTimer) clearInterval(pollTimer);
		window.removeEventListener("resize", syncCardHeight);
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
