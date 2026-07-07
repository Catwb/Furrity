<script lang="ts">
import { onMount } from "svelte";
import { siteConfig } from "../config";

const { envId, region, lang, cdn, css } = siteConfig.twikoo || {};

onMount(() => {
	if (!envId) return;

	const twikooCDN = cdn || "https://registry.npmmirror.com/twikoo/1.7.12/files/dist/twikoo.all.min.js";

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
});
</script>

<div id="tcomment"></div>
