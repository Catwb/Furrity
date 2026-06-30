<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { siteConfig } from "../config";

const twikooConfig = siteConfig.twikoo;
const TWIKOO_CDN = twikooConfig?.cdn || "https://cdn.jsdelivr.net/npm/twikoo@1.6.43/dist/twikoo.all.min.js";

let loaded = $state(false);

function getDarkMode(): boolean {
	return document.documentElement.classList.contains("dark");
}

function observeDarkMode(callback: (dark: boolean) => void): MutationObserver {
	const observer = new MutationObserver(() => {
		callback(getDarkMode());
	});
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
	return observer;
}

function loadTwikooScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if ((window as any).twikoo) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.src = TWIKOO_CDN;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Twikoo"));
		document.head.appendChild(script);
	});
}

async function initTwikoo(path?: string) {
	if (!twikooConfig?.envId) return;
	const twikoo = (window as any).twikoo;
	if (!twikoo) return;

	const el = document.getElementById("tcomment");
	if (!el) return;

	el.innerHTML = "";

	await twikoo.init({
		envId: twikooConfig.envId,
		el: "#tcomment",
		path: path || window.location.pathname,
		region: twikooConfig.region || "",
		lang: twikooConfig.lang || "",
		dark: getDarkMode(),
	});
}

function loadCustomCSS(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		link.onload = () => resolve();
		link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
		document.head.appendChild(link);
	});
}

onMount(async () => {
	if (!twikooConfig?.enable || !twikooConfig?.envId) return;

	try {
		if (twikooConfig.css) {
			await loadCustomCSS(twikooConfig.css);
		}
		await loadTwikooScript();
		await initTwikoo();
		loaded = true;
	} catch (e) {
		console.error("Twikoo init failed:", e);
	}
});

onDestroy(() => {
	const el = document.getElementById("tcomment");
	if (el) el.innerHTML = "";
});
</script>

<div id="tcomment" class="twikoo-comments"></div>
