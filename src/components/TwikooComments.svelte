<script lang="ts">
import { onMount } from "svelte";
import { siteConfig } from "../config";

const { envId, region, lang, cdn, css } = siteConfig.twikoo || {};

onMount(() => {
	if (!envId) return;

	const twikooCDN = cdn || "https://registry.npmmirror.com/twikoo/1.7.12/files/dist/twikoo.all.min.js";
	let loaded = false;

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
			if ((window as any).twikoo) {
				(window as any).twikoo.init({
					envId,
					el: document.getElementById("tcomment"),
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
	}
});
</script>

<div id="tcomment"></div>
