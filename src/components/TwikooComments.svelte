<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { siteConfig } from "../config";

const twikooConfig = siteConfig.twikoo;
const TWIKOO_CDN = twikooConfig?.cdn || "https://registry.npmmirror.com/twikoo/1.7.12/files/dist/twikoo.all.min.js";

let containerEl: HTMLDivElement;
let loaded = $state(false);
let cssLoaded = false;
let scriptLoaded = false;
let cleanupHook: (() => void) | null = null;

function getDarkMode(): boolean {
	return document.documentElement.classList.contains("dark");
}

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (scriptLoaded) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.onload = () => { scriptLoaded = true; resolve(); };
		script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
		document.head.appendChild(script);
	});
}

function loadCSS(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (cssLoaded) {
			resolve();
			return;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		link.onload = () => { cssLoaded = true; resolve(); };
		link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
		document.head.appendChild(link);
	});
}

async function initTwikoo(el: HTMLElement, path?: string) {
	if (!twikooConfig?.envId) return;
	const twikoo = (window as any).twikoo;
	if (!twikoo) return;

	el.innerHTML = "";

	try {
		await twikoo.init({
			envId: twikooConfig.envId,
			el,
			path: path || window.location.pathname,
			region: twikooConfig.region || "",
			lang: twikooConfig.lang || "",
			dark: getDarkMode(),
		});
		loaded = true;
	} catch (e) {
		console.error("Twikoo init error:", e);
	}
}

async function setup(el: HTMLElement) {
	if (!twikooConfig?.enable || !twikooConfig?.envId || !el) return;

	try {
		if (twikooConfig.css) {
			await loadCSS(twikooConfig.css);
		}
		await loadScript(TWIKOO_CDN);
		await initTwikoo(el);
	} catch (e) {
		console.error("Twikoo setup failed:", e);
	}
}

onMount(() => {
	if (!containerEl) return;
	setup(containerEl);

	const onPageView = async () => {
		if (!containerEl || !document.contains(containerEl)) return;
		loaded = false;
		await initTwikoo(containerEl);
	};

	if ((window as any).swup?.hooks) {
		(window as any).swup.hooks.on("page:view", onPageView);
		cleanupHook = () => { (window as any).swup.hooks.off("page:view", onPageView); };
	} else {
		const onEnabled = () => {
			(window as any).swup.hooks.on("page:view", onPageView);
			cleanupHook = () => { (window as any).swup.hooks.off("page:view", onPageView); };
		};
		document.addEventListener("swup:enable", onEnabled);
		cleanupHook = () => { document.removeEventListener("swup:enable", onEnabled); };
	}
});

onDestroy(() => {
	cleanupHook?.();
});
</script>

<div bind:this={containerEl} id="tcomment" class="twikoo"></div>
