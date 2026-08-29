<script lang="ts">
import { onMount } from "svelte";
import { siteConfig } from "../config/site";

const { envId, region, lang, cdn, css } = siteConfig.twikoo || {};

let loading = $state(true);

onMount(() => {
	if (!envId) return;

	const twikooCDN = cdn || "https://cdnjs.cloudflare.com/ajax/libs/twikoo/1.7.19/twikoo.min.js";
	let loaded = false;

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
});
</script>

{#if loading}
<div class="flex flex-col items-center justify-center py-12 gap-3">
	<div class="w-8 h-8 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
	<p class="text-sm text-black/50 dark:text-white/50">加载评论中...</p>
</div>
{/if}
<div id="tcomment"></div>
