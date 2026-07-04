<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { siteConfig } from "../config";

const twikooConfig = siteConfig.twikoo;
const TWIKOO_CDN = twikooConfig?.cdn || "https://registry.npmmirror.com/twikoo/1.7.12/files/dist/twikoo.all.min.js";

let loaded = $state(false);
let cssLoaded = $state(false);
let twikooReady = $state(false);

function getDarkMode(): boolean {
	return document.documentElement.classList.contains("dark");
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

function destroyTwikoo() {
	const el = document.getElementById("tcomment");
	if (el) el.innerHTML = "";
}

async function initTwikoo(path?: string) {
	if (!twikooConfig?.envId) return;
	const twikoo = (window as any).twikoo;
	if (!twikoo) return;

	const el = document.getElementById("tcomment");
	if (!el) return;

	el.innerHTML = "";

	try {
		await twikoo.init({
			envId: twikooConfig.envId,
			el: "#tcomment",
			path: path || window.location.pathname,
			region: twikooConfig.region || "",
			lang: twikooConfig.lang || "",
			dark: getDarkMode(),
		});
	} catch (e) {
		console.error("Twikoo init error:", e);
	}
}

function loadCustomCSS(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (cssLoaded) {
			resolve();
			return;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		link.onload = () => {
			cssLoaded = true;
			resolve();
		};
		link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
		document.head.appendChild(link);
	});
}

async function setup() {
	if (!twikooConfig?.enable || !twikooConfig?.envId) return;

	try {
		if (twikooConfig.css) {
			await loadCustomCSS(twikooConfig.css);
		}
		await loadTwikooScript();
		twikooReady = true;
		await initTwikoo();
		loaded = true;
	} catch (e) {
		console.error("Twikoo init failed:", e);
	}
}

onMount(async () => {
	await setup();

	// Swup contentReplaced fires after new content is in the DOM
	const onContentReplaced = async () => {
		destroyTwikoo();
		loaded = false;
		if (twikooReady) {
			await initTwikoo();
			loaded = true;
		}
	};

	window.addEventListener("swup:contentReplaced", onContentReplaced);

	return () => {
		window.removeEventListener("swup:contentReplaced", onContentReplaced);
	};
});

onDestroy(() => {
	destroyTwikoo();
});
</script>

<div id="tcomment" class="twikoo-comments"></div>
